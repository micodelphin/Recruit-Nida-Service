require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nidaRoutes = require('./routes/nidaRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());
app.use('/uploads/photos', express.static(path.join(__dirname, 'uploads/photos'))); // Serve uploaded photos


app.use('/api/nida', nidaRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'NIDA Service is running',
    port: PORT,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 NIDA Service running on http://localhost:${PORT}`);
});

module.exports = app;