const cors = require('cors');

const express = require('express');

const dev = express();

dev.use(cors());

dev.get('/members/:userUid', (req, res) => {
  res.json({
    userUid: 456,
    name: 'Kaoré - OpenAgenda',
    phone: '0651911026',
    email: 'support@openagenda.com',
    position: 'Support',
    organization: 'OA',
    role: 'administrator'
  });
});

dev.listen(3000);
