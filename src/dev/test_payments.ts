// Script de prueba para el sistema de pagos
const TEST_URL = 'http://localhost:3001/api/payments';

async function testPayments() {
  try {
    // 1. Crear referencia de pago
    console.log('\n1. Creando referencia de pago...');
    const createResponse = await fetch(`${TEST_URL}/reference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 150,
        studentId: 'EST123',
        concept: 'Mensualidad Noviembre'
      })
    });
    const payment = await createResponse.json();
    console.log('Referencia creada:', payment);

    // 2. Consultar referencia
    console.log('\n2. Consultando referencia...');
    const getResponse = await fetch(`${TEST_URL}/reference/${payment.reference}`);
    console.log('Estado de referencia:', await getResponse.json());

    // 3. Confirmar pago
    console.log('\n3. Confirmando pago...');
    const confirmResponse = await fetch(`${TEST_URL}/confirm/${payment.reference}`, {
      method: 'POST'
    });
    console.log('Confirmación:', await confirmResponse.json());

    // 4. Listar todos los pagos
    console.log('\n4. Listando todos los pagos...');
    const listResponse = await fetch(`${TEST_URL}/list`);
    console.log('Lista de pagos:', await listResponse.json());

  } catch (error) {
    console.error('Error en pruebas:', error);
  }
}

// Ejecutar pruebas
testPayments();