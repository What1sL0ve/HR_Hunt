'use client';
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import api from '@/lib/axios';

export default function FeedbackForm() {
  /* --------- локальное состояние --------- */
  const [name, setName] = useState('');
  const [universityEmail, setUniversityEmail] = useState(''); // новое поле
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* --------- отправка формы --------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      /* делаем вид, что шлём на бэкенд */
      await api.post('/feedback/', {
        name,
        university_email: universityEmail,
        message,
      });

      /* если всё хорошо */
      setSuccess(true);
      setName('');
      setUniversityEmail('');
      setMessage('');
    } catch (err: any) {
      console.error(err);
      setError('Не удалось отправить сообщение. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}
    >
      <Typography variant="h5" gutterBottom>
        Обратная связь
      </Typography>

      <TextField
        label="Ваше имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />

      {/* --------- новое поле e-mail ВУЗа --------- */}
      <TextField
        label="E-mail ВУЗа"
        type="email"
        value={universityEmail}
        onChange={(e) => setUniversityEmail(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />

      <TextField
        label="Сообщение"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        fullWidth
        multiline
        rows={4}
        required
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'Отправить'}
      </Button>

      {/* --------- статус --------- */}
      {success && (
        <Alert sx={{ mt: 2 }} severity="success">
          Спасибо! Ваше сообщение успешно отправлено.
        </Alert>
      )}
      {error && (
        <Alert sx={{ mt: 2 }} severity="error">
          {error}
        </Alert>
      )}
    </Box>
  );
}
