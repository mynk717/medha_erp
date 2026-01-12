export interface User {
    id: string;
    googleId: string;
    email: string;
    name: string;
    picture: string;
    createdAt: string;
    lastLogin: string;
  }
  
  export interface Business {
    id: string;
    ownerId: string;
    businessName: string;
    gstNumber: string;
    phone: string;
    address: string;
    stateCode: string;
    spreadsheetId: string;
    createdAt: string;
    settings: {
      gstEnabled: boolean;
      defaultGstRate: number;
      invoiceTerms: string;
      logo?: string;
    };
  }
  
  export interface TeamMember {
    businessId: string;
    userId: string;
    role: 'owner' | 'admin' | 'viewer';
    joinedAt: string;
  }
  