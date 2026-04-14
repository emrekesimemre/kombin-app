"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  let submitLabel = 'Kayıt Ol';
  if (loading) {
    submitLabel = 'Bekleniyor...';
  } else if (isLogin) {
    submitLabel = 'Giriş Yap';
  }

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push('/');
      }
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json()) as { error?: string };

      if (res.ok) {
        await signIn('credentials', { redirect: false, email, password });
        router.push('/');
      } else {
        setError(data.error || 'Kayıt başarısız.');
        setLoading(false);
      }
    } catch (caughtError) {
      console.error(caughtError);
      setError('Sistem hatası oluştu.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fdf2f8', display: 'grid', placeItems: 'center', p: 2 }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 448,
          borderRadius: 5,
          p: 4,
          boxShadow: '0 20px 40px rgba(17,24,39,0.08)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography sx={{ fontSize: 50, lineHeight: 1, mb: 1.5 }}>👗</Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#1f2937' }}>
            Dijital Gardırop
          </Typography>
          <Typography sx={{ color: '#9ca3af', fontSize: 14, mt: 1 }}>
            {isLogin ? 'Kendi tarzına geri dön.' : 'Gizli dolabını hemen oluştur.'}
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {!isLogin && (
              <TextField
                id="name"
                label="İsim"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Örn: Ayşe"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: '#f9fafb' } }}
              />
            )}

            <TextField
              id="email"
              type="email"
              label="E-posta"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="sen@örnek.com"
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: '#f9fafb' } }}
            />

            <TextField
              id="password"
              type="password"
              label="Şifre"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: '#f9fafb' } }}
            />

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              disabled={loading}
              type="submit"
              variant="contained"
              sx={{
                py: 1.6,
                mt: 1,
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 17,
                bgcolor: '#db2777',
                boxShadow: '0 10px 24px rgba(219,39,119,0.25)',
                '&:hover': { bgcolor: '#be185d' },
                '&.Mui-disabled': { bgcolor: '#f9a8d4', color: '#fff' },
              }}
            >
              {submitLabel}
            </Button>
          </Stack>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            sx={{ textTransform: 'none', fontWeight: 700, color: '#4f46e5', '&:hover': { textDecoration: 'underline' } }}
          >
            {isLogin ? 'Hesabın yok mu? Kayıt Ol.' : 'Zaten üye misin? Giriş Yap.'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
