
'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '../../components/Layout';
import { Typography, Grid, Card, CardContent, CardMedia, Button, Rating, Box } from '@mui/material';
import { ShoppingCart, Favorite } from '@mui/icons-material';
import { useAppContext } from '../AppContext';

// Sample product data (in a real app, this would come from a database)
const allProducts = [
  { id: 1, name: 'Textbook Bundle', price: 150, image: 'https://placehold.co/200x300?text=Textbook+Bundle', rating: 4.5, category: 'Books' },
  { id: 2, name: 'Laptop', price: 800, image: 'https://placehold.co/200x300?text=Laptop', rating: 4.8, category: 'Electronics' },
  { id: 3, name: 'Backpack', price: 40, image: 'https://placehold.co/200x300?text=Backpack', rating: 4.2, category: 'Accessories' },
  { id: 4, name: 'Scientific Calculator', price: 20, image: 'https://placehold.co/200x300?text=Calculator', rating: 4.0, category: 'Electronics' },
  { id: 5, name: 'Desk Lamp', price: 25, image: 'https://placehold.co/200x300?text=Desk+Lamp', rating: 4.3, category: 'Accessories' },
  { id: 6, name: 'Notebook Set', price: 15, image: 'https://placehold.co/200x300?text=Notebook+Set', rating: 4.1, category: 'Stationery' },
];

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { addToCart, addToWishlist } = useAppContext();

  // Simple search function (case-insensitive)
  const searchProducts = (query: string) => {
    return allProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );
  };

  const searchResults = searchProducts(query);

  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Results for "{query}"
      </Typography>
      {searchResults.length === 0 ? (
        <Typography>No products found matching your search.</Typography>
      ) : (
        <Grid container spacing={4}>
          {searchResults.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                <Box sx={{ p: 2 }}>
                  <Button size="small" color="primary" startIcon={<ShoppingCart />} onClick={() => addToCart(product)}>
                    Add to Cart
                  </Button>
                  <Button size="small" color="secondary" startIcon={<Favorite />} onClick={() => addToWishlist(product)}>
                    Wishlist
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Layout>
  );
}
