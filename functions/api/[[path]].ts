interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

interface AuthUser {
  id: string;
  email: string;
  role: 'customer' | 'admin' | 'staff';
  full_name?: string;
  exp: number;
}

const encoder = new TextEncoder();
let initPromise: Promise<void> | null = null;

const D1_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT 'Dog',
  breed TEXT,
  age INTEGER NOT NULL DEFAULT 1,
  gender TEXT NOT NULL DEFAULT 'unknown',
  price REAL NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  image_url TEXT,
  location TEXT,
  medical_history TEXT,
  personality_traits TEXT,
  category TEXT NOT NULL DEFAULT 'dogs',
  status TEXT NOT NULL DEFAULT 'available',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  photo TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS history_timeline (
  id TEXT PRIMARY KEY,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login TEXT
);

CREATE TABLE IF NOT EXISTS adoption_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  product_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  products TEXT,
  total_amount REAL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read INTEGER NOT NULL DEFAULT 0,
  link TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  email_notifications INTEGER NOT NULL DEFAULT 1,
  push_notifications INTEGER NOT NULL DEFAULT 1,
  sms_notifications INTEGER NOT NULL DEFAULT 0,
  marketing_emails INTEGER NOT NULL DEFAULT 0,
  adoption_updates INTEGER NOT NULL DEFAULT 1,
  message_alerts INTEGER NOT NULL DEFAULT 1,
  dark_mode_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_user ON adoption_requests(user_id, created_at);
`;

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function toBase64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a[i] ^ b[i];
  }
  return mismatch === 0;
}

async function signHmac(secret: string, input: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(input));
  return new Uint8Array(signature);
}

async function signJwt(payload: Omit<AuthUser, 'exp'>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const body = { ...payload, exp };

  const encodedHeader = toBase64Url(encoder.encode(JSON.stringify(header)));
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(body)));
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = await signHmac(secret, unsigned);
  return `${unsigned}.${toBase64Url(signature)}`;
}

async function verifyJwt(token: string, secret: string): Promise<AuthUser | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const unsigned = `${header}.${payload}`;
  const expected = await signHmac(secret, unsigned);
  const received = fromBase64Url(signature);

  if (!timingSafeEqual(expected, received)) return null;

  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as AuthUser;
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const baseKey = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, [
    'deriveBits',
  ]);
  const iterations = 100000;
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    baseKey,
    256
  );
  const hash = new Uint8Array(bits);
  return `pbkdf2$${iterations}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
}

async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [method, iterStr, saltStr, hashStr] = encoded.split('$');
  if (method !== 'pbkdf2' || !iterStr || !saltStr || !hashStr) return false;
  const iterations = Number(iterStr);
  if (!Number.isFinite(iterations)) return false;

  const salt = fromBase64Url(saltStr);
  const expected = fromBase64Url(hashStr);
  const baseKey = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    baseKey,
    256
  );
  return timingSafeEqual(new Uint8Array(bits), expected);
}

async function dbAll<T>(db: D1Database, sql: string, params: unknown[] = []): Promise<T[]> {
  const stmt = db.prepare(sql).bind(...params);
  const result = await stmt.all<T>();
  return result.results ?? [];
}

async function dbFirst<T>(db: D1Database, sql: string, params: unknown[] = []): Promise<T | null> {
  const stmt = db.prepare(sql).bind(...params);
  const result = await stmt.first<T>();
  return result ?? null;
}

async function dbRun(db: D1Database, sql: string, params: unknown[] = []): Promise<void> {
  await db.prepare(sql).bind(...params).run();
}

function normalizeBoolean(value: unknown): boolean {
  return value === 1 || value === true || value === '1';
}

function requireBearerToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth) return null;
  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

async function requireAuth(request: Request, env: Env): Promise<AuthUser | Response> {
  const token = requireBearerToken(request);
  if (!token) return jsonResponse({ error: 'Access denied. No token provided.' }, 401);

  const secret = env.JWT_SECRET || 'change-me-in-production';
  const user = await verifyJwt(token, secret);
  if (!user) return jsonResponse({ error: 'Invalid or expired token.' }, 403);
  return user;
}

