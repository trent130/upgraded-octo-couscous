import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { users } from '@/lib/models/user';
import { logSecurityEvent } from '@/lib/utils/logger';
import { hash } from 'bcrypt';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newPassword } = await req.json();

    if (!newPassword) {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 });
    }

    const user = users.find(u => u.email === session.user.email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update user's password
    user.password = hashedPassword;

    logSecurityEvent('PASSWORD_CHANGE', { userId: user.id, email: user.email });

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error in change password route:', error);
    logSecurityEvent('PASSWORD_CHANGE_ERROR', { error: error.message });
    return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
  }
}
