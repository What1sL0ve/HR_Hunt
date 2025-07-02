'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import {
  Container,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Box,
  Stack,
  Button,
} from '@mui/material';

export default function HomePage() {
  /* SWR + небольшой лог — увидите “SWR fetch /vacancies/” в консоли */
  const { data, error } = useSWR('/vacancies/', (url) => {
    console.log('[HomePage] SWR fetch', url);
    return fetcher(url);
  });

  const vacancies = Array.isArray(data) ? data : data?.results ?? [];

  const [isAuth, setIsAuth] = useState(false);
  useEffect(() => {
    setIsAuth(Boolean(localStorage.getItem('access_token')));
  }, []);

  return (
    <Container maxWidth="md">
      {/* ----- CTA ----- */}
      <Box textAlign="center" mt={4} mb={4}>
        {!isAuth ? (
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" component={Link} href="/login">
              Войти
            </Button>
            <Button variant="outlined" component={Link} href="/register">
              Регистрация
            </Button>
          </Stack>
        ) : (
          <Button variant="contained" component={Link} href="/vacancy/new">
            Создать вакансию
          </Button>
        )}
      </Box>

      {/* ----- список вакансий ----- */}
      {!data && !error && <CircularProgress />}
      {error && <Typography color="error">Ошибка загрузки вакансий</Typography>}

      {!!vacancies.length && (
        <>
          <Typography variant="h5" gutterBottom>
            Список вакансий
          </Typography>
          <List>
            {vacancies.map((v: any) => (
              <ListItemButton key={v.id} component={Link} href={`/vacancy/${v.id}`}>
                <ListItemText primary={v.title} secondary={v.description} />
              </ListItemButton>
            ))}
          </List>
        </>
      )}

      {data && !vacancies.length && (
        <Typography color="text.secondary">Вакансий пока нет.</Typography>
      )}
    </Container>
  );
}
