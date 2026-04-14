import { Box, Button, Paper, Typography } from '@mui/material';

type HomeShellProps = {
  userName?: string | null;
  children: React.ReactNode;
  onSignOut: () => void;
};

export default function HomeShell({ userName, children, onSignOut }: Readonly<HomeShellProps>) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fdf2f8', px: 2, pb: 14, pt: 2, display: 'flex', justifyContent: 'center' }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 448,
          minHeight: 600,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(17,24,39,0.08)',
          position: 'relative',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 1.5,
              borderRadius: 2.5,
              border: '1px solid #fbcfe8',
              bgcolor: '#fdf2f8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>
              Hoş geldin, <Box component="span" sx={{ color: '#db2777' }}>{userName || 'Stilist'}</Box> 👋
            </Typography>
            <Button
              onClick={onSignOut}
              sx={{ textTransform: 'none', fontSize: 12, fontWeight: 700, color: '#ef4444', '&:hover': { textDecoration: 'underline' } }}
            >
              Çıkış Yap
            </Button>
          </Paper>

          {children}
        </Box>
      </Paper>
    </Box>
  );
}
