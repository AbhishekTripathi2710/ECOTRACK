import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Grid,
  ThemeProvider,
  createTheme
} from '@mui/material';
import Navbar from '../components/navbar';

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    secondary: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

const Register = () => {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useUser();
    const navigate = useNavigate();

    async function submitHandler(e) {
        e.preventDefault();
        setError('');

        try {
            await register({
                fullname: { firstname, lastname },
                email,
                password
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    }

    return (
      <ThemeProvider theme={darkTheme}>
        <Navbar />
        <Box sx={{ backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)', py: 4, display: 'flex', alignItems: 'center' }}>
          <Container maxWidth="sm">
            <Paper elevation={0} sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 3, textAlign: 'center' }}>
                Create an Account
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              
              <form onSubmit={submitHandler}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      required
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      required
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{ mt: 2, mb: 2 }}
                    >
                      Register
                    </Button>
                  </Grid>
                </Grid>
              </form>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: darkTheme.palette.primary.main, textDecoration: 'none' }}>
                    Log in
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>
    );
};

export default Register;
