'use client';
import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';
import api from '@/lib/axios';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/user/registration/', {
        email,
        password,
        full_name: fullName,
      });
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      window.location.href = '/onboarding/choose';
    } catch {
      setError('Не удалось зарегистрироваться');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8}>
        <Typography variant="h4" gutterBottom>Регистрация</Typography>
        <TextField fullWidth label="Email" margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
        <TextField fullWidth label="Пароль" type="password" margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
        <TextField fullWidth label="ФИО" margin="normal" value={fullName} onChange={e => setFullName(e.target.value)} />

        {error && <Alert sx={{ mt: 2 }} severity="error">{error}</Alert>}

        <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={handleSubmit} disabled={loading}>
          {loading ? '...' : 'Создать аккаунт'}
        </Button>
      </Box>
    </Container>
  );
}
