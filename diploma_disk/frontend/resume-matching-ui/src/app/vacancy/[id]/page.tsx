/* src/app/vacancy/[id]/page.tsx  */
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import api from '@/lib/axios';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
  Box,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from '@mui/material';

/* -------------------- типы -------------------- */
interface Skill {
  id: number;
  title: string;
  rank?: string | number;
}

interface Candidate {
  id: number;
  full_name: string;
  email: string;
  match_score?: number;
  skills: Skill[];
}

/* -------------------- компонент -------------------- */
export default function VacancyResumesPage() {
  const { id } = useParams(); // id вакансии из URL

  /* --- загрузка резюме --- */
  const fetcher = (url: string) => api.get(url).then((r) => r.data);
  const { data, error, isLoading } = useSWR<{ results: Candidate[] }>(
    `/recommendations/resumes/${id}/`,
    fetcher
  );

  /* --- состояния окна обратной связи --- */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<Candidate | null>(
    null
  );

  const [goodSkills, setGoodSkills] = useState<Skill[]>([]);
  const [avgSkills, setAvgSkills] = useState<Skill[]>([]);
  const [badSkills, setBadSkills] = useState<Skill[]>([]);
  const [universityEmail, setUniversityEmail] = useState('');
  const [comment, setComment] = useState('');

  const equal = (o: Skill, v: Skill) => o.id === v.id;

  /* --- открыть диалог --- */
  const openFeedback = (cand: Candidate) => {
    setCurrentCandidate(cand);
    setGoodSkills([]);
    setAvgSkills([]);
    setBadSkills([]);
    setUniversityEmail('');
    setComment('');
    setDialogOpen(true);
  };

  /* --- отправить обратную связь --- */
  const sendFeedback = async () => {
    if (!currentCandidate) return;

    const buildReqs = (arr: Skill[], lvl: 1 | 2 | 3) =>
      arr.map((sk) =>
        api.post('/discipline-feedback/', {
          candidate: currentCandidate.id,
          discipline: sk.title,
          knowledge_level: lvl, // 3 good / 2 avg / 1 bad
          comment,
          university_email: universityEmail,
        })
      );

    try {
      await Promise.all([
        ...buildReqs(goodSkills, 3),
        ...buildReqs(avgSkills, 2),
        ...buildReqs(badSkills, 1),
      ]);
      setDialogOpen(false);
    } catch {
      alert('Ошибка при отправке обратной связи');
    }
  };

  /* -------------------- UI -------------------- */

  if (isLoading) {
    return (
      <Box textAlign="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={6}>
        <Typography color="error">
          Не удалось загрузить список кандидатов
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Подходящие резюме
      </Typography>

      <List>
        {data?.results.map((cand, idx) => (
          <Box key={cand.id}>
            {idx !== 0 && <Divider />}

            <ListItem alignItems="flex-start">
              <ListItemText
                primary={cand.full_name}
                secondary={
                  <>
                    {/* 🟢 показываем подходящесть первым пунктом */}
                    <Typography
                      component="span"
                      variant="subtitle2"
                      gutterBottom
                      sx={{ color: 'green' }}
                    >
                      Подходящесть:&nbsp;
                      {((cand.match_score ?? 0) * 100).toFixed(0)}%
                    </Typography>

                    <Typography
                      component="span"
                      variant="subtitle2"
                      gutterBottom
                      display="block"
                    >
                      Email: {cand.email}
                    </Typography>

                    <Typography
                      component="span"
                      variant="subtitle2"
                      gutterBottom
                      display="block"
                    >
                      Навыки:
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      {cand.skills.map((s) => (
                        <Chip
                          key={s.id}
                          label={`${s.title}${s.rank ? ` (${s.rank})` : ''}`}
                          size="small"
                        />
                      ))}
                    </Box>
                  </>
                }
              />

              <ListItemSecondaryAction>
                <Button variant="outlined" onClick={() => openFeedback(cand)}>
                  Обратная связь
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          </Box>
        ))}
      </List>

      {/* ---------- модальное окно ---------- */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
      >
        <DialogTitle>Обратная связь вузу</DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Кандидат: {currentCandidate?.full_name}
          </Typography>

          {/* хорошие дисциплины */}
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={currentCandidate?.skills || []}
            getOptionLabel={(o) => o.title}
            isOptionEqualToValue={equal}
            value={goodSkills}
            onChange={(_, v) => setGoodSkills(v)}
            renderTags={(value, getTagProps) =>
              value.map((opt, i) => (
                <Chip
                  label={opt.title}
                  {...getTagProps({ index: i })}
                  key={opt.id}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Знает хорошо" margin="normal" />
            )}
          />

          {/* средний уровень */}
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={currentCandidate?.skills || []}
            getOptionLabel={(o) => o.title}
            isOptionEqualToValue={equal}
            value={avgSkills}
            onChange={(_, v) => setAvgSkills(v)}
            renderTags={(value, getTagProps) =>
              value.map((opt, i) => (
                <Chip
                  label={opt.title}
                  {...getTagProps({ index: i })}
                  key={opt.id}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Средний уровень" margin="normal" />
            )}
          />

          {/* нужно подтянуть */}
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={currentCandidate?.skills || []}
            getOptionLabel={(o) => o.title}
            isOptionEqualToValue={equal}
            value={badSkills}
            onChange={(_, v) => setBadSkills(v)}
            renderTags={(value, getTagProps) =>
              value.map((opt, i) => (
                <Chip
                  label={opt.title}
                  {...getTagProps({ index: i })}
                  key={opt.id}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Нужно подтянуть" margin="normal" />
            )}
          />

          {/* e-mail ВУЗа */}
          <TextField
            fullWidth
            type="email"
            margin="normal"
            label="E-mail ВУЗа"
            value={universityEmail}
            onChange={(e) => setUniversityEmail(e.target.value)}
          />

          {/* общий комментарий */}
          <TextField
            fullWidth
            multiline
            rows={3}
            margin="normal"
            label="Комментарий (необязательно)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={sendFeedback}>
            Отправить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
