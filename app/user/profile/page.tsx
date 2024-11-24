"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export default function UserProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [thirdPartyApps, setThirdPartyApps] = useState<string[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [webAuthnRegistered, setWebAuthnRegistered] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      fetchThirdPartyApps();
      checkWebAuthnStatus();
    }
  }, [status, session, router]);

  const fetchThirdPartyApps = async () => {
    try {
      const response = await fetch('/api/user/app-access');
      if (response.ok) {
        const apps = await response.json();
        setThirdPartyApps(apps);
      }
    } catch (error) {
      console.error('Failed to fetch third-party apps:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement profile update logic here
    setMessage('Profile update functionality not implemented yet.');
  };

  const handleDownloadData = async () => {
    try {
      const response = await fetch('/api/user/data-export', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'user_data.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setMessage('Your data has been downloaded.');
      } else {
        setMessage('Failed to download data. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading user data:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  const handleRevokeAccess = async (appId: string) => {
    try {
      const response = await fetch('/api/user/app-access', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId }),
      });

      if (response.ok) {
        setThirdPartyApps(thirdPartyApps.filter(app => app !== appId));
        setMessage('App access revoked successfully.');
      } else {
        setMessage('Failed to revoke app access. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmDelete: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Account deletion scheduled for ${new Date(data.deletionDate).toLocaleString()}. You will be signed out now.`);
        setTimeout(() => {
          signOut({ callbackUrl: '/' });
        }, 5000);
      } else {
        setMessage('Failed to initiate account deletion. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  // ... (keep existing WebAuthn-related functions)

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Update Profile
        </button>
      </form>
      
      <div className="mt-4">
        <button onClick={handleDownloadData} className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Download My Data
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">WebAuthn</h2>
        {webAuthnRegistered ? (
          <div>
            <p>WebAuthn is registered for this account.</p>
            <button
              onClick={handleAuthenticateWebAuthn}
              className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Authenticate with WebAuthn
            </button>
          </div>
        ) : (
          <div>
            <p>WebAuthn is not registered for this account.</p>
            <button
              onClick={handleRegisterWebAuthn}
              className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Register WebAuthn
            </button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Third-Party App Access</h2>
        {thirdPartyApps.length > 0 ? (
          <ul className="space-y-2">
            {thirdPartyApps.map((app) => (
              <li key={app} className="flex justify-between items-center">
                <span>{app}</span>
                <button
                  onClick={() => handleRevokeAccess(app)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  Revoke Access
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No third-party apps have access to your account.</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Delete Account</h2>
        {!showDeleteConfirmation ? (
          <button
            onClick={() => setShowDeleteConfirmation(true)}
            className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Delete My Account
          </button>
        ) : (
          <div>
            <p className="mb-2">Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="flex space-x-2">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
    </div>
  );
}
