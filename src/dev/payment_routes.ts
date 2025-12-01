// Express endpoints para manejo de pagos (desarrollo)
import express from 'express';
import { paymentStore } from './generate_reference.js';

const router = express.Router();

// POST /api/payments/reference
// Crea una nueva referencia de pago
router.post('/reference', (req, res) => {
  const { amount, studentId, concept } = req.body;
  
  if (!amount || !studentId || !concept) {
    return res.status(400).json({
      error: 'Se requieren: amount, studentId, concept'
    });
  }

  const reference = paymentStore.create({
    amount: Number(amount),
    studentId,
    concept,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  });

  res.json(reference);
});

// GET /api/payments/reference/:ref
// Obtiene estado de un pago
router.get('/reference/:ref', (req, res) => {
  const reference = paymentStore.get(req.params.ref);
  if (!reference) {
    return res.status(404).json({
      error: 'Referencia no encontrada'
    });
  }
  res.json(reference);
});

// POST /api/payments/confirm/:ref
// Confirma un pago (mock - en producción validar contra banco)
router.post('/confirm/:ref', (req, res) => {
  const success = paymentStore.confirm(req.params.ref);
  if (!success) {
    return res.status(400).json({
      error: 'No se pudo confirmar el pago'
    });
  }
  res.json({ status: 'confirmed' });
});

// GET /api/payments/list
// Lista pagos (solo desarrollo)
router.get('/list', (req, res) => {
  res.json(paymentStore.list());
});

export default router;