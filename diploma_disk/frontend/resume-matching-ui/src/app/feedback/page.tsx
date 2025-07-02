// src/app/feedback/page.tsx
'use client';
import React from 'react';
import FeedbackForm from '@/components/FeedbackForm';

export default function FeedbackPage() {
  return (
    <main style={{ paddingTop: '80px' }}>
      <FeedbackForm />
    </main>
  );
}
