const express = require('express');
const prisma = require('../repositories/prisma');

const router = express.Router();

router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

router.get('/ready', async (req, res) => {
  try {
    // Quick probe to verify database connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'unready',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
