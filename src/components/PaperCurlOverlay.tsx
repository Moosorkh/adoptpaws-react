import React, { useEffect, useRef } from 'react';

interface PaperCurlOverlayProps {
  active: boolean;
  onRenderingChange: (rendering: boolean) => void;
  sourceRef: React.RefObject<HTMLElement | null>;
}

interface CurlRuntime {
  dispose: () => void;
  play: () => void;
  reverse: () => void;
}

const FRONT_VERTEX_SHADER = /* glsl */ `
  uniform float uFold;
  uniform float uTilt;

  varying vec2 vUv;
  varying vec3 vViewNormal;
  varying float vCurl;

  void main() {
    vUv = uv;
    vViewNormal = normalize(normalMatrix * normal);
    // How far into the lifted region this fragment sits, following the same
    // slanted fold line the geometry uses.
    float edge = uFold + (uv.y - 0.5) * uTilt;
    vCurl = 1.0 - smoothstep(edge - 0.03, edge + 0.005, uv.x);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRONT_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uFold;
  uniform float uTilt;
  uniform float uProgress;

  varying vec2 vUv;
  varying vec3 vViewNormal;
  varying float vCurl;

  void main() {
    vec4 printColor = texture2D(uMap, vUv);
    vec3 normal = normalize(vViewNormal);
    if (!gl_FrontFacing) normal *= -1.0;

    vec3 viewDirection = vec3(0.0, 0.0, 1.0);
    vec3 lightDirection = normalize(vec3(-0.46, 0.33, 0.82));
    vec3 halfVector = normalize(lightDirection + viewDirection);

    float facing = clamp(dot(normal, viewDirection), 0.0, 1.0);
    float diffuse = max(dot(normal, lightDirection), 0.0);
    // Uncoated stock is rough: a broad, weak sheen. A tight specular is what
    // made this read as bent metal rather than paper.
    float sheen = pow(max(dot(normal, halfVector), 0.0), 5.0) * 0.085;
    float rim = pow(1.0 - facing, 4.0);

    // The flat page darkens in the crease the lifted sheet pulls away from.
    float edge = uFold + (vUv.y - 0.5) * uTilt;
    float crease = 1.0 - 0.20 * uProgress * exp(-max(vUv.x - edge, 0.0) * 30.0);

    vec3 color;
    if (gl_FrontFacing) {
      color = printColor.rgb * mix(0.88, 1.05, diffuse) * crease;
      color += vec3(1.0, 0.98, 0.94) * (sheen + rim * 0.045) * vCurl;
    } else {
      // Paper this thin is never opaque: the print ghosts through from the
      // other face, mirrored about the fold, and the stock warms in shadow.
      vec2 throughUv = vec2(clamp(2.0 * edge - vUv.x, 0.0, 1.0), vUv.y);
      float ink = 1.0 - dot(texture2D(uMap, throughUv).rgb, vec3(0.299, 0.587, 0.114));
      vec3 stock = vec3(0.937, 0.918, 0.867);
      color = stock * (1.0 - ink * 0.14) * mix(0.70, 1.02, diffuse);
      color += vec3(1.0, 0.985, 0.95) * sheen * 0.55;
    }

    gl_FragColor = vec4(color, printColor.a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const SHADOW_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SHADOW_FRAGMENT_SHADER = /* glsl */ `
  uniform float uProgress;
  uniform float uFold;
  varying vec2 vUv;

  uniform float uTilt;

  void main() {
    float bow = sin(vUv.y * 3.14159265) * 0.012 * uProgress;
    float edge = uFold + (vUv.y - 0.5) * uTilt + bow;
    float distanceFromEdge = edge - vUv.x;
    float revealedSide = 1.0 - smoothstep(0.0, 0.018, vUv.x - edge);
    float contact = exp(-abs(distanceFromEdge - 0.012) * 74.0);
    float castShadow = exp(-abs(distanceFromEdge - 0.070) * 17.0);
    float ends = smoothstep(0.0, 0.055, vUv.y) * smoothstep(0.0, 0.055, 1.0 - vUv.y);
    float strength = smoothstep(0.025, 0.28, uProgress);
    float alpha = (contact * 0.19 + castShadow * 0.12) * revealedSide * ends * strength;

    gl_FragColor = vec4(0.282, 0.188, 0.188, alpha);
    #include <colorspace_fragment>
  }
