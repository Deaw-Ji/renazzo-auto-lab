import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '.data');
const STATE_FILE = path.join(DATA_DIR, 'shared-state.json');

interface SharedAppState {
  sheetConfig?: any;
  users?: any[];
  roles?: any[];
  records?: any[];
  colors?: any[];
  branches?: any[];
  brands?: any[];
  employees?: any[];
  updatedAt?: string;
}

function readSharedState(): SharedAppState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to read shared state file:', err);
  }
  return {};
}

function writeSharedState(nextState: SharedAppState): SharedAppState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const current = readSharedState();
    const merged: SharedAppState = {
      ...current,
      ...nextState,
      updatedAt: new Date().toISOString()
    };

    // Merge users by email so no custom user is accidentally lost
    if (Array.isArray(current.users) && Array.isArray(nextState.users)) {
      const userMap = new Map<string, any>();
      for (const u of current.users) {
        if (u && u.email) userMap.set(String(u.email).toLowerCase().trim(), u);
      }
      for (const u of nextState.users) {
        if (u && u.email) userMap.set(String(u.email).toLowerCase().trim(), u);
      }
      // If nextState explicitly deleted a user (replaceUsers flag), honor nextState.users directly
      if ((nextState as any).replaceUsers) {
        merged.users = nextState.users;
      } else {
        merged.users = Array.from(userMap.values());
      }
    }

    fs.writeFileSync(STATE_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    return merged;
  } catch (err) {
    console.warn('Failed to write shared state file:', err);
    return nextState;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Shared state API so any device/browser opening the app gets the same Google Sheet config, Users, Roles & Master Data
  app.get('/api/shared-state', (_req, res) => {
    const state = readSharedState();
    res.json({ status: 'success', data: state });
  });

  app.post('/api/shared-state', (req, res) => {
    const incoming = req.body || {};
    const updated = writeSharedState(incoming);
    res.json({ status: 'success', data: updated });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
