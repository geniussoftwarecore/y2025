// Blueprint reference: javascript_database
import {
  users,
  services,
  spareParts,
  specializations,
  serviceSpecializations,
  workOrders,
  workOrderParts,
  workOrderEvents,
  chatChannels,
  messages,
  customerThreads,
  passwordResetTokens,
  notifications,
  type User,
  type InsertUser,
  type Service,
  type InsertService,
  type SparePart,
  type InsertSparePart,
  type Specialization,
  type InsertSpecialization,
  type WorkOrder,
  type InsertWorkOrder,
  type WorkOrderPart,
  type InsertWorkOrderPart,
  type ChatChannel,
  type InsertChatChannel,
  type Message,
  type InsertMessage,
  type CustomerThread,
  type InsertCustomerThread,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;

  // Services
  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, data: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: string): Promise<void>;

  // Spare Parts
  getSpareParts(): Promise<SparePart[]>;
  getSparePart(id: string): Promise<SparePart | undefined>;
  createSparePart(part: InsertSparePart): Promise<SparePart>;
  updateSparePart(id: string, data: Partial<SparePart>): Promise<SparePart | undefined>;
  deleteSparePart(id: string): Promise<void>;

  // Specializations
  getSpecializations(): Promise<Specialization[]>;
  getSpecialization(id: string): Promise<Specialization | undefined>;
  createSpecialization(spec: InsertSpecialization): Promise<Specialization>;
  updateSpecialization(id: string, data: Partial<Specialization>): Promise<Specialization | undefined>;
  deleteSpecialization(id: string): Promise<void>;

  // Password Reset
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;

  // Work Orders
  getWorkOrders(): Promise<WorkOrder[]>;
  getWorkOrder(id: string): Promise<WorkOrder | undefined>;
  createWorkOrder(order: InsertWorkOrder): Promise<WorkOrder>;
  updateWorkOrder(id: string, data: Partial<WorkOrder>): Promise<WorkOrder | undefined>;

  // Work Order Parts
  getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]>;
  addWorkOrderPart(part: InsertWorkOrderPart): Promise<WorkOrderPart>;

  // Chat Channels
  getChatChannels(): Promise<ChatChannel[]>;
  getChatChannel(id: string): Promise<ChatChannel | undefined>;
  createChatChannel(channel: InsertChatChannel): Promise<ChatChannel>;

  // Messages
  getMessages(channelId: string): Promise<Message[]>;
  getDirectMessages(userId1: string, userId2: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Customer Threads
  getCustomerThreads(): Promise<CustomerThread[]>;
  getCustomerThread(customerId: string): Promise<CustomerThread | undefined>;
  createCustomerThread(thread: InsertCustomerThread): Promise<CustomerThread>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string, userId: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: string, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<void> {
    await db.update(users).set({ isActive: false }).where(eq(users.id, id));
  }

  // Services
  async getServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(services.createdAt);
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async updateService(id: string, data: Partial<Service>): Promise<Service | undefined> {
    const [service] = await db
      .update(services)
      .set(data)
      .where(eq(services.id, id))
      .returning();
    return service || undefined;
  }

  async deleteService(id: string): Promise<void> {
    await db.update(services).set({ isActive: false }).where(eq(services.id, id));
  }

  // Spare Parts
  async getSpareParts(): Promise<SparePart[]> {
    return await db.select().from(spareParts).orderBy(spareParts.createdAt);
  }

  async getSparePart(id: string): Promise<SparePart | undefined> {
    const [part] = await db.select().from(spareParts).where(eq(spareParts.id, id));
    return part || undefined;
  }

  async createSparePart(insertPart: InsertSparePart): Promise<SparePart> {
    const [part] = await db.insert(spareParts).values(insertPart).returning();
    return part;
  }

  async updateSparePart(id: string, data: Partial<SparePart>): Promise<SparePart | undefined> {
    const [part] = await db
      .update(spareParts)
      .set(data)
      .where(eq(spareParts.id, id))
      .returning();
    return part || undefined;
  }

  async deleteSparePart(id: string): Promise<void> {
    await db.update(spareParts).set({ isActive: false }).where(eq(spareParts.id, id));
  }

  // Specializations
  async getSpecializations(): Promise<Specialization[]> {
    return await db.select().from(specializations);
  }

  async getSpecialization(id: string): Promise<Specialization | undefined> {
    const [spec] = await db.select().from(specializations).where(eq(specializations.id, id));
    return spec || undefined;
  }

  async createSpecialization(insertSpec: InsertSpecialization): Promise<Specialization> {
    const [spec] = await db.insert(specializations).values(insertSpec).returning();
    return spec;
  }

  async updateSpecialization(id: string, data: Partial<Specialization>): Promise<Specialization | undefined> {
    const [spec] = await db
      .update(specializations)
      .set(data)
      .where(eq(specializations.id, id))
      .returning();
    return spec || undefined;
  }

  async deleteSpecialization(id: string): Promise<void> {
    await db.delete(specializations).where(eq(specializations.id, id));
  }

  // Password Reset
  async createPasswordResetToken(insertToken: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [token] = await db.insert(passwordResetTokens).values(insertToken).returning();
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    return resetToken || undefined;
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  // Work Orders
  async getWorkOrders(): Promise<WorkOrder[]> {
    return await db.select().from(workOrders).orderBy(desc(workOrders.openedAt));
  }

  async getWorkOrder(id: string): Promise<WorkOrder | undefined> {
    const [order] = await db.select().from(workOrders).where(eq(workOrders.id, id));
    return order || undefined;
  }

  async createWorkOrder(insertOrder: InsertWorkOrder): Promise<WorkOrder> {
    const [order] = await db.insert(workOrders).values(insertOrder).returning();
    return order;
  }

  async updateWorkOrder(id: string, data: Partial<WorkOrder>): Promise<WorkOrder | undefined> {
    const [order] = await db
      .update(workOrders)
      .set(data)
      .where(eq(workOrders.id, id))
      .returning();
    return order || undefined;
  }

  // Work Order Parts
  async getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
    return await db
      .select()
      .from(workOrderParts)
      .where(eq(workOrderParts.workOrderId, workOrderId));
  }

  async addWorkOrderPart(insertPart: InsertWorkOrderPart): Promise<WorkOrderPart> {
    const lineTotal = Number(insertPart.qty) * Number(insertPart.unitPrice);
    const [part] = await db
      .insert(workOrderParts)
      .values({ ...insertPart, lineTotal: lineTotal.toString() })
      .returning();
    return part;
  }

  // Chat Channels
  async getChatChannels(): Promise<ChatChannel[]> {
    return await db.select().from(chatChannels).where(eq(chatChannels.isActive, true));
  }

  async getChatChannel(id: string): Promise<ChatChannel | undefined> {
    const [channel] = await db.select().from(chatChannels).where(eq(chatChannels.id, id));
    return channel || undefined;
  }

  async createChatChannel(insertChannel: InsertChatChannel): Promise<ChatChannel> {
    const [channel] = await db.insert(chatChannels).values(insertChannel).returning();
    return channel;
  }

  // Messages
  async getMessages(channelId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.channelId, channelId))
      .orderBy(messages.createdAt);
  }

  async getDirectMessages(userId1: string, userId2: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.channelId, sql`NULL`),
          sql`(${messages.senderId} = ${userId1} AND ${messages.recipientId} = ${userId2}) OR (${messages.senderId} = ${userId2} AND ${messages.recipientId} = ${userId1})`
        )
      )
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  // Customer Threads
  async getCustomerThreads(): Promise<CustomerThread[]> {
    return await db
      .select()
      .from(customerThreads)
      .orderBy(desc(customerThreads.lastMessageAt));
  }

  async getCustomerThread(customerId: string): Promise<CustomerThread | undefined> {
    const [thread] = await db
      .select()
      .from(customerThreads)
      .where(eq(customerThreads.customerId, customerId));
    return thread || undefined;
  }

