// src/server.ts
import app from './app';
import { env } from './config/environment';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on http://localhost:${PORT}`);
});

// Handle graceful shutdowns
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
