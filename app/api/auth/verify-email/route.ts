import { NextResponse } from 'next/server';

// This is a mock database. In a real application, you would use a proper database.
let users = [];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
  }

  const user = users.find(u => u.verificationToken === token);

  if (!user) {
    return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 });
  }

  if (user.isVerified) {
    return NextResponse.json({ message: 'Email already verified' }, { status: 200 });
  }

  // Update user's verification status
  user.isVerified = true;
  user.verificationToken = null;

  return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
}
