/* src/app/survey/page.tsx */
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Container,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface Question {
  id: number;
  text: string;
}

export default function SurveyPage() {
  const router = useRouter();

  const fetcher = (url: string) => api.get(url).then((res) => res.data);
  const { data: questions, error } = useSWR<Question[]>(
    '/maturity-questions/',
    fetcher
  );

  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggle =
    (qid: number) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setAnswers((prev) => ({ ...prev, [qid]: e.target.checked }));

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError(null);

    try {
      // Бек-энд ждёт массив объектов
      const payload = Object.entries(answers).map(([question_id, checked]) => ({
        question_id: Number(question_id),
        answer_value: checked ? 1 : 0,
      }));

      await api.post('/digital-maturity/submit/', payload);

      // ✅ Успешно — переходим к профилю (или куда нужно)
      router.push('/profile');
    } catch {
      setSubmitError('Не удалось отправить ответы, попробуйте ещё раз');
    } finally {
      setLoading(false);
    }
  };

  if (error)
    return <Alert severity="error">Не удалось загрузить вопросы анкеты</Alert>;
  if (!questions)
    return (
      <Box mt={6} textAlign="center">
        <CircularProgress />
      </Box>
    );

  return (
    <Container maxWidth="md">
      <Box mt={6}>
        <Typography variant="h4" gutterBottom>
          Анкета цифровой зрелости
        </Typography>

        <Stack spacing={1} sx={{ mb: 3 }}>
          {questions.map((q) => (
            <FormControlLabel
              key={q.id}
              control={
                <Checkbox
                  checked={!!answers[q.id]}
                  onChange={handleToggle(q.id)}
                />
              }
              label={q.text}
            />
          ))}
        </Stack>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Button variant="contained" disabled={loading} onClick={handleSubmit}>
          {loading ? 'Отправка…' : 'Отправить'}
        </Button>
      </Box>
    </Container>
  );
}
