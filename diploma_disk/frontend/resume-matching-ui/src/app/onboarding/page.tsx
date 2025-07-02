'use client';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { CircularProgress, Container, Box } from '@mui/material';
import api from '@/lib/axios';

export default function OnboardingPage() {
  const router = useRouter();
  const fetcher = (url: string) => api.get(url).then(res => res.data);
  const { data, error } = useSWR('/profile/', fetcher, { shouldRetryOnError: false });

  if (error) {
    // 404 -> profile not found, go choose role
    if (error.response?.status === 404) {
      router.push('/onboarding/choose');
      return null;
    }
    // Other errors
    return <Container><Box mt={6}>Ошибка загрузки профиля</Box></Container>;
  }

  if (!data) {
    return (<Container><Box mt={6} textAlign="center"><CircularProgress /></Box></Container>);
  }

  // Profile exists -> redirect home
  router.push('/');
  return null;
}
