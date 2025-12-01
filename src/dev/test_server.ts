// Servidor simple para pruebas
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Store de pagos en memoria
const payments = new Map();

// Crear referencia de pago
app.post('/api/payments/reference', (req, res) => {
  const { amount, studentId, concept } = req.body;
  const reference = {
    id: Date.now().toString(),
    amount,
    studentId,
    concept,
    status: 'pending',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  };
  
  payments.set(reference.id, reference);
  res.json(reference);
});

// Consultar referencia
app.get('/api/payments/reference/:id', (req, res) => {
  const payment = payments.get(req.params.id);
  if (!payment) {
    return res.status(404).json({ error: 'Referencia no encontrada' });
  }
  res.json(payment);
});

// Confirmar pago
app.post('/api/payments/confirm/:id', (req, res) => {
  const payment = payments.get(req.params.id);
  if (!payment || payment.status !== 'pending') {
    return res.status(400).json({ error: 'No se puede confirmar el pago' });
  }
  
  payment.status = 'confirmed';
  payment.confirmedAt = new Date();
  payments.set(req.params.id, payment);
  res.json({ status: 'confirmed' });
});

// Listar pagos
app.get('/api/payments/list', (req, res) => {
  res.json(Array.from(payments.values()));
});

app.listen(port, () => {
  console.log(`Servidor de prueba ejecutándose en http://localhost:${port}`);
});