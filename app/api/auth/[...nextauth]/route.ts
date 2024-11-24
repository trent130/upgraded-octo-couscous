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

        logSecurityEvent('LOGIN_SUCCESS', { email: credentials.email, ip });
        return { id: user.id, name: user.name, email: user.email, role: user.role };
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
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, req }) {
      const ip = getClientIp(req);
      logSecurityEvent('USER_SIGNIN', { userId: user.id, email: user.email, role: (user as User).role, provider: account?.provider, ip });
    },
    async signOut({ token, session, req }) {
      const ip = getClientIp(req);
      logSecurityEvent('USER_SIGNOUT', { userId: token.id, email: token.email, role: token.role, ip });
    },
  },
});

export { handler as GET, handler as POST };
