import { 
  users, 
  chats, 
  messages, 
  statusUpdates, 
  chatMembers, 
  messageReads,
  type User, 
  type InsertUser,
  type Chat,
  type InsertChat,
  type Message,
  type InsertMessage,
  type StatusUpdate,
  type InsertStatusUpdate,
  type ChatMember
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, lt } from "drizzle-orm";
import session, { Store } from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPin(pin: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserOnlineStatus(id: string, isOnline: boolean): Promise<void>;
  generateUniquePin(): Promise<string>;

  // Chat methods
  createChat(chat: InsertChat): Promise<Chat>;
  getChatById(id: string): Promise<Chat | undefined>;
  getUserChats(userId: string): Promise<Chat[]>;
  addChatMember(chatId: string, userId: string, role?: string): Promise<void>;
  getChatMembers(chatId: string): Promise<User[]>;

  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getChatMessages(chatId: string, limit?: number): Promise<Message[]>;
  markMessageAsRead(messageId: string, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string, chatId: string): Promise<number>;

  // Status methods
  createStatusUpdate(status: InsertStatusUpdate & { expiresAt: Date }): Promise<StatusUpdate>;
  getActiveStatusUpdates(): Promise<StatusUpdate[]>;
  cleanupExpiredStatuses(): Promise<void>;

  // Session store
  sessionStore: Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

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

  async getUserByPin(pin: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.pin, pin));
    return user || undefined;
  }

  async generateUniquePin(): Promise<string> {
    let pin: string;
    let exists = true;
    
    while (exists) {
      // Generate random 4-character alphanumeric string
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const randomPart = Array.from({ length: 4 }, () => 
        chars[Math.floor(Math.random() * chars.length)]
      ).join('');
      
      pin = `UNIMUS-${randomPart}`;
      
      const existingUser = await this.getUserByPin(pin);
      exists = !!existingUser;
    }
    
    return pin!;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const pin = await this.generateUniquePin();
    
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, pin })
      .returning();
    return user;
  }

  async updateUserOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isOnline, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async createChat(chat: InsertChat): Promise<Chat> {
    const [newChat] = await db
      .insert(chats)
      .values(chat)
      .returning();
    return newChat;
  }

  async getChatById(id: string): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, id));
    return chat || undefined;
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    const userChats = await db
      .select({
        id: chats.id,
        name: chats.name,
        type: chats.type,
        description: chats.description,
        createdBy: chats.createdBy,
        createdAt: chats.createdAt,
        updatedAt: chats.updatedAt,
      })
      .from(chats)
      .innerJoin(chatMembers, eq(chats.id, chatMembers.chatId))
      .where(eq(chatMembers.userId, userId))
      .orderBy(desc(chats.updatedAt));
    
    return userChats;
  }

  async addChatMember(chatId: string, userId: string, role = "member"): Promise<void> {
    await db
      .insert(chatMembers)
      .values({ chatId, userId, role });
  }

  async getChatMembers(chatId: string): Promise<User[]> {
    const members = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        nim: users.nim,
        pin: users.pin,
        name: users.name,
        role: users.role,
        program: users.program,
        year: users.year,
        bio: users.bio,
        avatar: users.avatar,
        isOnline: users.isOnline,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        password: users.password,
      })
      .from(users)
      .innerJoin(chatMembers, eq(users.id, chatMembers.userId))
      .where(eq(chatMembers.chatId, chatId));
    
    return members;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    
    // Update chat's updatedAt
    await db
      .update(chats)
      .set({ updatedAt: new Date() })
      .where(eq(chats.id, message.chatId));
    
    return newMessage;
  }

  async getChatMessages(chatId: string, limit = 50): Promise<Message[]> {
    const chatMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
    
    return chatMessages.reverse();
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    await db
      .insert(messageReads)
      .values({ messageId, userId })
      .onConflictDoNothing();
  }

  async getUnreadMessageCount(userId: string, chatId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql`count(*)` })
      .from(messages)
      .leftJoin(messageReads, and(
        eq(messages.id, messageReads.messageId),
        eq(messageReads.userId, userId)
      ))
      .where(and(
        eq(messages.chatId, chatId),
        sql`${messageReads.id} IS NULL`,
        sql`${messages.senderId} != ${userId}`
      ));
    
    return Number(result.count) || 0;
  }

  async createStatusUpdate(status: InsertStatusUpdate & { expiresAt: Date }): Promise<StatusUpdate> {
    const [newStatus] = await db
      .insert(statusUpdates)
      .values(status)
      .returning();
    return newStatus;
  }

  async getActiveStatusUpdates(): Promise<StatusUpdate[]> {
    return await db
      .select()
      .from(statusUpdates)
      .where(sql`${statusUpdates.expiresAt} > NOW()`)
      .orderBy(desc(statusUpdates.createdAt));
  }

  async cleanupExpiredStatuses(): Promise<void> {
    await db
      .delete(statusUpdates)
      .where(lt(statusUpdates.expiresAt, new Date()));
  }
}

export const storage = new DatabaseStorage();
