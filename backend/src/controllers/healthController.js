import { getDBStatus } from '../config/db.js';

export const getHealth = (req, res) => {
  const dbStatus = getDBStatus();
  const isHealthy = dbStatus.connected;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'BookNest REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbStatus.state,
      connected: dbStatus.connected,
      host: dbStatus.host,
      name: dbStatus.name
    },
    environment: process.env.NODE_ENV || 'development'
  });
};

export default { getHealth };
