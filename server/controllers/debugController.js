import { dbService } from '../services/dbService.js';

export async function getOutbox(req, res) {
  try {
    const outbox = await dbService.getCollection('mock_outbox') || [];
    res.json(outbox);
  } catch (err) {
    console.error("Failed to read mock outbox:", err);
    res.status(500).json({ error: "Failed to read mock outbox." });
  }
}

export async function clearOutbox(req, res) {
  try {
    await dbService.saveCollection('mock_outbox', []);
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to clear mock outbox:", err);
    res.status(500).json({ error: "Failed to clear mock outbox." });
  }
}
