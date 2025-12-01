// Servidor de desarrollo para APIs mock
import express from 'express';
import cors from 'cors';
import paymentRoutes from './payment_routes.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/payments', paymentRoutes);

// Manejador de errores general
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

app.listen(port, () => {
  console.log(`Servidor de desarrollo ejecutándose en puerto ${port}`);
});