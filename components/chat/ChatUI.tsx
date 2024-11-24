
'use client';

import React, { useState } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatUI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Welcome to Student Marketplace! How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: input.trim(),
        sender: 'user'
      };
      setMessages([...messages, newMessage]);
      setInput('');
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = {
          id: messages.length + 2,
          text: "Thank you for your message. A support representative will get back to you soon.",
          sender: 'bot'
        };
        setMessages(prevMessages => [...prevMessages, botResponse]);
      }, 1000);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Chat Support
      </Typography>
      <Box sx={{ height: 300, overflowY: 'auto', mb: 2 }}>
        <List>
          {messages.map((message) => (
            <ListItem key={message.id} sx={{ justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <Paper elevation={1} sx={{ p: 1, bgcolor: message.sender === 'user' ? 'primary.light' : 'grey.100' }}>
                <ListItemText primary={message.text} />
              </Paper>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ display: 'flex' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button variant="contained" endIcon={<SendIcon />} onClick={handleSend} sx={{ ml: 1 }}>
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatUI;
