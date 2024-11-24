
'use client';

import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Button, Fab, Box } from '@mui/material';
import Link from 'next/link';
import ChatIcon from '@mui/icons-material/Chat';
import ChatUI from './chat/ChatUI';
import SearchBar from './search/SearchBar';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} href="/" style={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            Student Marketplace
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SearchBar />
            <Button color="inherit" component={Link} href="/products">
              Products
            </Button>
            <Button color="inherit" component={Link} href="/cart">
              Cart
            </Button>
            <Button color="inherit" component={Link} href="/wishlist">
              Wishlist
            </Button>
            {session ? (
              <>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Welcome, {session.user?.name}
                </Typography>
                <Button color="inherit" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button color="inherit" onClick={() => signIn()}>
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" style={{ marginTop: '2rem', marginBottom: '5rem', position: 'relative' }}>
        {children}
      </Container>
      <Fab 
        color="primary" 
        aria-label="chat"
        style={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <ChatIcon />
      </Fab>
      {isChatOpen && (
        <div style={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }}>
          <ChatUI />
        </div>
      )}
    </>
  );
}
