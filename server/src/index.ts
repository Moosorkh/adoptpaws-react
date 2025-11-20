import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import productsRouter from './routes/products.js';
import generalRouter from './routes/general.js';
import authRouter from './routes/auth.js';
import notificationsRouter from './routes/notifications.js';
import messagesRouter from './routes/messages.js';
import userRouter from './routes/user.js';
import preferencesRouter from './routes/preferences.js';
import aboutRouter from './routes/about.js';
import pool from './config/database.js';
import { logger } from './utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AdoptPaws API is running', timestamp: new Date().toISOString() });
});

// Quick debug endpoint to inspect filesystem paths in production
app.get('/health/fs', (req, res) => {
  try {
    const root = path.join(__dirname, '../../');
    const serverDir = path.join(__dirname, '../');
    const frontendPath = path.join(__dirname, '../../dist');
    const indexPath = path.join(frontendPath, 'index.html');
    res.json({
      cwd: process.cwd(),
      __dirname,
      paths: {
        root,
        serverDir,
        frontendPath,
        indexPathExists: fs.existsSync(indexPath),
      },
      listings: {
        root: fs.existsSync(root) ? fs.readdirSync(root) : 'missing',
        serverDir: fs.existsSync(serverDir) ? fs.readdirSync(serverDir) : 'missing',
        frontendPath: fs.existsSync(frontendPath) ? fs.readdirSync(frontendPath) : 'missing',
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) });
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AdoptPaws API is running' });
});

app.use('/api/products', productsRouter);
app.use('/api', generalRouter);
app.use('/api/auth', authRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/user', userRouter);
app.use('/api/preferences', preferencesRouter);
app.use('/api/about', aboutRouter);

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  // Serve files built by Vite that we place into server/public at build time
  const frontendPath = path.join(__dirname, '../public');
  logger.info(`Serving static files from: ${frontendPath}`);
  app.use(express.static(frontendPath));
  
  // Catch-all route to serve index.html for SPA routing
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    const indexPath = path.join(frontendPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      logger.error(`index.html not found at: ${indexPath}`);
      return res
        .status(500)
        .send('Frontend build not found. Ensure root build produced dist/index.html');
    }
    logger.info(`Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath);
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing server...');
  await pool.end();
  process.exit(0);
});
