import { dbService } from '../services/dbService.js';
import { logAuditEvent } from '../services/auditService.js';

export async function getServices(req, res) {
  try {
    const services = await dbService.getCollection('services') || [];
    res.json(services);
  } catch (err) {
    console.error('[ServicesController] getServices error:', err);
    res.status(500).json({ error: "Failed to fetch services." });
  }
}

export async function createService(req, res) {
  const { titleEN, titleHI, titleMR, category, startingPrice, descriptionEN, descriptionHI, descriptionMR, benefits, packages } = req.body;
  if (!titleEN || !startingPrice) {
    return res.status(400).json({ error: "Pooja title and starting price are required." });
  }

  try {
    const services = await dbService.getCollection('services') || [];
    const id = "pooja-" + Date.now();
    const newService = {
      id,
      titleEN,
      titleHI: titleHI || titleEN,
      titleMR: titleMR || titleEN,
      title: titleEN,
      category: category || "Vedic Rituals",
      startingPrice: Number(startingPrice) || 5000,
      pattern: "pattern-shiva",
      descriptionEN: descriptionEN || titleEN,
      descriptionHI: descriptionHI || titleEN,
      descriptionMR: descriptionMR || titleEN,
      benefits: benefits || {
        en: ["Brings peace and positive energy", "Protects against negative obstacles", "Promotes spiritual growth"],
        hi: ["शांति और सकारात्मक ऊर्जा लाता है", "नकारात्मक बाधाओं से रक्षा करता है", "आध्यात्मिक प्रगति को बढ़ावा देता है"],
        mr: ["शांती आणि सकारात्मक ऊर्जा आणते", "नकारात्मक अडथळ्यांपासून संरक्षण करते", "आध्यात्मिक वाढीस प्रोत्साहन देते"]
      },
      packages: packages && packages.length > 0 ? packages : [
        {
          id: id + "-pkg1",
          name: { en: "Ekam Shanti (1 Pandit)", hi: "एकम शांति (1 पंडित)", mr: "एकम शांती (1 पंडित)" },
          price: Number(startingPrice) || 5000,
          astroFee: Math.round((Number(startingPrice) || 5000) * 0.1),
          duration: { en: "3 Hours", hi: "3 घंटे", mr: "3 तास" },
          details: { en: "Complete sacred pooja ritual with single priest setup.", hi: "एक पंडित द्वारा पूर्ण पवित्र पूजा अनुष्ठान।", mr: "एक गुरुजींद्वारे पूर्ण पवित्र पूजा विधी." }
        }
      ]
    };

    services.unshift(newService);
    await dbService.saveCollection('services', services);
    await logAuditEvent("admin", `Created new Pooja Service: ${titleEN}`);

    res.status(201).json(newService);
  } catch (err) {
    console.error('[ServicesController] createService error:', err);
    res.status(500).json({ error: "Failed to create Pooja Service." });
  }
}

export async function deleteService(req, res) {
  const { id } = req.params;
  try {
    const services = await dbService.getCollection('services') || [];
    const filtered = services.filter(s => s.id !== id);
    await dbService.saveCollection('services', filtered);
    await logAuditEvent("admin", `Deleted Pooja Service ID: ${id}`);
    res.json({ success: true, message: "Pooja Service deleted successfully." });
  } catch (err) {
    console.error('[ServicesController] deleteService error:', err);
    res.status(500).json({ error: "Failed to delete Pooja Service." });
  }
}
