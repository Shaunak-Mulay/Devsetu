import { dbService } from '../services/dbService.js';
import { notificationService } from '../notifications/notificationService.js';

export async function getTickets(req, res) {
  try {
    const tickets = await dbService.getCollection('tickets') || [];
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve tickets." });
  }
}

export async function createTicket(req, res) {
  const { category, subject } = req.body;
  if (!subject) {
    return res.status(400).json({ error: "Subject is required." });
  }

  try {
    const tickets = await dbService.getCollection('tickets') || [];
    const newTicket = {
      id: "TK-" + Math.floor(1000 + Math.random() * 9000),
      category,
      status: "Open",
      subject,
      lastUpdate: "Just now"
    };

    tickets.unshift(newTicket);
    await dbService.saveCollection('tickets', tickets);
    res.status(201).json(newTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create support ticket." });
  }
}

export async function resolveTicket(req, res) {
  const { id } = req.params;
  
  try {
    const tickets = await dbService.getCollection('tickets') || [];
    let updatedTicket = null;

    const nextTickets = tickets.map(t => {
      if (t.id === id) {
        updatedTicket = { ...t, status: "Resolved", lastUpdate: "Just now" };
        return updatedTicket;
      }
      return t;
    });

    if (!updatedTicket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    await dbService.saveCollection('tickets', nextTickets);
    res.json(updatedTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to resolve support ticket." });
  }
}

export async function getChats(req, res) {
  try {
    const chats = await dbService.getCollection('chats') || [];
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve support chats." });
  }
}

export async function postChat(req, res) {
  const { ticketId, sender, text, category, attachment } = req.body;
  if (!text && !attachment) {
    return res.status(400).json({ error: "Message text or attachment is required." });
  }

  try {
    const chats = await dbService.getCollection('chats') || [];
    const newChat = {
      id: Date.now(),
      ticketId: ticketId || "TK-9402",
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: category || "General Queries",
      read: false,
      attachment
    };

    chats.push(newChat);
    await dbService.saveCollection('chats', chats);

    // Update lastUpdate on matching ticket
    const tickets = await dbService.getCollection('tickets') || [];
    const nextTickets = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, lastUpdate: "Just now" };
      }
      return t;
    });
    await dbService.saveCollection('tickets', nextTickets);

    // Trigger Admin Chat Message notification if sender is admin
    if (sender === "admin") {
      const userMessage = chats.find(c => c.ticketId === ticketId && c.sender !== "admin");
      if (userMessage) {
        await notificationService.sendNotification({
          userId: userMessage.sender,
          event: "Admin Chat Message",
          title: "New Support Message",
          body: `Support: ${text || "Attached a file."}`,
          relatedProfileId: ticketId
        });
      }
    }

    res.status(201).json(newChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to post support chat message." });
  }
}
