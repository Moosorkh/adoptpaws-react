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
import { Close, Login, Send, SupportAgent } from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import { useAuth } from '../context/AuthContext';
import AuthDialog from './AuthDialog';

// Enter animation replayed every time the widget is reopened.
const chatAppear = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9) translateY(16px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

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
  // Guests may send one message before being asked to log in.
  const [guestNeedsLogin, setGuestNeedsLogin] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, guestNeedsLogin]);

  // When the chat opens, auto-focus the input and scroll to the latest message.
  useEffect(() => {
    if (!open) return;

    const t = setTimeout(() => {
      inputRef.current?.focus();
      scrollToBottom();
    }, 50);

    return () => clearTimeout(t);
  }, [open]);

  // Clear any pending simulated-response timer if the widget unmounts.
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  // Once a guest logs in (e.g. via the chat's login prompt), re-enable
  // the conversation and remove the login required notice.
  useEffect(() => {
    if (isAuthenticated) {
      setGuestNeedsLogin(false);
    }
  }, [isAuthenticated]);

  const handleSendMessage = () => {
    const text = inputMessage.trim();
    if (!text) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Guests can send one message before they are asked to log in.
    if (!isAuthenticated) {
      setIsTyping(true);
      typingTimerRef.current = setTimeout(() => {
        setIsTyping(false);
        setGuestNeedsLogin(true);
      }, 900);
      return;
    }

    // Simulate support response
    setIsTyping(true);
    typingTimerRef.current = setTimeout(() => {
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
      typingTimerRef.current = null;
    }, 1500);
  };

  // 'Enter' sends the message; Shift+Enter inserts a newline.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!open) return null;

  return (
    <>
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
        flexDirection: 'column',
        animation: `${chatAppear} 0.25s ease-out`,
        transformOrigin: 'bottom right'
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
                bgcolor: message.sender === 'user' ? '#96BBBB' : '#ffffff',
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
                bgcolor: '#ffffff',
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

        {guestNeedsLogin && !isAuthenticated && (
          <Box sx={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
            <Box
              sx={{
                bgcolor: '#ffffff',
                p: 1.5,
                borderRadius: '12px 12px 12px 0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="body2">
                Thanks for reaching out! 💬 You have reached the guest message
                limit. Please{' '}
                <Box
                  component="span"
                  onClick={() => setAuthDialogOpen(true)}
                  sx={{
                    color: '#3E4E50',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  log in
                </Box>{' '}
                or create a free account to continue the conversation.
              </Typography>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          p: 2,
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          gap: 1
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder={
            !isAuthenticated && guestNeedsLogin
              ? 'Log in to continue chatting'
              : 'Type your message...'
          }
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
          disabled={isTyping || (!isAuthenticated && guestNeedsLogin)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
        {!isAuthenticated && guestNeedsLogin ? (
          <Button
            variant="contained"
            startIcon={<Login />}
            onClick={() => setAuthDialogOpen(true)}
            sx={{
              minWidth: 'auto',
              px: 2,
              bgcolor: '#96BBBB',
              '&:hover': {
                bgcolor: '#3E4E50'
              }
            }}
          >
            Login
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
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
        )}
      </Box>
      </Paper>

      {/* Auth dialog used when a guest hits the login-required limit */}
      {authDialogOpen && (
        <AuthDialog
          open={authDialogOpen}
          onClose={() => setAuthDialogOpen(false)}
          defaultTab="login"
        />
      )}
    </>
  );
};

export default ChatWidget;
