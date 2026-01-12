import { redis } from './redis';
import { User, Business, TeamMember } from '@/types/auth';

export class KVStore {
  private static instance: KVStore;

  private constructor() {}

  static getInstance(): KVStore {
    if (!KVStore.instance) {
      KVStore.instance = new KVStore();
    }
    return KVStore.instance;
  }

  // ==================== USER OPERATIONS ====================
  
  async createUser(googleId: string, email: string, name: string, picture: string): Promise<User> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const user: User = {
      id: userId,
      googleId,
      email,
      name,
      picture,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Store user by ID
    await redis.set(`user:${userId}`, user);
    
    // Create indexes for quick lookup
    await redis.set(`googleId:${googleId}`, userId);
    await redis.set(`email:${email}`, userId);

    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    const userId = await redis.get<string>(`googleId:${googleId}`);
    if (!userId) return null;
    
    return await redis.get<User>(`user:${userId}`);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const userId = await redis.get<string>(`email:${email}`);
    if (!userId) return null;
    
    return await redis.get<User>(`user:${userId}`);
  }

  async getUserById(userId: string): Promise<User | null> {
    return await redis.get<User>(`user:${userId}`);
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (user) {
      user.lastLogin = new Date().toISOString();
      await redis.set(`user:${userId}`, user);
    }
  }

  // ==================== BUSINESS OPERATIONS ====================

  async createBusiness(ownerId: string, businessData: Omit<Business, 'id' | 'ownerId' | 'createdAt'>): Promise<Business> {
    const businessId = `biz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const business: Business = {
      id: businessId,
      ownerId,
      ...businessData,
      createdAt: new Date().toISOString()
    };

    // Store business
    await redis.set(`business:${businessId}`, business);
    
    // Create indexes
    await redis.set(`owner:${ownerId}:business`, businessId);
    await redis.set(`sheet:${businessData.spreadsheetId}`, businessId);

    return business;
  }

  async getBusinessById(businessId: string): Promise<Business | null> {
    return await redis.get<Business>(`business:${businessId}`);
  }

  async getBusinessByOwnerId(ownerId: string): Promise<Business | null> {
    const businessId = await redis.get<string>(`owner:${ownerId}:business`);
    if (!businessId) return null;
    
    return await redis.get<Business>(`business:${businessId}`);
  }

  async getBusinessBySheetId(spreadsheetId: string): Promise<Business | null> {
    const businessId = await redis.get<string>(`sheet:${spreadsheetId}`);
    if (!businessId) return null;
    
    return await redis.get<Business>(`business:${businessId}`);
  }

  async updateBusiness(businessId: string, updates: Partial<Business>): Promise<Business | null> {
    const business = await this.getBusinessById(businessId);
    if (!business) return null;

    const updatedBusiness = { ...business, ...updates };
    await redis.set(`business:${businessId}`, updatedBusiness);

    return updatedBusiness;
  }

  async updateSpreadsheetId(businessId: string, newSpreadsheetId: string): Promise<void> {
    const business = await this.getBusinessById(businessId);
    if (!business) throw new Error('Business not found');

    // Remove old sheet mapping
    await redis.del(`sheet:${business.spreadsheetId}`);
    
    // Update business
    business.spreadsheetId = newSpreadsheetId;
    await redis.set(`business:${businessId}`, business);
    
    // Create new sheet mapping
    await redis.set(`sheet:${newSpreadsheetId}`, businessId);
  }

  // ==================== TEAM OPERATIONS ====================

  async addTeamMember(businessId: string, userId: string, role: 'owner' | 'admin' | 'viewer'): Promise<TeamMember> {
    const member: TeamMember = {
      businessId,
      userId,
      role,
      joinedAt: new Date().toISOString()
    };

    // Store team member
    await redis.set(`team:${businessId}:${userId}`, member);
    
    // Add to business team set
    await redis.sadd(`business:${businessId}:members`, userId);

    return member;
  }

  async getTeamMember(businessId: string, userId: string): Promise<TeamMember | null> {
    return await redis.get<TeamMember>(`team:${businessId}:${userId}`);
  }

  async getBusinessTeam(businessId: string): Promise<TeamMember[]> {
    const memberIds = await redis.smembers(`business:${businessId}:members`) as string[];
    const members: TeamMember[] = [];

    for (const userId of memberIds) {
      const member = await redis.get<TeamMember>(`team:${businessId}:${userId}`);
      if (member) members.push(member);
    }

    return members;
  }

  async removeTeamMember(businessId: string, userId: string): Promise<void> {
    await redis.del(`team:${businessId}:${userId}`);
    await redis.srem(`business:${businessId}:members`, userId);
  }

  // ==================== UTILITY ====================

  async isBusinessOwner(userId: string, businessId: string): Promise<boolean> {
    const business = await this.getBusinessById(businessId);
    return business?.ownerId === userId;
  }

  async hasBusinessAccess(userId: string, businessId: string): Promise<boolean> {
    const member = await this.getTeamMember(businessId, userId);
    return member !== null;
  }

  async getUserBusinesses(userId: string): Promise<Business[]> {
    const ownedBusiness = await this.getBusinessByOwnerId(userId);
    return ownedBusiness ? [ownedBusiness] : [];
  }
}
