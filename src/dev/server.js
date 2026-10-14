// Servidor de desarrollo para APIs mock (versión JavaScript)
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ===== MOCK: Endpoint para Secciones =====
app.get('/api/sections', (req, res) => {
  const { year, nivel, page = 1, per_page = 200 } = req.query;
  
  console.log(`[Mock API] GET /api/sections - year: ${year}, nivel: ${nivel}, page: ${page}`);

  // Datos mock de secciones
  const mockSections = [
    {
      id: 1,
      year: year || '2025',
      nivel: 'primaria',
      curso: '2',
      paralelo: 'B',
      turno: 'Mañana',
      aula: 'A-2',
      capacidad: 35,
      tutor_id: 1,
      estado: 'ACTIVA',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 2,
      year: year || '2025',
      nivel: 'primaria',
      curso: '4',
      paralelo: 'A',
      turno: 'Mañana',
      aula: 'A-4',
      capacidad: 32,
      tutor_id: 2,
      estado: 'ACTIVA',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 3,
      year: year || '2025',
      nivel: 'primaria',
      curso: '1',
      paralelo: 'B',
      turno: 'Mañana',
      aula: 'A-1',
      capacidad: 30,
      tutor_id: 3,
      estado: 'ACTIVA',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }
  ];

  // Filtrar por nivel si se proporciona
  const filtered = nivel 
    ? mockSections.filter(s => s.nivel === nivel)
    : mockSections;

  res.status(200).json({
    data: filtered,
    current_page: parseInt(page) || 1,
    per_page: parseInt(per_page) || 200,
    total: filtered.length,
    last_page: 1
  });
});

// ===== MOCK: Endpoint para Calificaciones =====
app.get('/api/calificaciones', (req, res) => {
  const { curso, trimestre, materia_id } = req.query;
  
  console.log(`[Mock API] GET /api/calificaciones - curso: ${curso}, trimestre: ${trimestre}`);

  res.status(200).json({
    data: [],
    message: 'Calificaciones cargadas desde mock'
  });
});

// ===== Health Check =====
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Manejador de errores general
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

app.listen(port, () => {
  console.log(`✅ Servidor de desarrollo ejecutándose en http://127.0.0.1:${port}`);
  console.log(`📡 APIs disponibles:`);
  console.log(`   - GET  /api/sections`);
  console.log(`   - GET  /api/calificaciones`);
  console.log(`   - GET  /health`);
  console.log(`\n⏹️  Presiona Ctrl+C para detener el servidor`);
});
