'use client';
import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Divider,
} from '@mui/material';
import ResumeList from '@/components/ResumeList';

export default function ProfilePage() {
  const { data: profile, error } = useSWR('/profile/', fetcher);

  /* ---------- загрузка / ошибка ---------- */
  if (!profile && !error) {
    return (
      <Container sx={{ textAlign: 'center', mt: 6 }}>
        <CircularProgress />
      </Container>
    );
  }
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">Ошибка профиля</Typography>
      </Container>
    );
  }

  const isCandidate = profile.role === 'candidate';
  const isHR        = profile.role === 'hr';

  return (
    <Container sx={{ mt: 4 }}>
      {/* ---------- основные данные пользователя ---------- */}
      <Typography variant="h4">{profile.full_name}</Typography>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        {profile.email}
      </Typography>

      {/* ---------- блок HR / Компания ---------- */}
      {isHR && profile.company && (
        <Box sx={{ mb: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Компания
          </Typography>
          <Typography>Название: {profile.company.name}</Typography>
          {'maturity_level' in profile.company && (
            <Typography>
              Уровень цифровой зрелости: {profile.company.maturity_level}
            </Typography>
          )}
          {/* при желании можно вывести ещё поля HR */}
          <Typography sx={{ mt: 1 }}>ID HR: {profile.id}</Typography>
        </Box>
      )}

      {/* ---------- блок «Мои резюме» для кандидата ---------- */}
      {isCandidate && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Мои резюме
          </Typography>
          <ResumeList />
        </Box>
      )}
    </Container>
  );
}
