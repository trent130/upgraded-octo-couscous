import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { compare } from 'bcrypt';
import { rateLimit, getClientIp } from '@/lib/utils/rateLimiter';
import { verifyTOTP } from '@/lib/utils/twoFactorAuth';
import { users, User } from '@/lib/models/user';
import { logSecurityEvent } from '@/lib/utils/logger';
import { generateAndSendEmailCode } from '@/lib/utils/emailAuth';
import { notifyUserOfSuspiciousActivity } from '@/lib/utils/notifications';
import { createSession, deleteSession, refreshSession } from '@/lib/utils/sessionManager';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" },
        emailCode: { label: "Email Code", type: "text" }
      },
      async authorize(credentials, req) {
        // ... (keep existing authorization logic)

        // If authentication is successful
        const sessionId = await createSession(user.id);
        return { ...user, sessionId };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.sessionId = user.sessionId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      session.sessionId = token.sessionId;
      await refreshSession(token.sessionId);
      return session;
    },
  },
  events: {
    async signIn({ user, account, req }) {
      const ip = getClientIp(req);
      logSecurityEvent('USER_SIGNIN', { userId: user.id, email: user.email, role: (user as User).role, provider: account?.provider, ip });
    },
    async signOut({ token }) {
      if (token.sessionId) {
        await deleteSession(token.sessionId);
      }
      logSecurityEvent('USER_SIGNOUT', { userId: token.id, email: token.email, role: token.role });
    },
  },
});

export { handler as GET, handler as POST };
