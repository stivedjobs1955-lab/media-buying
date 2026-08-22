const express = require('express');
const path = require('node:path');
const { requireAuth } = require('../token');

const router = express.Router();

router.get('/contract', requireAuth, (req, res) => {
  const filePath = path.join(__dirname, '..', '..', 'legal', 'Xizmat_shartnomasi_Unique.docx');
  res.download(filePath, 'Xizmat_shartnomasi_Unique.docx');
});

module.exports = router;
