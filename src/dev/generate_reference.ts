// Generador de referencias de pago para sistema escolar
import { randomBytes } from 'crypto';
import { z } from 'zod';

export const paymentReferenceSchema = z.object({
  reference: z.string(),
  amount: z.number().positive(),
  studentId: z.string(),
  concept: z.string(),
  expiresAt: z.date(),
  status: z.enum(['pending', 'confirmed', 'expired']),
  createdAt: z.date(),
  confirmedAt: z.date().optional()
});

export type PaymentReference = z.infer<typeof paymentReferenceSchema>;

// Genera una referencia única y segura
export function generateReference(prefix = 'COLE'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Crea un objeto de referencia de pago completo
export function createPaymentReference({
  amount,
  studentId,
  concept,
  expiresInDays = 3
}: {
  amount: number;
  studentId: string;
  concept: string;
  expiresInDays?: number;
}): PaymentReference {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(now.getDate() + expiresInDays);

  return {
    reference: generateReference(),
    amount,
    studentId,
    concept,
    expiresAt,
    status: 'pending',
    createdAt: now
  };
}

// Ejemplo de uso:
/* 
const payment = createPaymentReference({
  amount: 250,
  studentId: 'EST123',
  concept: 'Cuota escolar junio 2025'
});
console.log(payment);
*/

// Mock de base de datos en memoria (solo para desarrollo)
export class PaymentStore {
  private references: Map<string, PaymentReference>;

  constructor() {
    this.references = new Map();
  }

  create(data: Omit<PaymentReference, 'reference' | 'status' | 'createdAt' | 'confirmedAt'>): PaymentReference {
    const ref = createPaymentReference({
      amount: data.amount,
      studentId: data.studentId,
      concept: data.concept,
      expiresInDays: 3
    });
    this.references.set(ref.reference, ref);
    return ref;
  }

  get(reference: string): PaymentReference | undefined {
    const ref = this.references.get(reference);
    if (!ref) return undefined;

    // Actualizar estado si expiró
    if (ref.status === 'pending' && ref.expiresAt < new Date()) {
      ref.status = 'expired';
      this.references.set(reference, ref);
    }
    return ref;
  }

  confirm(reference: string): boolean {
    const ref = this.references.get(reference);
    if (!ref || ref.status !== 'pending') return false;
    if (ref.expiresAt < new Date()) {
      ref.status = 'expired';
      this.references.set(reference, ref);
      return false;
    }
    
    ref.status = 'confirmed';
    ref.confirmedAt = new Date();
    this.references.set(reference, ref);
    return true;
  }

  list(): PaymentReference[] {
    // Actualizar estados expirados antes de retornar
    this.references.forEach((ref, key) => {
      if (ref.status === 'pending' && ref.expiresAt < new Date()) {
        ref.status = 'expired';
        this.references.set(key, ref);
      }
    });
    return Array.from(this.references.values());
  }
}

// Exportar singleton para uso en endpoints
export const paymentStore = new PaymentStore();