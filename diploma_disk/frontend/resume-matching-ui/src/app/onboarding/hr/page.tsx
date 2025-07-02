'use client';
import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function HROnboardingPage() {
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      // 1️⃣ создаём компанию
      const companyRes = await api.post('/companies/', {
        name: companyName,
        maturity_level: 0, // будет пересчитан после анкеты
      });
      // 2️⃣ привязываем пользователя
      await api.post('/hrs/', { company: companyRes.data.id });
      // 3️⃣ анкета цифровой зрелости
      router.push('/survey');
    } catch {
      setError('Не удалось сохранить данные');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={6}>
        <Typography variant="h5" gutterBottom>О вашей компании</Typography>
        <TextField label="Название компании" fullWidth margin="normal" value={companyName} onChange={e => setCompanyName(e.target.value)} />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={handleSubmit}>
          Сохранить
        </Button>
      </Box>
    </Container>
  );
}
