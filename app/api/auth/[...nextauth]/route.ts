import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { rateLimit } from '@/lib/utils/rateLimiter';
import { verifyTOTP } from '@/lib/utils/twoFactorAuth';
import { users } from '@/lib/models/user';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        if (!rateLimit(credentials.email)) {
          throw new Error('Too many login attempts. Please try again later.');
        }

        const user = users.find(user => user.email === credentials.email);

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        if (user.isTwoFactorEnabled) {
          if (!credentials.totpCode) {
            throw new Error('2FA code required');
          }

          const isTotpValid = verifyTOTP(credentials.totpCode, user.twoFactorSecret);

          if (!isTotpValid) {
            throw new Error('Invalid 2FA code');
          }
        }

        return { id: user.id, name: user.name, email: user.email };
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
