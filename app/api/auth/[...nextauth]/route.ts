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
          logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip, email: credentials.email });
          throw new Error(`Too many requests. Please try again in ${lockoutMinutes} minutes.`);
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

        if (user.isTwoFactorEnabled) {
          if (user.twoFactorSecret) {
            if (!credentials.totpCode) {
              logSecurityEvent('LOGIN_ATTEMPT_2FA_REQUIRED', { email: credentials.email, ip });
              throw new Error('2FA code required');
            }

            const isTotpValid = verifyTOTP(credentials.totpCode, user.twoFactorSecret);

            if (!isTotpValid) {
              logSecurityEvent('LOGIN_ATTEMPT_INVALID_2FA', { email: credentials.email, ip });
              await notifyUserOfSuspiciousActivity(user, 'Invalid 2FA code', { ip });
              throw new Error('Invalid 2FA code');
            }
          } else {
            if (!credentials.emailCode) {
              // Generate and send email code
              const code = await generateAndSendEmailCode(user.email);
              user.emailAuthCode = code;
              user.emailAuthCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
              logSecurityEvent('LOGIN_ATTEMPT_EMAIL_2FA_REQUIRED', { email: credentials.email, ip });
              throw new Error('Email verification code required');
            }

            if (credentials.emailCode !== user.emailAuthCode || Date.now() > (user.emailAuthCodeExpiry || 0)) {
              logSecurityEvent('LOGIN_ATTEMPT_INVALID_EMAIL_2FA', { email: credentials.email, ip });
              await notifyUserOfSuspiciousActivity(user, 'Invalid email verification code', { ip });
              throw new Error('Invalid or expired email verification code');
            }

            // Clear the email code after successful verification
            user.emailAuthCode = null;
            user.emailAuthCodeExpiry = null;
          }
        }

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
