"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Manage2FA() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      // In a real app, you'd fetch the user's 2FA status from the server
      // For this example, we'll just use a mock value
      setIs2FAEnabled(true);
    }
  }, [status, router]);

  const handleDisable2FA = async () => {
    try {
      const response = await fetch('/api/auth/disable-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setIs2FAEnabled(false);
        setMessage(data.message);
      } else {
        setMessage(data.error || 'An error occurred');
      }
    } catch (error) {
      setMessage('An error occurred');
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Manage Two-Factor Authentication</h1>
      {is2FAEnabled ? (
        <div>
          <p className="mb-4">Two-factor authentication is currently enabled for your account.</p>
          <button
            onClick={handleDisable2FA}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Disable 2FA
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-4">Two-factor authentication is currently disabled for your account.</p>
          <button
            onClick={() => router.push('/auth/enable-2fa')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Enable 2FA
          </button>
        </div>
      )}
      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
}