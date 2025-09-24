import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertMessageSchema, insertStatusSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

interface WebSocketWithUserId extends WebSocket {
  userId?: string;
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Chat routes
  app.get("/api/chats", requireAuth, async (req, res) => {
    try {
      const chats = await storage.getUserChats(req.user.id);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.post("/api/chats", requireAuth, async (req, res) => {
    try {
      const { name, type, description } = req.body;
      
      const chat = await storage.createChat({
        name,
        type: type || "group",
        description,
        createdBy: req.user.id,
      });

      // Add creator as admin member
      await storage.addChatMember(chat.id, req.user.id, "admin");

      res.status(201).json(chat);
    } catch (error) {
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  app.post("/api/chats/:chatId/members", requireAuth, async (req, res) => {
    try {
      const { chatId } = req.params;
      const { userPin } = req.body;

      const userToAdd = await storage.getUserByPin(userPin);
      if (!userToAdd) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.addChatMember(chatId, userToAdd.id);
      res.status(201).json({ message: "User added to chat" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add user to chat" });
    }
  });

  app.get("/api/chats/:chatId/messages", requireAuth, async (req, res) => {
    try {
      const { chatId } = req.params;
      const messages = await storage.getChatMessages(chatId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Status routes
  app.get("/api/status", requireAuth, async (req, res) => {
    try {
      await storage.cleanupExpiredStatuses();
      const statuses = await storage.getActiveStatusUpdates();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch status updates" });
    }
  });

  app.post("/api/status", requireAuth, upload.single("image"), async (req, res) => {
    try {
      const { content } = req.body;
      
      const statusData = {
        userId: req.user.id,
        content,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      };

      const status = await storage.createStatusUpdate(statusData);
      res.status(201).json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to create status update" });
    }
  });

  // File upload route
  app.post("/api/upload", requireAuth, upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
      url: `/uploads/${req.file.filename}`,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  });

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // User search route
  app.get("/api/users/search", requireAuth, async (req, res) => {
    try {
      const { pin } = req.query;
      if (!pin) {
        return res.status(400).json({ message: "PIN is required" });
      }

      const user = await storage.getUserByPin(pin as string);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        id: user.id, 
        name: user.name, 
        pin: user.pin, 
        role: user.role,
        program: user.program,
        avatar: user.avatar,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to search user" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocketWithUserId, request) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'auth':
            ws.userId = message.userId;
            if (ws.userId) {
              await storage.updateUserOnlineStatus(ws.userId, true);
            }
            break;

          case 'message':
            if (ws.userId) {
              const { chatId, content, messageType, fileUrl, fileName, fileSize } = message.data;
              
              const newMessage = await storage.createMessage({
                chatId,
                senderId: ws.userId,
                content,
                type: messageType || 'text',
                fileUrl,
                fileName,
                fileSize,
              });

              // Broadcast to all clients in the chat
              const chatMembers = await storage.getChatMembers(chatId);
              const broadcastData = {
                type: 'message',
                data: newMessage,
              };

              wss.clients.forEach((client: WebSocketWithUserId) => {
                if (client !== ws && 
                    client.readyState === WebSocket.OPEN && 
                    chatMembers.some(member => member.id === client.userId)) {
                  client.send(JSON.stringify(broadcastData));
                }
              });
            }
            break;

          case 'typing':
            if (ws.userId) {
              const { chatId, isTyping } = message.data;
              
              // Broadcast typing status to other chat members
              const chatMembers = await storage.getChatMembers(chatId);
              const broadcastData = {
                type: 'typing',
                data: {
                  userId: ws.userId,
                  chatId,
                  isTyping,
                },
              };

              wss.clients.forEach((client: WebSocketWithUserId) => {
                if (client !== ws && 
                    client.readyState === WebSocket.OPEN && 
                    chatMembers.some(member => member.id === client.userId)) {
                  client.send(JSON.stringify(broadcastData));
                }
              });
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', async () => {
      if (ws.userId) {
        await storage.updateUserOnlineStatus(ws.userId, false);
      }
      console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}
