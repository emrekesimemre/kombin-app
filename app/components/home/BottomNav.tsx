import { Box, Button, Paper, Typography } from '@mui/material';
import type { Tab } from './types';

type BottomNavProps = {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
};

const navItems: Array<{ tab: Tab; icon: string; label: string; activeColor: string }> = [
  { tab: 'add', icon: '➕', label: 'Ekle', activeColor: '#db2777' },
  { tab: 'generate', icon: '✨', label: 'Kombin', activeColor: '#4f46e5' },
  { tab: 'wardrobe', icon: '👚', label: 'Dolabım', activeColor: '#db2777' },
  { tab: 'favorites', icon: '❤️', label: 'Favoriler', activeColor: '#ef4444' },
];

export default function BottomNav({ activeTab, onChange }: Readonly<BottomNavProps>) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        maxWidth: 448,
        borderTop: '1px solid #f3f4f6',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        p: 1.5,
        boxShadow: '0 -10px 40px -15px rgba(0,0,0,0.1)',
      }}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <Button
              key={item.tab}
              onClick={() => onChange(item.tab)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.2,
                minWidth: 0,
                textTransform: 'none',
                color: isActive ? item.activeColor : '#9ca3af',
                transform: isActive ? 'scale(1.08)' : 'none',
              }}
            >
              <Typography sx={{ fontSize: 24, lineHeight: 1 }}>{item.icon}</Typography>
              <Typography sx={{ fontSize: 10, fontWeight: 700 }}>{item.label}</Typography>
            </Button>
          );
        })}
      </Box>
    </Paper>
  );
}
