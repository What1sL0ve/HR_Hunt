
'use client';
import { useState, useEffect } from 'react';
import { Box, Button, Checkbox, FormControlLabel, TextField, Typography, Slider, Autocomplete, Chip } from '@mui/material';
import api from '@/lib/axios';

interface Skill {
  id: number;
  title: string;
  description: string;
  weight: number;
}

interface SelectedSkill extends Skill {
  rank: number;
}

export default function ResumeForm({ onCreated }:{ onCreated: () => void }) {
  const [isActive, setIsActive] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/skills/').then(res => setSkills(res.data.results ?? res.data)).catch(console.error);
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const payload = {
        is_active: isActive,
        skills: selectedSkills.map(s => ({ skill: s.id, rank: s.rank }))
      };
      await api.post('/resumes/', payload);
      setIsActive(true);
      setSelectedSkills([]);
      onCreated();
    } catch (err:any) {
      console.error(err);
      alert('Не удалось создать резюме');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mt: 4 }}>
      <Typography variant="h5" gutterBottom>Новое резюме</Typography>
      <FormControlLabel
        control={<Checkbox checked={isActive} onChange={e => setIsActive(e.target.checked)} />}
        label="Активное"
      />
      <Autocomplete
        multiple
        options={skills}
        getOptionLabel={(option) => option.title}
        value={selectedSkills}
        onChange={(_, newValue) => {
          // keep previous ranks
          const updated = newValue.map(skill => {
            const existing = selectedSkills.find(s => s.id === skill.id);
            return existing ? existing : { ...skill, rank: 3 };
          });
          setSelectedSkills(updated);
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip label={option.title} {...getTagProps({ index })} key={option.id} />
          ))
        }
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Навыки" placeholder="Выберите навыки" />
        )}
        sx={{ my: 2 }}
      />

      {selectedSkills.map((skill, idx) => (
        <Box key={skill.id} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
          <Typography sx={{ minWidth: 120 }}>{skill.title}</Typography>
          <Slider
            min={1}
            max={5}
            step={1}
            value={skill.rank}
            onChange={(_, newVal) => {
              const newRank = Array.isArray(newVal) ? newVal[0] : newVal as number;
              const updated = [...selectedSkills];
              updated[idx].rank = newRank;
              setSelectedSkills(updated);
            }}
            valueLabelDisplay="auto"
            marks
            sx={{ flexGrow: 1 }}
          />
        </Box>
      ))}

      <Button variant="contained" onClick={handleCreate} disabled={loading}>
        Создать резюме
      </Button>
    </Box>
  );
}
