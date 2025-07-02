'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@mui/material';
import ResumeList from '@/components/ResumeList';

export default function ResumePage() {
  return (
    <main style={{ paddingTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Button variant="contained" component={Link} href="/resume/new" sx={{ mb: 3 }}>
        Создать резюме
      </Button>
      <ResumeList />
    </main>
  );
}
