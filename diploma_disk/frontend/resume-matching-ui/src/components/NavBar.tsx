'use client';
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NavBar() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      setIsAuth(Boolean(token));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
  };

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Resume&nbsp;Matcher
          </Link>
        </Typography>

        {!isAuth ? (
          <Box>
            <Button color="inherit" component={Link} href="/login">
              Войти
            </Button>
            <Button color="inherit" component={Link} href="/register">
              Регистрация
            </Button>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={Link} href="/resume">
              Резюме
            </Button>
            <Button color="inherit" component={Link} href="/profile">
              Профиль
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Выйти
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
