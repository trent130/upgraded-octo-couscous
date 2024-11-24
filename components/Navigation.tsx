import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Your App Name
        </Link>
        <div>
          {session ? (
            <>
              <span className="mr-4">Welcome, {session.user?.name || session.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth/signin" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
