const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.json({ status: 'MAD PERU BOT API ACTIVO', version: '1.0.0', bot: 'Merlin' });
});
app.get('/webhook', (req, res) => {
  const verify_token = process.env.VERIFY_TOKEN || 'mad123';
  if (req.query['hub.verify_token'] === verify_token) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});
app.post('/webhook', (req, res) => {
  console.log('Mensaje:', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.listen(PORT, () => {
  console.log(`MAD BOT en puerto ${PORT}`);
});
