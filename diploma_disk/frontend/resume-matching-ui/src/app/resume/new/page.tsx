'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import ResumeForm from '@/components/ResumeForm';

export default function CreateResumePage() {
  const router = useRouter();

  return (
    <main
      style={{
        paddingTop: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <ResumeForm onCreated={() => router.push('/resume')} />
    </main>
  );
}