`;

const PaperCurlOverlay: React.FC<PaperCurlOverlayProps> = ({
  active,
  onRenderingChange,
  sourceRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const callbackRef = useRef(onRenderingChange);
  const runtimeRef = useRef<CurlRuntime | null>(null);
  const initializationRef = useRef<Promise<void> | null>(null);
  const generationRef = useRef(0);
  const renderingRef = useRef(false);

  activeRef.current = active;
  callbackRef.current = onRenderingChange;

  const setRendering = (rendering: boolean) => {
    if (renderingRef.current === rendering) return;
    renderingRef.current = rendering;
    callbackRef.current(rendering);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;

    const initialize = async () => {
      if (runtimeRef.current || initializationRef.current) return initializationRef.current;

      const generation = generationRef.current;
      initializationRef.current = (async () => {
        try {
          const width = source.offsetWidth;
          const height = source.offsetHeight;
          if (!width || !height) return;

          await document.fonts?.ready.catch(() => undefined);
          const images = Array.from(source.querySelectorAll('img'));
          await Promise.all(images.map((image) => image.decode?.().catch(() => undefined)));

          const [THREE, gsapModule, imageModule] = await Promise.all([
            import('three'),
            import('gsap'),
            import('html-to-image'),
          ]);
          if (generation !== generationRef.current || !canvasRef.current || !sourceRef.current) return;

          const capture = await imageModule.toCanvas(source, {
            backgroundColor: '#F8F6EF',
            cacheBust: false,
            height,
            pixelRatio: Math.min(window.devicePixelRatio || 1, 1.75),
            skipFonts: true,
            width,
          });
          if (generation !== generationRef.current || !canvasRef.current) return;

          const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            canvas,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
          });
          renderer.setClearColor(0x000000, 0);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
          renderer.setSize(width, height, false);
          renderer.outputColorSpace = THREE.SRGBColorSpace;

          const scene = new THREE.Scene();
          const cameraZ = 1000;
          const camera = new THREE.PerspectiveCamera(
            THREE.MathUtils.radToDeg(2 * Math.atan(height / (2 * cameraZ))),
            width / height,
            0.1,
            2200,
          );
          camera.position.z = cameraZ;

          const texture = new THREE.CanvasTexture(capture);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.generateMipmaps = false;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;

          // Denser across the fold, and enough rows for the cone to stay smooth.
          const geometry = new THREE.PlaneGeometry(width, height, 96, 44);
          const position = geometry.getAttribute('position');
          const uv = geometry.getAttribute('uv');
          const originalPositions = new Float32Array(position.array as ArrayLike<number>);

          const paperUniforms = {
            uFold: { value: 0 },
            uMap: { value: texture },
            uProgress: { value: 0 },
            uTilt: { value: 0 },
          };
          const paperMaterial = new THREE.ShaderMaterial({
            fragmentShader: FRONT_FRAGMENT_SHADER,
            side: THREE.DoubleSide,
            transparent: true,
            uniforms: paperUniforms,
            vertexShader: FRONT_VERTEX_SHADER,
          });
          const paper = new THREE.Mesh(geometry, paperMaterial);
          paper.renderOrder = 2;
          scene.add(paper);

          const shadowUniforms = {
            uFold: { value: 0 },
            uProgress: { value: 0 },
            uTilt: { value: 0 },
          };
          const shadowMaterial = new THREE.ShaderMaterial({
            depthTest: false,
            depthWrite: false,
            fragmentShader: SHADOW_FRAGMENT_SHADER,
            transparent: true,
            uniforms: shadowUniforms,
            vertexShader: SHADOW_VERTEX_SHADER,
          });
          const shadowGeometry = new THREE.PlaneGeometry(width, height, 1, 1);
          const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
          shadow.position.z = -2;
          shadow.renderOrder = 1;
          scene.add(shadow);

          const state = { progress: 0 };
          const reveal = 0.46;
          // Just under a half turn. Past that the sheet wraps back onto itself
          // and the curl closes into a solid tube.
          const thetaMax = Math.PI * 0.88;
          // A sheet resists bending by a fixed amount, so the curl holds a
          // roughly constant radius instead of inflating as more of it lifts.
          const stiffness = width * 0.104;

          const render = () => {
            const progress = Math.max(0, Math.min(1, state.progress));
            const fold = reveal * progress;
            // The fold line leans, so the sheet peels from a corner rather than
            // hinging on a perfectly vertical line.
            const tilt = 0.17 * progress;

            for (let vertex = 0; vertex < position.count; vertex += 1) {
              const offset = vertex * 3;
              const baseX = originalPositions[offset];
              const baseY = originalPositions[offset + 1];
              const normalizedX = baseX / width + 0.5;
              const normalizedY = uv.getY(vertex);
              const localFold =
                fold +
                (normalizedY - 0.5) * tilt +
                Math.sin(normalizedY * Math.PI) * 0.010 * progress;

              let nextX = baseX;
              let nextY = baseY;
              let nextZ = 0;

              if (normalizedX < localFold && localFold > 0.0001) {
                const foldX = (localFold - 0.5) * width;
                // Widening the radius along the sheet turns the roll into a
                // cone: tight where it is still attached, open at the free
                // corner. A single radius for every row is a tube, and that is
                // what was reading as bent metal.
                const cone = 0.52 + normalizedY * 0.92;
                const radius = Math.max(3, stiffness * cone);
                const distance = foldX - baseX;
                const rawTheta = distance / radius;
                const theta = Math.min(rawTheta, thetaMax);

                if (rawTheta <= thetaMax) {
                  nextX = foldX - Math.sin(theta) * radius;
                  nextZ = radius * (1 - Math.cos(theta));
                } else {
                  // Once the curved portion reaches its maximum turn, the
                  // remaining free sheet continues along that curve's tangent.
                  // Clamping every remaining vertex to the same point would
                  // collapse the paper into degenerate triangles.
                  const remainder = distance - thetaMax * radius;
                  nextX =
                    foldX -
                    Math.sin(thetaMax) * radius -
                    Math.cos(thetaMax) * remainder;
                  nextZ =
                    radius * (1 - Math.cos(thetaMax)) +
                    Math.sin(thetaMax) * remainder;
                }
                // The free edge splays a little as it comes off the page.
                nextY += Math.sin(theta) * (normalizedY - 0.5) * height * 0.05 * progress;
              }

              position.setXYZ(vertex, nextX, nextY, nextZ);
            }

            position.needsUpdate = true;
            geometry.computeVertexNormals();
            geometry.getAttribute('normal').needsUpdate = true;
            paperUniforms.uFold.value = fold;
            paperUniforms.uProgress.value = progress;
            paperUniforms.uTilt.value = tilt;
            shadowUniforms.uFold.value = fold;
            shadowUniforms.uProgress.value = progress;
            shadowUniforms.uTilt.value = tilt;
            renderer.render(scene, camera);
          };

          const gsap = gsapModule.gsap;
          const timeline = gsap.timeline({ paused: true });
          timeline.to(state, {
            duration: 0.9,
            // Lifts away quickly and eases into its resting curl, the way a
            // sheet released under its own stiffness behaves. The old
            // symmetric inOut gave it a driven, mechanical feel.
            ease: 'power3.out',
            onUpdate: render,
            progress: 1,
          });

          const showCanvas = () => {
            canvas.style.opacity = '1';
            setRendering(true);
          };
          const hideCanvas = () => {
            canvas.style.opacity = '0';
            setRendering(false);
          };

          timeline.eventCallback('onReverseComplete', hideCanvas);
          render();

          const onContextLost = () => {
            timeline.pause();
            hideCanvas();
          };
          canvas.addEventListener('webglcontextlost', onContextLost);

          runtimeRef.current = {
            dispose: () => {
              timeline.kill();
              canvas.removeEventListener('webglcontextlost', onContextLost);
              scene.remove(paper, shadow);
              geometry.dispose();
              shadowGeometry.dispose();
              paperMaterial.dispose();
              shadowMaterial.dispose();
              texture.dispose();
              renderer.setAnimationLoop(null);
              renderer.dispose();
              renderer.forceContextLoss();
              hideCanvas();
            },
            play: () => {
              showCanvas();
              timeline.timeScale(1);
              timeline.play();
            },
            // Falling back flat is quicker than peeling up.
            reverse: () => {
              timeline.timeScale(1.5);
              timeline.reverse();
            },
          };

          if (activeRef.current) runtimeRef.current.play();
        } catch (error) {
          // A DOM snapshot or WebGL failure should never make the original card disappear.
          console.warn('Paper curl rendering unavailable; using the original card.', error);
          canvas.style.opacity = '0';
          setRendering(false);
        } finally {
          initializationRef.current = null;
        }
      })();

      return initializationRef.current;
    };

    if (active) {
      if (runtimeRef.current) runtimeRef.current.play();
      else void initialize();
    } else {
      runtimeRef.current?.reverse();
    }
  }, [active, sourceRef]);

  useEffect(() => () => {
    generationRef.current += 1;
    runtimeRef.current?.dispose();
    runtimeRef.current = null;
    initializationRef.current = null;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-paper-curl-canvas=""
      style={{
        filter: 'drop-shadow(0 18px 24px rgba(72, 48, 48, 0.16))',
        height: '100%',
        inset: 0,
        opacity: 0,
        pointerEvents: 'none',
        position: 'absolute',
        transition: 'opacity 40ms linear',
        width: '100%',
        zIndex: 3,
      }}
    />
  );
};

export default PaperCurlOverlay;
