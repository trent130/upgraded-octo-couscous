
'use client';

import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import SearchBar from './search/SearchBar';

export default function ClientLayout() {
  const { data: session } = useSession();

  return (
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
  );
}
