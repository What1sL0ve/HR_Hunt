
'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import {
  Box,
  Autocomplete,
  TextField,
  Slider,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

type Skill = {
  id: number;
  title: string;
};

type CandidateSkill = {
  id: number;
  skill: Skill;
  rank: number;
};

export default function SkillsForm() {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [candidateSkills, setCandidateSkills] = useState<CandidateSkill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [rank, setRank] = useState<number>(3);

  const fetchCandidateSkills = () => {
    api.get('/candidate-skills/')
      .then((res) => setCandidateSkills(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    api.get('/skills/')
      .then((res) => setAllSkills(res.data))
      .catch((err) => console.error(err));

    fetchCandidateSkills();
  }, []);

  const handleAddSkill = () => {
    if (!selectedSkill) return;
    api.post('/candidate-skills/', { skill: selectedSkill.id, rank })
      .then(() => {
        setSelectedSkill(null);
        setRank(3);
        fetchCandidateSkills();
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteSkill = (id: number) => {
    api.delete(`/candidate-skills/${id}/`)
      .then(() => fetchCandidateSkills())
      .catch((err) => console.error(err));
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Навыки
      </Typography>

      <Autocomplete
        options={allSkills}
        getOptionLabel={(skill) => skill.title}
        value={selectedSkill}
        onChange={(_, value) => setSelectedSkill(value)}
        renderInput={(params) => <TextField {...params} label="Навык" />}
      />

      <Box sx={{ mt: 2 }}>
        <Typography gutterBottom>Уровень владения</Typography>
        <Slider
          value={rank}
          onChange={(_, value) => setRank(value as number)}
          min={1}
          max={5}
          step={1}
          marks
        />
      </Box>

      <Button variant="contained" sx={{ mt: 2 }} onClick={handleAddSkill}>
        Добавить
      </Button>

      <List sx={{ mt: 4 }}>
        {candidateSkills.map((cs) => (
          <ListItem
            key={cs.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => handleDeleteSkill(cs.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={cs.skill.title}
              secondary={`Уровень: ${cs.rank}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
