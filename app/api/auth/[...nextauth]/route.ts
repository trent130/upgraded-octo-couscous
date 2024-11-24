import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { compare } from 'bcrypt';
import { rateLimit, getClientIp } from '@/lib/utils/rateLimiter';
import { verifyTOTP } from '@/lib/utils/twoFactorAuth';
import { users } from '@/lib/models/user';
import { logSecurityEvent } from '@/lib/utils/logger';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        const ip = getClientIp(req);
        const ipRateLimitResult = rateLimit(ip, true);
        const userRateLimitResult = rateLimit(credentials.email);

        if (!ipRateLimitResult.allowed) {
          const lockoutMinutes = Math.ceil((ipRateLimitResult.lockedUntil - Date.now()) / 60000);
          logSecurityEvent('IP_RATE_LIMIT_EXCEEDED', { ip, email: credentials.email });
          throw new Error(`Too many requests from this IP. Please try again in ${lockoutMinutes} minutes.`);
        }

        if (!userRateLimitResult.allowed) {
          const lockoutMinutes = Math.ceil((userRateLimitResult.lockedUntil - Date.now()) / 60000);
          logSecurityEvent('USER_RATE_LIMIT_EXCEEDED', { email: credentials.email });
          throw new Error(`Too many login attempts. Please try again in ${lockoutMinutes} minutes.`);
        }

        const user = users.find(user => user.email === credentials.email);

        if (!user) {
          logSecurityEvent('LOGIN_ATTEMPT_USER_NOT_FOUND', { email: credentials.email, ip });
          throw new Error('No user found with this email');
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          logSecurityEvent('LOGIN_ATTEMPT_INVALID_PASSWORD', { email: credentials.email, ip });
          throw new Error('Invalid password');
        }

        if (user.isTwoFactorEnabled) {
          if (!credentials.totpCode) {
            logSecurityEvent('LOGIN_ATTEMPT_2FA_REQUIRED', { email: credentials.email, ip });
            throw new Error('2FA code required');
          }

          const isTotpValid = verifyTOTP(credentials.totpCode, user.twoFactorSecret);

          if (!isTotpValid) {
            logSecurityEvent('LOGIN_ATTEMPT_INVALID_2FA', { email: credentials.email, ip });
            throw new Error('Invalid 2FA code');
          }
        }

        logSecurityEvent('LOGIN_SUCCESS', { email: credentials.email, ip });
        return { id: user.id, name: user.name, email: user.email };
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
    async signIn({ user, account, req }) {
      const ip = getClientIp(req);
      logSecurityEvent('USER_SIGNIN', { userId: user.id, email: user.email, provider: account?.provider, ip });
    },
    async signOut({ token, session, req }) {
      const ip = getClientIp(req);
      logSecurityEvent('USER_SIGNOUT', { userId: token.id, email: token.email, ip });
    },
  },
});

export { handler as GET, handler as POST };
