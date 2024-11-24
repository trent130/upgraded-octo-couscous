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
    // ... (keep existing fetchThirdPartyApps logic)
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    // ... (keep existing handleUpdateProfile logic)
  };

  const handleDownloadData = async () => {
    // ... (keep existing handleDownloadData logic)
  };

  const handleRevokeAccess = async (appId: string) => {
    // ... (keep existing handleRevokeAccess logic)
  };

  const handleDeleteAccount = async () => {
    // ... (keep existing handleDeleteAccount logic)
  };

  const checkWebAuthnStatus = async () => {
    try {
      const response = await fetch('/api/user/webauthn-status');
      if (response.ok) {
        const data = await response.json();
        setWebAuthnRegistered(data.registered);
      }
    } catch (error) {
      console.error('Failed to check WebAuthn status:', error);
    }
  };

  const handleRegisterWebAuthn = async () => {
    try {
      // Get registration options from the server
      const optionsRes = await fetch('/api/auth/webauthn/register');
      const options = await optionsRes.json();

      // Start the registration process
      const attResp = await startRegistration(options);

      // Send the response to the server for verification
      const verificationRes = await fetch('/api/auth/webauthn/register/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attResp),
      });

      const verificationResult = await verificationRes.json();

      if (verificationResult.verified) {
        setWebAuthnRegistered(true);
        setMessage('WebAuthn registered successfully');
      } else {
        setMessage('WebAuthn registration failed');
      }
    } catch (error) {
      console.error('Error during WebAuthn registration:', error);
      setMessage('An error occurred during WebAuthn registration');
    }
  };

  const handleAuthenticateWebAuthn = async () => {
    try {
      // Get authentication options from the server
      const optionsRes = await fetch('/api/auth/webauthn/authenticate');
      const options = await optionsRes.json();

      // Start the authentication process
      const attResp = await startAuthentication(options);

      // Send the response to the server for verification
      const verificationRes = await fetch('/api/auth/webauthn/authenticate/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attResp),
      });

      const verificationResult = await verificationRes.json();

      if (verificationResult.verified) {
        setMessage('WebAuthn authentication successful');
      } else {
        setMessage('WebAuthn authentication failed');
      }
    } catch (error) {
      console.error('Error during WebAuthn authentication:', error);
      setMessage('An error occurred during WebAuthn authentication');
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      {/* ... (keep existing profile form) ... */}
      
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

      {/* ... (keep existing third-party app access and account deletion sections) ... */}

      {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
    </div>
  );
}
