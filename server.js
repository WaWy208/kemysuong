const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = '0.0.0.0';
const PORT = Number(process.env.PORT) || 4000;
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || 'buiquangquy25122007').trim();
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const MENU_SEED_FILE = path.join(DATA_DIR, 'menu.seed.json');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp'
};

const MENU_TYPES = new Set(['cream', 'cup', 'premium-cup', 'yogurt', 'bean-dessert']);

function ensureMenuStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(MENU_FILE)) {
    fs.copyFileSync(MENU_SEED_FILE, MENU_FILE);
  }
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readMenu() {
  ensureMenuStore();
  const items = readJsonFile(MENU_FILE);
  return Array.isArray(items) ? items : [];
}

function readSeedMenu() {
  const items = readJsonFile(MENU_SEED_FILE);
  return Array.isArray(items) ? items : [];
}

function writeMenu(items) {
  ensureMenuStore();
  fs.writeFileSync(MENU_FILE, JSON.stringify(items, null, 2), 'utf8');
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(body);
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error('Request body is too large.'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (_error) {
        reject(new Error('Invalid JSON body.'));
      }
    });

    req.on('error', reject);
  });
}

function requireAdmin(req, res) {
  const provided = String(req.headers['x-admin-password'] || '').trim();
  if (!provided || provided !== ADMIN_PASSWORD) {
    sendError(res, 401, 'Sai mat khau admin.');
    return false;
  }
  return true;
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `menu-${Date.now()}`;
}

function asText(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function asNonNegativeInteger(value, fieldName) {
  const next = Number(value);
  if (!Number.isFinite(next) || next < 0) {
    throw new Error(`${fieldName} must be a non-negative number.`);
  }
  return Math.floor(next);
}

function asNonNegativePrice(value) {
  const next = Number(value);
  if (!Number.isFinite(next) || next < 0) {
    throw new Error('price must be a non-negative number.');
  }
  return Math.round(next);
}

function validateType(value) {
  const type = asText(value);
  if (!MENU_TYPES.has(type)) {
    throw new Error('type is invalid.');
  }
  return type;
}

function buildMenuItem(input, existingIds) {
  const name = asText(input.name);
  const image = asText(input.image);

  if (!name) throw new Error('name is required.');
  if (!image) throw new Error('image is required.');

  const baseId = slugify(input.id || name);
  let id = baseId;
  let suffix = 2;
  while (existingIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }
  existingIds.add(id);

  return {
    id,
    name,
    type: validateType(input.type),
    price: asNonNegativePrice(input.price),
    stock: asNonNegativeInteger(input.stock, 'stock'),
    desc: asText(input.desc),
    image,
    alt: asText(input.alt, name) || name,
    paused: Boolean(input.paused)
  };
}

function patchMenuItem(currentItem, patch) {
  const next = { ...currentItem };

  if (patch.name !== undefined) {
    const name = asText(patch.name);
    if (!name) throw new Error('name cannot be empty.');
    next.name = name;
  }

  if (patch.type !== undefined) {
    next.type = validateType(patch.type);
  }

  if (patch.price !== undefined) {
    next.price = asNonNegativePrice(patch.price);
  }

  if (patch.stock !== undefined) {
    next.stock = asNonNegativeInteger(patch.stock, 'stock');
  }

  if (patch.desc !== undefined) {
    next.desc = asText(patch.desc);
  }

  if (patch.image !== undefined) {
    const image = asText(patch.image);
    if (!image) throw new Error('image cannot be empty.');
    next.image = image;
  }

  if (patch.alt !== undefined) {
    next.alt = asText(patch.alt, next.name) || next.name;
  } else if (!next.alt) {
    next.alt = next.name;
  }

  if (patch.paused !== undefined) {
    next.paused = Boolean(patch.paused);
  }

  return next;
}

function resolveStaticFile(requestPath) {
  const targetPath = requestPath === '/' ? '/index.html' : requestPath;
  const normalizedPath = path
    .normalize(targetPath)
    .replace(/^([\\/])+/, '')
    .replace(/^(\.\.[\\/])+/, '');
  const filePath = path.join(ROOT_DIR, normalizedPath);

  if (!filePath.startsWith(ROOT_DIR)) {
    return null;
  }

  return filePath;
}

function serveStaticFile(res, requestPath) {
  const filePath = resolveStaticFile(requestPath);
  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendError(res, 404, 'Not found.');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    if (pathname.startsWith('/api/') && req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Origin': '*'
      });
      res.end();
      return;
    }

    if (pathname === '/health') {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (pathname === '/api/menu' && req.method === 'GET') {
      sendJson(res, 200, { items: readMenu() });
      return;
    }

    if (pathname === '/api/menu' && req.method === 'POST') {
      if (!requireAdmin(req, res)) return;
      const body = await parseBody(req);
      const items = readMenu();
      const nextItem = buildMenuItem(body, new Set(items.map((item) => item.id)));
      items.push(nextItem);
      writeMenu(items);
      sendJson(res, 201, { item: nextItem, items });
      return;
    }

    if (pathname === '/api/menu/reset' && req.method === 'POST') {
      if (!requireAdmin(req, res)) return;
      const seedItems = readSeedMenu();
      writeMenu(seedItems);
      sendJson(res, 200, { items: seedItems });
      return;
    }

    const itemMatch = pathname.match(/^\/api\/menu\/([^/]+)$/);
    if (itemMatch && req.method === 'PATCH') {
      if (!requireAdmin(req, res)) return;
      const itemId = decodeURIComponent(itemMatch[1]);
      const patch = await parseBody(req);
      const items = readMenu();
      const index = items.findIndex((item) => item.id === itemId);

      if (index === -1) {
        sendError(res, 404, 'Khong tim thay mon.');
        return;
      }

      items[index] = patchMenuItem(items[index], patch);
      writeMenu(items);
      sendJson(res, 200, { item: items[index], items });
      return;
    }

    if (pathname.startsWith('/api/')) {
      sendError(res, 404, 'Not found.');
      return;
    }

    if (req.method !== 'GET') {
      sendError(res, 405, 'Method not allowed.');
      return;
    }

    serveStaticFile(res, pathname);
  } catch (error) {
    sendError(res, 400, error.message || 'Unexpected error.');
  }
});

server.listen(PORT, HOST, () => {
  ensureMenuStore();
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
