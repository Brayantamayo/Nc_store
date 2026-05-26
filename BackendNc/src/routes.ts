// src/routes.ts
import { Router } from 'express';


const routes = Router();

// Health check endpoint
routes.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    message: 'Backend NC Store API is operational',
  });
});


export { routes };
