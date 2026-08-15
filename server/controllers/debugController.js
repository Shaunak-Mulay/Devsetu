import { inMemoryOutbox } from '../notifications/emailProvider.js';

export async function getOutbox(req, res) {
  try {
    res.json(inMemoryOutbox);
  } catch (err) {
    console.error("Failed to read mock outbox:", err);
    res.status(500).json({ error: "Failed to read mock outbox." });
  }
}

export async function clearOutbox(req, res) {
  try {
    inMemoryOutbox.length = 0;
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to clear mock outbox:", err);
    res.status(500).json({ error: "Failed to clear mock outbox." });
  }
}
