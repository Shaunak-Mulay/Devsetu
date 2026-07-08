import express from 'express';

const router = express.Router();

router.get('/qr', (req, res) => {
  res.json({ qrUrl: "/payment_qr_placeholder.jpeg" });
});

export default router;
