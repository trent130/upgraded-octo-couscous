import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { compare } from 'bcrypt';
import { rateLimit, getClientIp, resetRateLimit } from '@/lib/utils/rateLimiter';
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        const ip = getClientIp(req);
        const ipRateLimitResult = rateLimit(ip, true);
        const userRateLimitResult = rateLimit(credentials.email);

        if (!ipRateLimitResult.allowed || !userRateLimitResult.allowed) {
          const lockoutMinutes = Math.ceil((Math.max(ipRateLimitResult.lockedUntil || 0, userRateLimitResult.lockedUntil || 0) - Date.now()) / 60000);
          logSecurityEvent('ACCOUNT_LOCKED', { email: credentials.email, ip });
          throw new Error(`Account locked. Please try again in ${lockoutMinutes} minutes.`);
        }

        const user = users.find(user => user.email === credentials.email);

        if (!user) {
          logSecurityEvent('LOGIN_ATTEMPT_USER_NOT_FOUND', { email: credentials.email, ip });
          throw new Error('No user found with this email');
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          logSecurityEvent('LOGIN_ATTEMPT_INVALID_PASSWORD', { email: credentials.email, ip });
          await notifyUserOfSuspiciousActivity(user, 'Failed login attempt', { ip });
          throw new Error('Invalid password');
        }

        // ... (keep existing 2FA logic)

        // Reset rate limit on successful login
        resetRateLimit(credentials.email);
        resetRateLimit(ip, true);

        const sessionId = await createSession(user.id);
        logSecurityEvent('LOGIN_SUCCESS', { email: credentials.email, ip });
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
    // ... (keep existing callbacks)
  },
  events: {
    // ... (keep existing events)
  },
});

export { handler as GET, handler as POST };
