/* src/app/hr/vacancies/new/page.tsx */
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
} from '@mui/material';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Skill {
  id: number;
  title: string;
}

export default function VacancyCreatePage() {
  const router = useRouter();

  /** ────────── 1. Загружаем навыки ────────── */
  const fetcher = (url: string) =>
    api.get(url).then((r) => {
      const data = r.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.results)) return data.results;
      if (Array.isArray(data.data)) return data.data;
      return [];
    });

  const {
    data: skills = [],
    error: skillsError,
  } = useSWR<Skill[]>('/skills/', fetcher);

  /** ────────── 2. Состояние формы ────────── */
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** ────────── 3. Отправляем форму ────────── */
  const handleSubmit = async () => {
    // бек-энд требует обязательное поле skills
    if (!selectedSkills.length) {
      setSubmitError('Добавьте хотя бы один навык');
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      await api.post('/vacancies/', {
        title,
        description,
        skills: selectedSkills.map((s) => s.id), // ▶️ ключ, который ждёт бэкенд
      });

      router.push('/');
    } catch {
      setSubmitError('Не удалось создать вакансию, попробуйте ещё раз');
    } finally {
      setLoading(false);
    }
  };

  /** ────────── 4. Загрузка / ошибки ────────── */
  if (skillsError)
    return (
      <Alert severity="error">Не удалось загрузить список навыков</Alert>
    );
  if (!skills.length)
    return (
      <Box mt={6} textAlign="center">
        <CircularProgress />
      </Box>
    );

  /** ────────── 5. UI ────────── */
  return (
    <Container maxWidth="sm">
      <Box mt={6}>
        <Typography variant="h5" gutterBottom>
          Создание вакансии
        </Typography>

        <TextField
          label="Название вакансии"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          label="Описание"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Autocomplete
          multiple
          options={skills}
          getOptionLabel={(o) => o.title}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          value={selectedSkills}
          onChange={(_, v) => setSelectedSkills(v)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option.id}
                label={option.title}
              />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} label="Навыки (обязательно)" margin="normal" />
          )}
        />

        {submitError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {submitError}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Создание…' : 'Создать вакансию'}
        </Button>
      </Box>
    </Container>
  );
}
