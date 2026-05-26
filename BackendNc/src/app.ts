// src/app.ts
import express from 'express';
import cors from 'cors';
import { routes } from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Main router mount
app.use('/api', routes);

// Centralized error handling (Must be registered last)
app.use(errorHandler);

export default app;
