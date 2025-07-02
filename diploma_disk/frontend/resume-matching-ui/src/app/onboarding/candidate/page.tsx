/* src/app/onboarding/candidate/page.tsx */
'use client';

import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function CandidateOnboardingPage() {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [contactEmail, setContactEmail] = useState('');   // email для связи
  const [about, setAbout] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      await api.post('/candidates/', {
        full_name: fullName,
        email: contactEmail,            // передаём email на бэкенд
        age: Number(age),
        about,
      });
      router.push('/profile');
    } catch {
      setError('Не удалось сохранить данные');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={6}>
        <Typography variant="h5" gutterBottom>
          Заполните данные о себе
        </Typography>

        <TextField
          label="Полное имя"
          fullWidth
          margin="normal"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <TextField
          label="Возраст"
          fullWidth
          type="number"
          margin="normal"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <TextField
          label="Email для связи"
          fullWidth
          type="email"
          margin="normal"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />

        <TextField
          label="О себе"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleSubmit}
        >
          Сохранить
        </Button>
      </Box>
    </Container>
  );
}
