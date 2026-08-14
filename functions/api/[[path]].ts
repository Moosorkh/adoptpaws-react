interface Env {
  BACKEND_ORIGIN: string;
}

const HOP_BY_HOP_HEADERS = [
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
];

function stripHopByHopHeaders(headers: Headers): Headers {
  const next = new Headers(headers);
  for (const key of HOP_BY_HOP_HEADERS) {
    next.delete(key);
  }
  return next;
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.BACKEND_ORIGIN) {
    return new Response('Missing BACKEND_ORIGIN Pages environment variable', {
      status: 500,
    });
  }

  const incomingUrl = new URL(request.url);
  const upstreamBase = env.BACKEND_ORIGIN.replace(/\/+$/, '');
  const pathWithoutApiPrefix = incomingUrl.pathname.replace(/^\/api/, '') || '/';
  const upstreamUrl = `${upstreamBase}${pathWithoutApiPrefix}${incomingUrl.search}`;

  const headers = stripHopByHopHeaders(new Headers(request.headers));
  headers.set('host', new URL(upstreamBase).host);

  const method = request.method.toUpperCase();
  const init: RequestInit = {
    method,
    headers,
    redirect: 'manual',
    body: method === 'GET' || method === 'HEAD' ? undefined : request.body,
  };

  const upstreamResponse = await fetch(upstreamUrl, init);
  const responseHeaders = stripHopByHopHeaders(new Headers(upstreamResponse.headers));

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
};