async function initializeDatabase(env: Env): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await env.DB.exec(D1_SCHEMA_SQL);

      const defaults = [
        ['site_name', 'AdoptPaws'],
        ['contact_email', 'info@adoptpaws.com'],
        ['contact_phone', '(555) 123-4567'],
        ['contact_address', '150 Park Row, New York, NY 10007'],
      ];

      for (const [key, value] of defaults) {
        await dbRun(env.DB, 'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [key, value]);
      }

      const categories = [
        ['1', 'All Pets', 'all', 'Browse all available pets', 1],
        ['2', 'Dogs', 'dogs', 'Loyal and loving canine companions', 2],
        ['3', 'Cats', 'cats', 'Independent and affectionate feline friends', 3],
        ['4', 'Special Needs', 'special-needs', 'Pets requiring extra care and love', 4],
      ];

      for (const category of categories) {
        await dbRun(
          env.DB,
          'INSERT OR IGNORE INTO categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)',
          category
        );
      }

      const team = [
        [
          't1',
          'Dr. Sarah Chen',
          'Founder & Director',
          'Animal lover and community advocate with 15 years of experience in animal welfare.',
          'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
          1,
        ],
        [
          't2',
          'Michael Rodriguez',
          'Adoption Coordinator',
          'Former veterinary assistant passionate about finding perfect matches for our pets.',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          2,
        ],
        [
          't3',
          'Emily Watson',
          'Veterinary Care Manager',
          'Licensed veterinary technician with a decade of experience in rescue care.',
          'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop',
          3,
        ],
      ];

      for (const member of team) {
        await dbRun(
          env.DB,
          'INSERT OR IGNORE INTO team_members (id, name, role, bio, photo, display_order) VALUES (?, ?, ?, ?, ?, ?)',
          member
        );
      }

      const history = [
        ['h1', '2012', 'The Beginning', 'AdoptPaws launched with a mission to find loving homes for rescued pets.', 1],
        ['h2', '2018', 'Community Growth', 'Expanded adoption services and veterinary partnerships.', 2],
        ['h3', '2026', 'Cloud-Native Future', 'Migrated the platform to run entirely on Cloudflare.', 3],
      ];

      for (const item of history) {
        await dbRun(
          env.DB,
          'INSERT OR IGNORE INTO history_timeline (id, year, title, description, display_order) VALUES (?, ?, ?, ?, ?)',
          item
        );
      }

      const products = [
        [
          '00000000-0000-0000-0000-000000000001',
          'The Three Musketeers',
          'Dog',
          'Mixed Breed',
          1,
          'unknown',
          50,
          'Playful and energetic trio of puppies looking for a loving home.',
          'https://cdn.pixabay.com/photo/2018/09/23/11/04/dog-3697190_1280.jpg',
          'New York',
          'Vaccinated',
          'Playful, social',
          'dogs',
          'available',
        ],
        [
          '00000000-0000-0000-0000-000000000002',
          'PeaceMaker',
          'Dog',
          'Golden Retriever',
          2,
          'female',
          100,
          'PeaceMaker is a gentle soul who brings calm wherever she goes.',
          'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1324&auto=format&fit=crop&ixlib=rb-4.0.3',
          'New York',
          'Vaccinated, microchipped',
          'Calm, family-friendly',
          'dogs',
          'available',
        ],
        [
          '00000000-0000-0000-0000-000000000003',
          'Smiley',
          'Dog',
          'Labrador',
          1,
          'male',
          150,
          'Smiley is always happy and ready for adventure.',
          'https://cdn.pixabay.com/photo/2023/02/05/19/54/dog-7770426_1280.jpg',
          'Brooklyn',
          'Vaccinated',
          'Active, cheerful',
          'dogs',
          'available',
        ],
        [
          '00000000-0000-0000-0000-000000000004',
          'Whiskers',
          'Cat',
          'Tabby',
          3,
          'female',
          75,
          'Whiskers is a beautiful tabby cat with stunning green eyes.',
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1400&q=80',
          'Queens',
          'Spayed, vaccinated',
          'Calm, independent',
          'cats',
          'available',
        ],
      ];

      for (const product of products) {
        await dbRun(
          env.DB,
          `INSERT OR IGNORE INTO products (
            id, name, species, breed, age, gender, price, description, image_url,
            location, medical_history, personality_traits, category, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          product
        );
      }

      const admin = await dbFirst<{ id: string }>(env.DB, 'SELECT id FROM users WHERE email = ?', [
        'admin@adoptpaws.com',
      ]);
      if (!admin) {
        const passwordHash = await hashPassword('admin123');
        await dbRun(
          env.DB,
          `INSERT INTO users (id, email, password_hash, full_name, role)
           VALUES (?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), 'admin@adoptpaws.com', passwordHash, 'Admin User', 'admin']
        );
      }
    })();
  }

  return initPromise;
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) {
    return jsonResponse({ error: 'Missing D1 binding named DB' }, 500);
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      },
    });
  }

  await initializeDatabase(env);

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const method = request.method.toUpperCase();

  try {
    if (method === 'GET' && path === '/health') {
      return jsonResponse({ status: 'ok', message: 'AdoptPaws API is running on Cloudflare' });
    }

    if (method === 'GET' && path === '/settings') {
      const rows = await dbAll<{ key: string; value: string }>(env.DB, 'SELECT key, value FROM settings');
      const settings: Record<string, string> = {};
      for (const row of rows) settings[row.key] = row.value;
      return jsonResponse(settings);
    }

    if (method === 'GET' && path === '/categories') {
      const rows = await dbAll(env.DB, 'SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order');
      return jsonResponse(rows);
    }

    if (method === 'GET' && path === '/about/team') {
      const rows = await dbAll(env.DB, 'SELECT * FROM team_members WHERE is_active = 1 ORDER BY display_order');
      return jsonResponse(rows);
    }

    if (method === 'GET' && path === '/about/history') {
      const rows = await dbAll(env.DB, 'SELECT * FROM history_timeline ORDER BY display_order, year');
      return jsonResponse(rows);
    }

    if (method === 'POST' && path === '/contact') {
      const body = (await request.json()) as { name?: string; email?: string; subject?: string; message?: string };
      if (!body.name || !body.email || !body.message) {
        return jsonResponse({ error: 'name, email, and message are required' }, 400);
      }
      await dbRun(
        env.DB,
        'INSERT INTO contact_submissions (id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)',
        [crypto.randomUUID(), body.name, body.email, body.subject || 'General Inquiry', body.message]
      );
      return jsonResponse(
        {
          success: true,
          message: 'Thank you for contacting us! We will get back to you soon.',
        },
        201
      );
    }

    if (method === 'GET' && path === '/products') {
      const filters: string[] = [];
      const params: unknown[] = [];
      const category = url.searchParams.get('category');
      const status = url.searchParams.get('status');

      if (category) {
        filters.push('category = ?');
        params.push(category);
      }
      if (status) {
        filters.push('status = ?');
        params.push(status);
      }

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
      const rows = await dbAll(env.DB, `SELECT * FROM products ${whereClause} ORDER BY created_at DESC`, params);
      return jsonResponse(rows);
    }

    if (method === 'GET' && /^\/products\/[^/]+$/.test(path)) {
      const id = path.split('/')[2];
      const product = await dbFirst(env.DB, 'SELECT * FROM products WHERE id = ?', [id]);
      if (!product) return jsonResponse({ error: 'Product not found' }, 404);
      return jsonResponse(product);
    }

    if (path.startsWith('/auth/')) {
      const secret = env.JWT_SECRET || 'change-me-in-production';

      if (method === 'POST' && path === '/auth/register') {
        const body = (await request.json()) as {
          email?: string;
          password?: string;
          full_name?: string;
          phone?: string;
          address?: string;
        };

        if (!body.email || !body.password || !body.full_name) {
          return jsonResponse({ error: 'email, password, and full_name are required' }, 400);
        }
        if (body.password.length < 6) {
          return jsonResponse({ error: 'Password must be at least 6 characters' }, 400);
        }

        const existing = await dbFirst<{ id: string }>(env.DB, 'SELECT id FROM users WHERE email = ?', [body.email]);
        if (existing) {
          return jsonResponse({ error: 'User with this email already exists' }, 400);
        }

        const userId = crypto.randomUUID();
        const passwordHash = await hashPassword(body.password);
        await dbRun(
          env.DB,
          `INSERT INTO users (id, email, password_hash, full_name, phone, address, role)
           VALUES (?, ?, ?, ?, ?, ?, 'customer')`,
          [userId, body.email, passwordHash, body.full_name, body.phone || null, body.address || null]
        );

        const token = await signJwt(
          { id: userId, email: body.email, role: 'customer', full_name: body.full_name },
          secret
        );

        return jsonResponse(
          {
            success: true,
            token,
            user: {
              id: userId,
              email: body.email,
              full_name: body.full_name,
              role: 'customer',
              phone: body.phone || null,
              address: body.address || null,
            },
          },
          201
        );
      }

      if (method === 'POST' && path === '/auth/login') {
        const body = (await request.json()) as { email?: string; password?: string };
        if (!body.email || !body.password) {
          return jsonResponse({ error: 'email and password are required' }, 400);
        }

        const user = await dbFirst<{
          id: string;
          email: string;
          password_hash: string;
          full_name: string;
          role: 'customer' | 'admin' | 'staff';
          phone: string | null;
          address: string | null;
          is_active: number;
        }>(env.DB, 'SELECT * FROM users WHERE email = ?', [body.email]);

        if (!user || !normalizeBoolean(user.is_active)) {
          return jsonResponse({ error: 'Invalid email or password' }, 401);
        }

        const valid = await verifyPassword(body.password, user.password_hash);
        if (!valid) {
          return jsonResponse({ error: 'Invalid email or password' }, 401);
        }

        await dbRun(env.DB, 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
        const token = await signJwt(
          { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
          secret
        );

        return jsonResponse({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            phone: user.phone,
            address: user.address,
          },
        });
      }

      if (method === 'GET' && path === '/auth/me') {
        const auth = await requireAuth(request, env);
        if (auth instanceof Response) return auth;

        const user = await dbFirst<{
          id: string;
          email: string;
          full_name: string;
          role: 'customer' | 'admin' | 'staff';
          phone: string | null;
          address: string | null;
          created_at: string;
        }>(env.DB, 'SELECT id, email, full_name, role, phone, address, created_at FROM users WHERE id = ?', [auth.id]);

        if (!user) return jsonResponse({ error: 'User not found' }, 404);
        return jsonResponse(user);
      }

      if (method === 'PUT' && path === '/auth/profile') {
        const auth = await requireAuth(request, env);
        if (auth instanceof Response) return auth;

        const body = (await request.json()) as { full_name?: string; phone?: string; address?: string };
        await dbRun(
          env.DB,
          `UPDATE users
           SET full_name = COALESCE(?, full_name),
               phone = COALESCE(?, phone),
               address = COALESCE(?, address),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [body.full_name ?? null, body.phone ?? null, body.address ?? null, auth.id]
        );

        const user = await dbFirst(env.DB, 'SELECT id, email, full_name, role, phone, address FROM users WHERE id = ?', [
          auth.id,
        ]);
        return jsonResponse(user);
      }
    }

    if (path === '/preferences') {
      const auth = await requireAuth(request, env);
      if (auth instanceof Response) return auth;

      if (method === 'GET') {
        let prefs = await dbFirst<any>(env.DB, 'SELECT * FROM user_preferences WHERE user_id = ?', [auth.id]);
        if (!prefs) {
          const id = crypto.randomUUID();
          await dbRun(env.DB, 'INSERT INTO user_preferences (id, user_id) VALUES (?, ?)', [id, auth.id]);
          prefs = await dbFirst<any>(env.DB, 'SELECT * FROM user_preferences WHERE user_id = ?', [auth.id]);
        }

        return jsonResponse({
          ...prefs,
          email_notifications: normalizeBoolean(prefs.email_notifications),
          push_notifications: normalizeBoolean(prefs.push_notifications),
          sms_notifications: normalizeBoolean(prefs.sms_notifications),
          marketing_emails: normalizeBoolean(prefs.marketing_emails),
          adoption_updates: normalizeBoolean(prefs.adoption_updates),
          message_alerts: normalizeBoolean(prefs.message_alerts),
          dark_mode_enabled: normalizeBoolean(prefs.dark_mode_enabled),
        });
      }

      if (method === 'PUT') {
        const body = (await request.json()) as Record<string, unknown>;
        let prefs = await dbFirst<any>(env.DB, 'SELECT * FROM user_preferences WHERE user_id = ?', [auth.id]);
        if (!prefs) {
          await dbRun(env.DB, 'INSERT INTO user_preferences (id, user_id) VALUES (?, ?)', [crypto.randomUUID(), auth.id]);
        }

        const fields: string[] = [];
        const params: unknown[] = [];
        const allowed = [
          'email_notifications',
          'push_notifications',
          'sms_notifications',
          'marketing_emails',
          'adoption_updates',
          'message_alerts',
          'dark_mode_enabled',
        ];

        for (const key of allowed) {
          if (key in body) {
            fields.push(`${key} = ?`);
            params.push(body[key] ? 1 : 0);
          }
        }

        if (fields.length === 0) {
          return jsonResponse({ error: 'No preferences provided to update' }, 400);
        }

        params.push(auth.id);
        await dbRun(
          env.DB,
          `UPDATE user_preferences SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
          params
        );

        prefs = await dbFirst<any>(env.DB, 'SELECT * FROM user_preferences WHERE user_id = ?', [auth.id]);
        return jsonResponse({
          ...prefs,
          email_notifications: normalizeBoolean(prefs.email_notifications),
          push_notifications: normalizeBoolean(prefs.push_notifications),
          sms_notifications: normalizeBoolean(prefs.sms_notifications),
          marketing_emails: normalizeBoolean(prefs.marketing_emails),
          adoption_updates: normalizeBoolean(prefs.adoption_updates),
          message_alerts: normalizeBoolean(prefs.message_alerts),
          dark_mode_enabled: normalizeBoolean(prefs.dark_mode_enabled),
        });
      }
    }

    if (path.startsWith('/notifications')) {
      const auth = await requireAuth(request, env);
      if (auth instanceof Response) return auth;

      if (method === 'GET' && path === '/notifications') {
        const rows = await dbAll<any>(
          env.DB,
          'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
          [auth.id]
        );
        return jsonResponse(rows.map((row) => ({ ...row, is_read: normalizeBoolean(row.is_read) })));
      }

      if (method === 'GET' && path === '/notifications/unread') {
        const row = await dbFirst<{ count: number }>(
          env.DB,
          'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
          [auth.id]
        );
        return jsonResponse({ unread: Number(row?.count || 0) });
      }

      if (method === 'PUT' && path === '/notifications/mark-all-read') {
        await dbRun(env.DB, 'UPDATE notifications SET is_read = 1 WHERE user_id = ?', [auth.id]);
        return jsonResponse({ success: true, message: 'All notifications marked as read' });
      }

      if (method === 'PUT' && /^\/notifications\/[^/]+\/read$/.test(path)) {
        const id = path.split('/')[2];
        await dbRun(env.DB, 'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, auth.id]);
        const updated = await dbFirst<any>(env.DB, 'SELECT * FROM notifications WHERE id = ? AND user_id = ?', [id, auth.id]);
        if (!updated) return jsonResponse({ error: 'Notification not found' }, 404);
        return jsonResponse({ ...updated, is_read: normalizeBoolean(updated.is_read) });
      }
    }

    if (path.startsWith('/user/')) {
      const auth = await requireAuth(request, env);
      if (auth instanceof Response) return auth;

      if (method === 'GET' && path === '/user/favorites') {
        const rows = await dbAll(
          env.DB,
          `SELECT f.id, f.product_id, f.created_at as added_at,
                  p.name as product_name, p.breed as product_breed,
                  p.age as product_age, p.price as product_price,
                  p.image_url as product_image
           FROM favorites f
           LEFT JOIN products p ON f.product_id = p.id
           WHERE f.user_id = ?
           ORDER BY f.created_at DESC`,
          [auth.id]
        );
        return jsonResponse(rows);
      }

      if (method === 'POST' && path === '/user/favorites') {
        const body = (await request.json()) as { product_id?: string };
        if (!body.product_id) return jsonResponse({ error: 'product_id is required' }, 400);

        const product = await dbFirst(env.DB, 'SELECT id FROM products WHERE id = ?', [body.product_id]);
        if (!product) return jsonResponse({ error: 'Pet not found' }, 404);

        const existing = await dbFirst(env.DB, 'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?', [
          auth.id,
          body.product_id,
        ]);
        if (existing) return jsonResponse({ error: 'Already in favorites' }, 400);

        const id = crypto.randomUUID();
        await dbRun(env.DB, 'INSERT INTO favorites (id, user_id, product_id) VALUES (?, ?, ?)', [
          id,
          auth.id,
          body.product_id,
        ]);

        const favorite = await dbFirst(env.DB, 'SELECT * FROM favorites WHERE id = ?', [id]);
        return jsonResponse(favorite, 201);
      }

      if (method === 'DELETE' && /^\/user\/favorites\/[^/]+$/.test(path)) {
        const favoriteId = path.split('/')[3];
        const existing = await dbFirst(env.DB, 'SELECT id FROM favorites WHERE id = ? AND user_id = ?', [
          favoriteId,
          auth.id,
        ]);
        if (!existing) return jsonResponse({ error: 'Favorite not found' }, 404);

        await dbRun(env.DB, 'DELETE FROM favorites WHERE id = ? AND user_id = ?', [favoriteId, auth.id]);
        return jsonResponse({ success: true, message: 'Removed from favorites' });
      }

      if (method === 'GET' && path === '/user/adoption-requests') {
        const rows = await dbAll(
          env.DB,
          `SELECT ar.*, p.name as product_name, p.image_url as product_image
           FROM adoption_requests ar
           LEFT JOIN products p ON ar.product_id = p.id
           WHERE ar.user_id = ?
           ORDER BY ar.created_at DESC`,
          [auth.id]
        );
        return jsonResponse(rows);
      }

      if (method === 'POST' && path === '/user/adoption-requests') {
        const body = (await request.json()) as { product_id?: string; notes?: string };
        if (!body.product_id) return jsonResponse({ error: 'product_id is required' }, 400);

        const user = await dbFirst<{ full_name: string; email: string }>(
          env.DB,
          'SELECT full_name, email FROM users WHERE id = ?',
          [auth.id]
        );
        if (!user) return jsonResponse({ error: 'User not found' }, 404);

        const id = crypto.randomUUID();
        await dbRun(
          env.DB,
          `INSERT INTO adoption_requests (
             id, user_id, product_id, customer_name, customer_email, notes, status
           ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
          [id, auth.id, body.product_id, user.full_name, user.email, body.notes || null]
        );

        const requestRow = await dbFirst(env.DB, 'SELECT * FROM adoption_requests WHERE id = ?', [id]);
        return jsonResponse(requestRow, 201);
      }
    }

    if (method === 'POST' && path === '/adoptions') {
      const auth = await requireAuth(request, env);
      if (auth instanceof Response) return auth;

      const body = (await request.json()) as {
        product_id?: string;
        products?: Array<{ id?: string }>;
        customer_name?: string;
        customer_email?: string;
        customer_phone?: string;
        customer_address?: string;
        total_amount?: number;
        notes?: string;
      };

      const user = await dbFirst<{ full_name: string; email: string }>(env.DB, 'SELECT full_name, email FROM users WHERE id = ?', [
        auth.id,
      ]);
      if (!user) return jsonResponse({ error: 'User not found' }, 404);

      const productId = body.product_id || body.products?.[0]?.id;
      if (!productId) {
        return jsonResponse({ error: 'product_id is required' }, 400);
      }

      const id = crypto.randomUUID();
      await dbRun(
        env.DB,
        `INSERT INTO adoption_requests (
          id, user_id, product_id, customer_name, customer_email,
          customer_phone, customer_address, products, total_amount, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          id,
          auth.id,
          productId,
          body.customer_name || user.full_name,
          body.customer_email || user.email,
          body.customer_phone || null,
          body.customer_address || null,
          JSON.stringify(body.products || []),
          body.total_amount ?? null,
          body.notes || null,
        ]
      );

      const admins = await dbAll<{ id: string }>(env.DB, "SELECT id FROM users WHERE role = 'admin'");
      for (const admin of admins) {
        await dbRun(
          env.DB,
          `INSERT INTO notifications (id, user_id, title, message, type)
           VALUES (?, ?, ?, ?, 'info')`,
          [
            crypto.randomUUID(),
            admin.id,
            'New Adoption Request',
            `${user.full_name} has submitted an adoption request.`,
          ]
        );
      }

      return jsonResponse({ success: true, message: 'Your adoption request has been submitted successfully!' }, 201);
    }

    if (path.startsWith('/products') && ['POST', 'PUT', 'DELETE'].includes(method)) {
      const auth = await requireAuth(request, env);
      if (auth instanceof Response) return auth;
      if (auth.role !== 'admin') {
        return jsonResponse({ error: 'Admin access required.' }, 403);
      }

      if (method === 'POST' && path === '/products') {
        const body = (await request.json()) as Record<string, unknown>;
        const required = ['name', 'species', 'age', 'gender', 'price', 'description', 'category'];
        for (const field of required) {
          if (!(field in body)) return jsonResponse({ error: `${field} is required` }, 400);
        }

        const id = crypto.randomUUID();
        await dbRun(
          env.DB,
          `INSERT INTO products (
            id, name, species, breed, age, gender, price, description,
            image_url, location, medical_history, personality_traits, category, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            String(body.name),
            String(body.species),
            body.breed ? String(body.breed) : null,
            Number(body.age),
            String(body.gender),
            Number(body.price),
            String(body.description),
            body.image_url ? String(body.image_url) : null,
            body.location ? String(body.location) : null,
            body.medical_history ? String(body.medical_history) : null,
            body.personality_traits ? String(body.personality_traits) : null,
            String(body.category),
            body.status ? String(body.status) : 'available',
          ]
        );

        const product = await dbFirst(env.DB, 'SELECT * FROM products WHERE id = ?', [id]);
        return jsonResponse(product, 201);
      }

      if (method === 'PUT' && /^\/products\/[^/]+$/.test(path)) {
        const id = path.split('/')[2];
        const body = (await request.json()) as Record<string, unknown>;
        const allowed = [
          'name',
          'species',
          'breed',
          'age',
          'gender',
          'price',
          'description',
          'image_url',
          'location',
          'medical_history',
          'personality_traits',
          'category',
          'status',
        ];

        const sets: string[] = [];
        const params: unknown[] = [];
        for (const key of allowed) {
          if (key in body) {
            sets.push(`${key} = ?`);
            params.push(body[key]);
          }
        }

        if (sets.length === 0) return jsonResponse({ error: 'No fields to update' }, 400);

        params.push(id);
        await dbRun(
          env.DB,
          `UPDATE products SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          params
        );

        const product = await dbFirst(env.DB, 'SELECT * FROM products WHERE id = ?', [id]);
        if (!product) return jsonResponse({ error: 'Product not found' }, 404);
        return jsonResponse(product);
      }

      if (method === 'DELETE' && /^\/products\/[^/]+$/.test(path)) {
        const id = path.split('/')[2];
        const product = await dbFirst(env.DB, 'SELECT id FROM products WHERE id = ?', [id]);
        if (!product) return jsonResponse({ error: 'Product not found' }, 404);

        await dbRun(env.DB, 'DELETE FROM adoption_requests WHERE product_id = ?', [id]);
        await dbRun(env.DB, 'DELETE FROM favorites WHERE product_id = ?', [id]);
        await dbRun(env.DB, 'DELETE FROM products WHERE id = ?', [id]);
        return jsonResponse({ message: 'Product deleted successfully', id });
      }
    }

    return jsonResponse({ error: 'API endpoint not found' }, 404);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return jsonResponse({ error: 'Internal server error', message }, 500);
  }
};
