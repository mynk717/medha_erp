import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { KVStore } from '@/lib/kvStore';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      const kv = KVStore.getInstance();
      
      // Check if user exists
      let existingUser = await kv.getUserByEmail(user.email);
      
      if (!existingUser) {
        // Create new user
        existingUser = await kv.createUser(
          account?.providerAccountId || '',
          user.email,
          user.name || '',
          user.image || ''
        );
      } else {
        // Update last login
        await kv.updateUserLastLogin(existingUser.id);
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        const kv = KVStore.getInstance();
        const user = await kv.getUserByEmail(session.user.email!);
        
        if (user) {
          session.user.id = user.id;
          session.user.userId = user.id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
