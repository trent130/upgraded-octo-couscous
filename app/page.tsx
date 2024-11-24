
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import { Grid, Card, CardContent, CardMedia, Typography, Button, CardActions, Rating } from '@mui/material';
import { ShoppingCart, Favorite } from '@mui/icons-material';
import { useAppContext } from './AppContext';

const products = [
  { id: 1, name: 'Textbook', price: 50, image: 'https://placehold.co/200x300?text=Textbook', rating: 4.5 },
  { id: 2, name: 'Laptop', price: 800, image: 'https://placehold.co/200x300?text=Laptop', rating: 4.8 },
  { id: 3, name: 'Backpack', price: 40, image: 'https://placehold.co/200x300?text=Backpack', rating: 4.2 },
  { id: 4, name: 'Calculator', price: 20, image: 'https://placehold.co/200x300?text=Calculator', rating: 4.0 },
  { id: 5, name: 'Desk Lamp', price: 25, image: 'https://placehold.co/200x300?text=Desk+Lamp', rating: 4.3 },
  { id: 6, name: 'Notebook Set', price: 15, image: 'https://placehold.co/200x300?text=Notebook+Set', rating: 4.1 },
];

export default function Home() {
  const router = useRouter();
  const { addToCart, addToWishlist } = useAppContext();

  const handleProductClick = (productId: number) => {
    router.push(`/products/${productId}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleAddToWishlist = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToWishlist(product);
  };

  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Student Marketplace
      </Typography>
      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => handleProductClick(product.id)}>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ${product.price.toFixed(2)}
                </Typography>
                <Rating name={`rating-${product.id}`} value={product.rating} precision={0.1} readOnly />
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" startIcon={<ShoppingCart />} onClick={(e) => handleAddToCart(e, product)}>
                  Add to Cart
                </Button>
                <Button size="small" color="secondary" startIcon={<Favorite />} onClick={(e) => handleAddToWishlist(e, product)}>
                  Wishlist
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}
