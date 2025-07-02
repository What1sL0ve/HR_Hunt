'use client';
import React, { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import {
  Box,
  Checkbox,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '@/lib/axios';

/* типы -------------------------------------------------- */
interface Skill {
  id: number;
  title: string;
  description: string;
  weight: number;
}
interface CandidateSkill {
  skill: Skill;
  rank: number;
}
interface Resume {
  id: number;
  name?: string;        // ← новое поле
  title?: string;       // (на случай старых записей)
  is_active: boolean;
  digital_maturity_score: number;
  skills: CandidateSkill[];
}

/* компонент --------------------------------------------- */
export default function ResumeList() {
  const { data, isLoading, mutate } = useSWR('/resumes/', fetcher);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  /* приводим любые ответы к массиву резюме */
  const resumes: Resume[] = Array.isArray(data)
    ? data
    : data?.results ?? [];

  const toggleActive = async (resume: Resume) => {
    setUpdatingId(resume.id);
    try {
      await api.patch(`/resumes/${resume.id}/`, {
        is_active: !resume.is_active,
      });
      mutate();                       // обновляем список после PATCH
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <CircularProgress />;
  if (!resumes.length) return <Typography>У вас пока нет резюме.</Typography>;

  return (
    <Box sx={{ mt: 4, maxWidth: 600 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Мои резюме
        </Typography>
        <IconButton onClick={() => mutate()}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <List>
        {resumes.map((resume) => (
          <ListItem
            key={resume.id}
            secondaryAction={
              <Checkbox
                edge="end"
                checked={resume.is_active}
                onChange={() => toggleActive(resume)}
                disabled={updatingId === resume.id}
              />
            }
          >
            <ListItemText
              /* показываем название — name → title → fallback по id */
              primary={resume.name || resume.title || `Резюме #${resume.id}`}
              secondary={`Score: ${resume.digital_maturity_score} | Навыков: ${resume.skills.length}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
