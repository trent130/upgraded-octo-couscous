
'use client';

import React from 'react';
import Layout from '../../components/Layout';
import { Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Button, Box } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useAppContext } from '../AppContext';

export default function Cart() {
  const { cart, removeFromCart } = useAppContext();

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom>
        Shopping Cart
      </Typography>
      {cart.length === 0 ? (
        <Typography>Your cart is empty.</Typography>
      ) : (
        <>
          <List>
            {cart.map((item) => (
              <ListItem key={item.id}>
                <ListItemText
                  primary={item.name}
                  secondary={`$${item.price.toFixed(2)} x ${item.quantity}`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete" onClick={() => removeFromCart(item.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Total: ${totalPrice.toFixed(2)}
            </Typography>
            <Button variant="contained" color="primary">
              Checkout
            </Button>
          </Box>
        </>
      )}
    </Layout>
  );
}
