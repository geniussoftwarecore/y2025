import { relations, sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, uuid, numeric, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", ["admin", "supervisor", "engineer", "sales", "customer"]);
export const languageEnum = pgEnum("language", ["ar", "en"]);
export const workOrderStatusEnum = pgEnum("work_order_status", [
  "new",
  "assigned",
  "in_progress",
  "done",
  "delivered",
  "cancelled"
]);
export const channelTypeEnum = pgEnum("channel_type", ["general", "tech", "sales", "direct", "customer_support"]);

// ===== Users & Roles =====
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  preferredLanguage: languageEnum("preferred_language").notNull().default("en"),
  specialization: text("specialization"), // For engineers: electric, mechanic, battery, etc.
  role: roleEnum("role").notNull().default("customer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  assignedWorkOrders: many(workOrders, { relationName: "assignedEngineer" }),
  openedWorkOrders: many(workOrders, { relationName: "openedBy" }),
  sentMessages: many(messages),
  customerThreads: many(customerThreads),
}));

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  username: z.string().min(3),
  fullName: z.string().min(2),
  hashedPassword: z.string().min(6),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Password Reset Tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// ===== Service Catalog =====
export const services = pgTable("services", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  descAr: text("desc_ar"),
  descEn: text("desc_en"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  expectedDurationMinutes: integer("expected_duration_minutes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const servicesRelations = relations(services, ({ many }) => ({
  serviceSpecializations: many(serviceSpecializations),
  workOrders: many(workOrders),
}));

export const insertServiceSchema = createInsertSchema(services).omit({ id: true, createdAt: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export const spareParts = pgTable("spare_parts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  partCode: text("part_code"),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sparePartsRelations = relations(spareParts, ({ many }) => ({
  workOrderParts: many(workOrderParts),
}));

export const insertSparePartSchema = createInsertSchema(spareParts).omit({ id: true, createdAt: true });
export type InsertSparePart = z.infer<typeof insertSparePartSchema>;
export type SparePart = typeof spareParts.$inferSelect;

export const specializations = pgTable("specializations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(), // electric, mechanic, battery, etc.
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
});

export const specializationsRelations = relations(specializations, ({ many }) => ({
  serviceSpecializations: many(serviceSpecializations),
}));

export const insertSpecializationSchema = createInsertSchema(specializations).omit({ id: true });
export type InsertSpecialization = z.infer<typeof insertSpecializationSchema>;
export type Specialization = typeof specializations.$inferSelect;

export const serviceSpecializations = pgTable("service_specializations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  specializationId: uuid("specialization_id").notNull().references(() => specializations.id, { onDelete: "cascade" }),
});

export const serviceSpecializationsRelations = relations(serviceSpecializations, ({ one }) => ({
  service: one(services, {
    fields: [serviceSpecializations.serviceId],
    references: [services.id],
  }),
  specialization: one(specializations, {
    fields: [serviceSpecializations.specializationId],
    references: [specializations.id],
  }),
}));

// ===== Work Orders =====
export const workOrders = pgTable("work_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").notNull().references(() => users.id),
  vehicleIdent: text("vehicle_ident").notNull(), // VIN or plate
  vehicleMake: text("vehicle_make"),
  vehicleModel: text("vehicle_model"),
  status: workOrderStatusEnum("status").notNull().default("new"),
  openedById: uuid("opened_by_id").notNull().references(() => users.id),
  assignedEngineerId: uuid("assigned_engineer_id").references(() => users.id),
  serviceId: uuid("service_id").notNull().references(() => services.id),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  deliveredAt: timestamp("delivered_at"),
  notes: text("notes"),
  totalCost: numeric("total_cost", { precision: 10, scale: 2 }).default("0"),
});

