import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            bgcolor: '#f5f5f5',
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 500,
              textAlign: 'center',
              borderRadius: 3,
            }}
          >
            <ErrorOutline sx={{ fontSize: 64, color: '#d32f2f', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We're sorry for the inconvenience. Please try refreshing the page.
            </Typography>
            {this.state.error && import.meta.env.DEV && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 2,
                  p: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  textAlign: 'left',
                  overflow: 'auto',
                }}
              >
                {this.state.error.toString()}
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={this.handleReset}
              sx={{
                bgcolor: '#3E4E50',
                '&:hover': {
                  bgcolor: '#96BBBB',
                },
              }}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
