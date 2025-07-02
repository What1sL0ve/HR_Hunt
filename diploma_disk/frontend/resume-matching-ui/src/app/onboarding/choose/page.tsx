/* eslint-disable react/jsx-one-expression-per-line */
'use client';
import { Container, Box, Typography, Stack, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function ChooseRolePage() {
  const router = useRouter();
  return (
    <Container maxWidth="sm">
      <Box mt={8} textAlign="center">
        <Typography variant="h5" gutterBottom>Выберите вашу роль</Typography>
        <Stack spacing={2} sx={{ mt: 4 }}>
          <Button variant="contained" size="large" onClick={() => router.push('/onboarding/candidate')}>
            Я соискатель
          </Button>
          <Button variant="contained" size="large" onClick={() => router.push('/onboarding/hr')}>
            Я HR-специалист
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