export const workOrdersRelations = relations(workOrders, ({ one, many }) => ({
  customer: one(users, {
    fields: [workOrders.customerId],
    references: [users.id],
    relationName: "customerWorkOrders",
  }),
  openedBy: one(users, {
    fields: [workOrders.openedById],
    references: [users.id],
    relationName: "openedBy",
  }),
  assignedEngineer: one(users, {
    fields: [workOrders.assignedEngineerId],
    references: [users.id],
    relationName: "assignedEngineer",
  }),
  service: one(services, {
    fields: [workOrders.serviceId],
    references: [services.id],
  }),
  parts: many(workOrderParts),
  events: many(workOrderEvents),
}));

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({ 
  id: true, 
  openedAt: true, 
  totalCost: true 
});
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type WorkOrder = typeof workOrders.$inferSelect;

export const workOrderParts = pgTable("work_order_parts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  workOrderId: uuid("work_order_id").notNull().references(() => workOrders.id, { onDelete: "cascade" }),
  partId: uuid("part_id").notNull().references(() => spareParts.id),
  qty: numeric("qty", { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const workOrderPartsRelations = relations(workOrderParts, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workOrderParts.workOrderId],
    references: [workOrders.id],
  }),
  part: one(spareParts, {
    fields: [workOrderParts.partId],
    references: [spareParts.id],
  }),
}));

export const insertWorkOrderPartSchema = createInsertSchema(workOrderParts).omit({ 
  id: true, 
  createdAt: true,
  lineTotal: true 
});
export type InsertWorkOrderPart = z.infer<typeof insertWorkOrderPartSchema>;
export type WorkOrderPart = typeof workOrderParts.$inferSelect;

export const workOrderEvents = pgTable("work_order_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  workOrderId: uuid("work_order_id").notNull().references(() => workOrders.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // created, assigned, started, finished, delivered, cancelled
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  performedById: uuid("performed_by_id").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const workOrderEventsRelations = relations(workOrderEvents, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workOrderEvents.workOrderId],
    references: [workOrders.id],
  }),
  performedBy: one(users, {
    fields: [workOrderEvents.performedById],
    references: [users.id],
  }),
}));

// ===== Chat System =====
export const chatChannels = pgTable("chat_channels", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: channelTypeEnum("type").notNull().default("general"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatChannelsRelations = relations(chatChannels, ({ many }) => ({
  messages: many(messages),
}));

export const insertChatChannelSchema = createInsertSchema(chatChannels).omit({ id: true, createdAt: true });
export type InsertChatChannel = z.infer<typeof insertChatChannelSchema>;
export type ChatChannel = typeof chatChannels.$inferSelect;

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: uuid("channel_id").references(() => chatChannels.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id").notNull().references(() => users.id),
  recipientId: uuid("recipient_id").references(() => users.id), // For direct messages
  body: text("body").notNull(),
  attachmentMeta: text("attachment_meta"), // JSON string with file info
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  channel: one(chatChannels, {
    fields: [messages.channelId],
    references: [chatChannels.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isRead: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export const customerThreads = pgTable("customer_threads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").notNull().references(() => users.id),
  salesRepId: uuid("sales_rep_id").references(() => users.id),
  status: text("status").notNull().default("open"), // open, closed
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const customerThreadsRelations = relations(customerThreads, ({ one }) => ({
  customer: one(users, {
    fields: [customerThreads.customerId],
    references: [users.id],
    relationName: "customerThreads",
  }),
  salesRep: one(users, {
    fields: [customerThreads.salesRepId],
    references: [users.id],
    relationName: "salesRepThreads",
  }),
}));

export const insertCustomerThreadSchema = createInsertSchema(customerThreads).omit({ 
  id: true, 
  createdAt: true,
  lastMessageAt: true 
});
export type InsertCustomerThread = z.infer<typeof insertCustomerThreadSchema>;
export type CustomerThread = typeof customerThreads.$inferSelect;

// ===== Notifications =====
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, success, warning, error
  relatedEntityType: text("related_entity_type"), // work_order, message, user, etc.
  relatedEntityId: uuid("related_entity_id"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const insertNotificationSchema = createInsertSchema(notifications).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
