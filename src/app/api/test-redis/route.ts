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
      
      try {
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
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // On sign in, add user ID to token
      if (account && user?.email) {
        const kv = KVStore.getInstance();
        const dbUser = await kv.getUserByEmail(user.email);
        if (dbUser) {
          token.id = dbUser.id;
          token.userId = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID from token to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.userId = token.userId as string;
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
