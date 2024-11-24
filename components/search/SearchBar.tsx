
'use client';

import React, { useState } from 'react';
import { InputBase, IconButton, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // In a real application, you would implement the search functionality here
      // For now, we'll just navigate to a search results page
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <Paper component="form" onSubmit={handleSearch} sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search for products..."
        inputProps={{ 'aria-label': 'search products' }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default SearchBar;
