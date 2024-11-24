
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import { Grid, Card, CardContent, CardMedia, Typography, Button, CardActions, Rating, Box } from '@mui/material';
import { ShoppingCart, Favorite, School } from '@mui/icons-material';
import { useAppContext } from './AppContext';

// Sample product data (in a real app, this would come from a database)
const products = [
  { id: 1, name: 'Textbook Bundle', price: 150, image: 'https://placehold.co/200x300?text=Textbook+Bundle', rating: 4.5, category: 'Books' },
  { id: 2, name: 'Laptop', price: 800, image: 'https://placehold.co/200x300?text=Laptop', rating: 4.8, category: 'Electronics' },
  { id: 3, name: 'Backpack', price: 40, image: 'https://placehold.co/200x300?text=Backpack', rating: 4.2, category: 'Accessories' },
  { id: 4, name: 'Scientific Calculator', price: 20, image: 'https://placehold.co/200x300?text=Calculator', rating: 4.0, category: 'Electronics' },
  { id: 5, name: 'Desk Lamp', price: 25, image: 'https://placehold.co/200x300?text=Desk+Lamp', rating: 4.3, category: 'Accessories' },
  { id: 6, name: 'Notebook Set', price: 15, image: 'https://placehold.co/200x300?text=Notebook+Set', rating: 4.1, category: 'Stationery' },
];

export default function Home() {
  const router = useRouter();
  const { addToCart, addToWishlist } = useAppContext();

  // Handler for product card click
  const handleProductClick = (productId: number) => {
    router.push(`/products/${productId}`);
  };

  // Handler for adding product to cart
  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToCart(product);
    // TODO: Add a toast notification for better user feedback
  };

  // Handler for adding product to wishlist
  const handleAddToWishlist = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToWishlist(product);
    // TODO: Add a toast notification for better user feedback
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Student Marketplace
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Your one-stop shop for all your academic needs!
        </Typography>
      </Box>
      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card sx={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }} onClick={() => handleProductClick(product.id)}>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ${product.price.toFixed(2)}
                </Typography>
                <Rating name={`rating-${product.id}`} value={product.rating} precision={0.1} readOnly />
                <Typography variant="body2" color="text.secondary">
                  Category: {product.category}
                </Typography>
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
