import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import crypto from 'crypto';

// This is a mock database. In a real application, you would use a proper database.
let users = [];

// Mock function to send verification email
async function sendVerificationEmail(email: string, token: string) {
  console.log();
  // In a real application, you would send an actual email here
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken
    };

    // Add user to mock database
    users.push(newUser);

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({ message: 'User created successfully. Please check your email to verify your account.' }, { status: 201 });
  } catch (error) {
    console.error('Error in signup route:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
  }
}
