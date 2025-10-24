import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { storage } from "./storage";
import { authenticateToken, requireRole, generateToken, type AuthRequest } from "./middleware/auth";
import { insertUserSchema, passwordResetTokens } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { sql } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // ===== Authentication Routes =====
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { fullName, email, username, password } = req.body;

      // Check if user already exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        fullName,
        email,
        username,
        hashedPassword,
        role: "customer", // Default role for registration
        preferredLanguage: "en",
        isActive: true,
      });

      res.status(201).json({
        message: "User registered successfully",
        userId: user.id,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find user by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: "Account is inactive" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate token
      const token = generateToken(user);

      // Remove password from response
      const { hashedPassword, ...userWithoutPassword } = user;

      res.json({
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // ===== User Routes =====
  app.get("/api/users", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const users = await storage.getUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ hashedPassword, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const { fullName, email, username, password, role, specialization } = req.body;

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        fullName,
        email,
        username,
        hashedPassword,
        role: role || "customer",
        specialization: specialization || null,
        preferredLanguage: "en",
        isActive: true,
      });

      const { hashedPassword: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Don't allow changing password through this endpoint
      delete updates.hashedPassword;
      delete updates.password;

      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { hashedPassword, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ message: "User deactivated successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/users/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { hashedPassword, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.put("/api/users/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const updates = req.body;
      // Don't allow changing role through this endpoint
      delete updates.role;
      delete updates.hashedPassword;
      delete updates.password;

      const user = await storage.updateUser(req.user!.id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { hashedPassword, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Password Reset Routes
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return res.json({ message: "If the email exists, a reset link has been sent" });
      }

      // Generate a cryptographically secure random reset token
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Hash the token before storing (security best practice)
      const hashedToken = await bcrypt.hash(resetToken, 10);

      // Store hashed token in database
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await storage.createPasswordResetToken({
        userId: user.id,
        token: hashedToken,
        expiresAt,
      });

      // In production, send email/SMS here with reset link
      if (process.env.NODE_ENV === "production") {
        // TODO: Send email with reset link
        // Example: await sendEmail(email, `Reset your password: ${resetUrl}?token=${resetToken}`);
      } else {
        // Development only: log token to console
        console.log(`⚠️ DEV MODE ONLY: Password reset token for ${email}: ${resetToken}`);
        console.log(`⚠️ DEV MODE ONLY: Reset URL: /reset-password?token=${resetToken}`);
      }

      res.json({ 
        message: "If the email exists, a reset link has been sent"
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      // Find all non-expired password reset tokens and verify against hashed values
      // Note: We must scan all tokens because they are hashed
      // In a high-volume production environment, consider adding an index or token selector
      const now = new Date();
      const activeTokens = await db
        .select()
        .from(passwordResetTokens)
        .where(sql`${passwordResetTokens.expiresAt} > ${now}`);
      
      let validToken = null;
      for (const storedToken of activeTokens) {
        const isValid = await bcrypt.compare(token, storedToken.token);
        if (isValid) {
          validToken = storedToken;
          break;
        }
      }

      if (!validToken) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(validToken.userId, { hashedPassword });

      // Delete used token
      await storage.deletePasswordResetToken(validToken.token);

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // ===== Service Catalog Routes =====
  app.get("/api/catalog/services", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Get services error:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.post("/api/catalog/services", authenticateToken, requireRole("admin", "supervisor"), async (req: AuthRequest, res) => {
    try {
      const service = await storage.createService(req.body);
      res.status(201).json(service);
    } catch (error) {
      console.error("Create service error:", error);
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  app.patch("/api/catalog/services/:id", authenticateToken, requireRole("admin", "supervisor"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const service = await storage.updateService(id, req.body);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Update service error:", error);
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  app.get("/api/catalog/parts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const parts = await storage.getSpareParts();
      res.json(parts);
    } catch (error) {
      console.error("Get parts error:", error);
      res.status(500).json({ error: "Failed to fetch parts" });
    }
  });

  app.post("/api/catalog/parts", authenticateToken, requireRole("admin", "supervisor"), async (req: AuthRequest, res) => {
    try {
      const part = await storage.createSparePart(req.body);
      res.status(201).json(part);
    } catch (error) {
      console.error("Create part error:", error);
      res.status(500).json({ error: "Failed to create part" });
    }
  });

  app.patch("/api/catalog/parts/:id", authenticateToken, requireRole("admin", "supervisor"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const part = await storage.updateSparePart(id, req.body);
      if (!part) {
        return res.status(404).json({ error: "Part not found" });
      }
      res.json(part);
    } catch (error) {
      console.error("Update part error:", error);
      res.status(500).json({ error: "Failed to update part" });
    }
  });

  app.delete("/api/catalog/parts/:id", authenticateToken, requireRole("admin", "supervisor"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSparePart(id);
      res.json({ message: "Part deleted successfully" });
    } catch (error) {
      console.error("Delete part error:", error);
      res.status(500).json({ error: "Failed to delete part" });
    }
  });

  app.get("/api/catalog/specializations", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const specializations = await storage.getSpecializations();
      res.json(specializations);
    } catch (error) {
      console.error("Get specializations error:", error);
      res.status(500).json({ error: "Failed to fetch specializations" });
    }
  });

  app.post("/api/catalog/specializations", authenticateToken, requireRole("admin", "supervisor"), async (req: AuthRequest, res) => {
    try {
      const specialization = await storage.createSpecialization(req.body);
      res.status(201).json(specialization);
    } catch (error) {
      console.error("Create specialization error:", error);
      res.status(500).json({ error: "Failed to create specialization" });
    }
  });

  app.patch("/api/catalog/specializations/:id", authenticateToken, requireRole("admin", "supervisor"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const specialization = await storage.updateSpecialization(id, req.body);
      if (!specialization) {
        return res.status(404).json({ error: "Specialization not found" });
      }
      res.json(specialization);
    } catch (error) {
      console.error("Update specialization error:", error);
      res.status(500).json({ error: "Failed to update specialization" });
    }
  });

  app.delete("/api/catalog/specializations/:id", authenticateToken, requireRole("admin", "supervisor"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSpecialization(id);
      res.json({ message: "Specialization deleted successfully" });
    } catch (error) {
      console.error("Delete specialization error:", error);
      res.status(500).json({ error: "Failed to delete specialization" });
    }
  });

  // ===== Work Order Routes =====
  app.get("/api/work/orders", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const orders = await storage.getWorkOrders();
      res.json(orders);
    } catch (error) {
      console.error("Get work orders error:", error);
      res.status(500).json({ error: "Failed to fetch work orders" });
    }
  });

  app.post("/api/work/orders", authenticateToken, requireRole("admin", "supervisor", "sales"), async (req: AuthRequest, res) => {
    try {
      const orderData = {
        ...req.body,
        openedById: req.user!.id,
        status: "new",
      };

      const order = await storage.createWorkOrder(orderData);

      // TODO: Auto-assign engineer based on specialization
      // For now, leave as "new" status

      res.status(201).json(order);
    } catch (error) {
      console.error("Create work order error:", error);
      res.status(500).json({ error: "Failed to create work order" });
    }
  });

  app.patch("/api/work/orders/:id/assign", authenticateToken, requireRole("admin", "supervisor"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { assignedEngineerId } = req.body;

      const order = await storage.updateWorkOrder(id, {
        assignedEngineerId,
        status: "assigned",
      });

      if (!order) {
        return res.status(404).json({ error: "Work order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Assign work order error:", error);
      res.status(500).json({ error: "Failed to assign work order" });
    }
  });

  app.patch("/api/work/orders/:id/start", authenticateToken, requireRole("engineer"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const order = await storage.updateWorkOrder(id, {
        status: "in_progress",
        startedAt: new Date(),
      });

      if (!order) {
        return res.status(404).json({ error: "Work order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Start work order error:", error);
      res.status(500).json({ error: "Failed to start work order" });
    }
  });

  app.patch("/api/work/orders/:id/finish", authenticateToken, requireRole("engineer"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const order = await storage.updateWorkOrder(id, {
        status: "done",
        finishedAt: new Date(),
      });

      if (!order) {
        return res.status(404).json({ error: "Work order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Finish work order error:", error);
      res.status(500).json({ error: "Failed to finish work order" });
    }
  });

  app.patch("/api/work/orders/:id/deliver", authenticateToken, requireRole("admin", "supervisor", "sales"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const order = await storage.updateWorkOrder(id, {
        status: "delivered",
        deliveredAt: new Date(),
      });

      if (!order) {
        return res.status(404).json({ error: "Work order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Deliver work order error:", error);
      res.status(500).json({ error: "Failed to deliver work order" });
    }
  });

  app.post("/api/work/orders/:id/parts", authenticateToken, requireRole("engineer", "admin", "supervisor"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { partId, qty } = req.body;

      // Get part to fetch unit price
      const part = await storage.getSparePart(partId);
      if (!part) {
        return res.status(404).json({ error: "Part not found" });
      }

      const workOrderPart = await storage.addWorkOrderPart({
        workOrderId: id,
        partId,
        qty,
        unitPrice: part.unitPrice,
      });

      res.status(201).json(workOrderPart);
    } catch (error) {
      console.error("Add work order part error:", error);
      res.status(500).json({ error: "Failed to add part" });
    }
  });

  // ===== Chat Routes =====
  app.get("/api/chat/channels", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const channels = await storage.getChatChannels();
      res.json(channels);
    } catch (error) {
      console.error("Get channels error:", error);
      res.status(500).json({ error: "Failed to fetch channels" });
    }
  });

  app.get("/api/chat/messages/:channelId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { channelId } = req.params;
      const messages = await storage.getMessages(channelId);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/messages", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const messageData = {
        ...req.body,
        senderId: req.user!.id,
      };

      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Create message error:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // ===== Reports Routes =====
  app.get("/api/reports/overview", authenticateToken, requireRole("admin", "supervisor"), async (req: AuthRequest, res) => {
    try {
      // This would aggregate data from various sources
      // For now, return basic stats
      const orders = await storage.getWorkOrders();
      const users = await storage.getUsers();

      res.json({
        totalOrders: orders.length,
        completedOrders: orders.filter(o => o.status === "delivered").length,
        totalUsers: users.length,
        activeEngineers: users.filter(u => u.role === "engineer" && u.isActive).length,
      });
    } catch (error) {
      console.error("Get overview error:", error);
      res.status(500).json({ error: "Failed to fetch overview" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // ===== WebSocket Setup for Chat =====
  // Blueprint reference: javascript_websocket
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  interface WebSocketClient extends WebSocket {
    userId?: string;
    channelId?: string;
  }

  wss.on('connection', (ws: WebSocketClient) => {
    console.log('Client connected to WebSocket');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'auth':
            // Authenticate the WebSocket connection with JWT
            if (!message.token) {
              ws.send(JSON.stringify({ type: 'auth_error', message: 'Token required' }));
              ws.close();
              break;
            }
            try {
              const JWT_SECRET = process.env.SESSION_SECRET || "development-secret-key";
              const decoded = jwt.verify(message.token, JWT_SECRET) as any;
              ws.userId = decoded.id;
              console.log(`WebSocket authenticated: userId=${ws.userId}`);
              ws.send(JSON.stringify({ type: 'auth_success' }));
            } catch (error) {
              console.error('WebSocket auth error:', error);
              ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid token' }));
              ws.close();
            }
            break;

          case 'join_channel':
            ws.channelId = message.channelId;
            ws.send(JSON.stringify({ type: 'joined', channelId: message.channelId }));
            break;

          case 'chat_message':
            // Broadcast message to all clients in the same channel
            const msg = await storage.createMessage({
              channelId: message.channelId,
              senderId: ws.userId!,
              body: message.body,
              recipientId: message.recipientId || null,
              attachmentMeta: null,
            });

            // Broadcast to all connected clients
            wss.clients.forEach((client) => {
              const wsClient = client as WebSocketClient;
              if (
                wsClient.readyState === WebSocket.OPEN &&
                wsClient.channelId === message.channelId
              ) {
                wsClient.send(
                  JSON.stringify({
                    type: 'new_message',
                    message: msg,
                  })
                );
              }
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  return httpServer;
}
