import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcrypt';
import { rateLimit } from '@/lib/utils/rateLimiter';
import { verifyTOTP } from '@/lib/utils/twoFactorAuth';
import { users } from '@/lib/models/user';
import { logSecurityEvent } from '@/lib/utils/logger';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      // ... (keep existing CredentialsProvider configuration)
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      session.accessToken = token.accessToken;
      session.provider = token.provider;
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      logSecurityEvent('USER_SIGNIN', { userId: user.id, email: user.email });
    },
    async signOut({ token }) {
      logSecurityEvent('USER_SIGNOUT', { userId: token.id, email: token.email });
    },
  },
});

export { handler as GET, handler as POST };
