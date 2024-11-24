
'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Student Marketplace
          </Typography>
          <Button color="inherit" component={Link} href="/">
            Home
          </Button>
          <Button color="inherit" component={Link} href="/products">
            Products
          </Button>
          <Button color="inherit" component={Link} href="/cart">
            Cart
          </Button>
          <Button color="inherit" component={Link} href="/wishlist">
            Wishlist
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
        {children}
      </Container>
    </>
  );
}
