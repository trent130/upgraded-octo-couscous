
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Layout from '../../../components/Layout';
import { Typography, Card, CardMedia, CardContent, Button, Rating, Box } from '@mui/material';
import { ShoppingCart, Favorite } from '@mui/icons-material';
import { useAppContext } from '../../AppContext';

const products = [
  { id: 1, name: 'Textbook', price: 50, image: 'https://placehold.co/200x300?text=Textbook', rating: 4.5, description: 'A comprehensive textbook for students.' },
  { id: 2, name: 'Laptop', price: 800, image: 'https://placehold.co/200x300?text=Laptop', rating: 4.8, description: 'A powerful laptop for all your study needs.' },
  { id: 3, name: 'Backpack', price: 40, image: 'https://placehold.co/200x300?text=Backpack', rating: 4.2, description: 'A durable backpack with multiple compartments.' },
  { id: 4, name: 'Calculator', price: 20, image: 'https://placehold.co/200x300?text=Calculator', rating: 4.0, description: 'A scientific calculator for complex calculations.' },
  { id: 5, name: 'Desk Lamp', price: 25, image: 'https://placehold.co/200x300?text=Desk+Lamp', rating: 4.3, description: 'An adjustable desk lamp for late-night studying.' },
  { id: 6, name: 'Notebook Set', price: 15, image: 'https://placehold.co/200x300?text=Notebook+Set', rating: 4.1, description: 'A set of high-quality notebooks for all your classes.' },
];

export default function ProductDetail() {
  const params = useParams();
  const productId = Number(params.id);
  const product = products.find(p => p.id === productId);
  const { addToCart, addToWishlist } = useAppContext();

  if (!product) {
    return (
      <Layout>
        <Typography variant="h4" component="h1">Product not found</Typography>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleAddToWishlist = () => {
    addToWishlist(product);
  };

  return (
    <Layout>
      <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, my: 4 }}>
        <CardMedia
          component="img"
          sx={{ width: { xs: '100%', md: 300 }, height: 'auto' }}
          image={product.image}
          alt={product.name}
        />
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            ${product.price.toFixed(2)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating name="product-rating" value={product.rating} precision={0.1} readOnly />
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({product.rating.toFixed(1)})
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" startIcon={<ShoppingCart />} sx={{ mr: 2 }} onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button variant="outlined" color="secondary" startIcon={<Favorite />} onClick={handleAddToWishlist}>
              Add to Wishlist
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Layout>
  );
}
