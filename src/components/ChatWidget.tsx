import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Avatar,
  CircularProgress
} from '@mui/material';
import { Close, Send, SupportAgent } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

interface ChatWidgetProps {
  open: boolean;
  onClose: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ open, onClose }) => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! 👋 How can we help you today?',
      sender: 'support',
      timestamp: new Date()
    },
    {
      id: '2',
      text: 'Are you looking to adopt a pet or do you have questions about the adoption process?',
      sender: 'support',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    if (!isAuthenticated) {
      alert('Please login to use the chat feature');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate support response
    setIsTyping(true);
    setTimeout(() => {
      const responses = [
        "Thank you for your message! Our team will get back to you shortly.",
        "That's a great question! Let me connect you with our adoption specialist.",
        "I'd be happy to help you with that. Can you provide more details?",
        "We have several wonderful pets available. Would you like to see our current listings?",
        "Our adoption fees include vaccinations, spaying/neutering, and a starter care package."
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'support',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, supportMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!open) return null;

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        bottom: { xs: 70, sm: 90 },
        right: { xs: 10, sm: 70 },
        width: { xs: 'calc(100% - 20px)', sm: 350 },
        height: { xs: 500, sm: 450 },
        borderRadius: 2,
        overflow: 'hidden',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: '#96BBBB',
          color: 'white',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#3E4E50' }}>
            <SupportAgent fontSize="small" />
          </Avatar>
          <Box>
            <Typography fontWeight="bold" variant="body1">
              Pet Adoption Support
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Online
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" sx={{ color: 'white' }} onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#f8f8f8',
          p: 2,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}
          >
            <Box
              sx={{
                bgcolor: message.sender === 'user' ? '#96BBBB' : 'white',
                color: message.sender === 'user' ? 'white' : 'text.primary',
                p: 1.5,
                borderRadius:
                  message.sender === 'user'
                    ? '12px 12px 0 12px'
                    : '12px 12px 12px 0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="body2">{message.text}</Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mt: 0.5,
                textAlign: message.sender === 'user' ? 'right' : 'left'
              }}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
        ))}

        {isTyping && (
          <Box sx={{ alignSelf: 'flex-start' }}>
            <Box
              sx={{
                bgcolor: 'white',
                p: 1.5,
                borderRadius: '12px 12px 12px 0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                display: 'flex',
                gap: 0.5
              }}
            >
              <CircularProgress size={6} />
              <CircularProgress size={6} />
              <CircularProgress size={6} />
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          bgcolor: 'white',
          p: 2,
          borderTop: '1px solid #eee',
          display: 'flex',
          gap: 1
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder={
            isAuthenticated
              ? 'Type your message...'
              : 'Login to send messages'
          }
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isAuthenticated || isTyping}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || !isAuthenticated || isTyping}
          sx={{
            minWidth: 'auto',
            px: 2,
            bgcolor: '#96BBBB',
            '&:hover': {
              bgcolor: '#3E4E50'
            }
          }}
        >
          <Send fontSize="small" />
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatWidget;
