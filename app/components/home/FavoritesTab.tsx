import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import type { FavoriteItem } from './types';

type FavoritesTabProps = {
  isLoadingList: boolean;
  favorites: FavoriteItem[];
};

export default function FavoritesTab({ isLoadingList, favorites }: Readonly<FavoritesTabProps>) {
  if (isLoadingList) {
    return <Typography sx={{ textAlign: 'center', color: '#6b7280' }}>Favoriler yükleniyor...</Typography>;
  }

  if (favorites.length === 0) {
    return <Typography sx={{ textAlign: 'center', color: '#6b7280' }}>Henüz favori kombinin yok.</Typography>;
  }

  return (
    <Stack spacing={3} sx={{ pb: 10 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', textAlign: 'center' }}>
        Favori Kombinlerim ❤️
      </Typography>

      <Stack spacing={2.5}>
        {favorites.map((favorite) => (
          <Paper key={favorite._id} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #fbcfe8', boxShadow: 'none' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Chip
                label={favorite.mood}
                sx={{
                  bgcolor: '#fdf2f8',
                  color: '#db2777',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              />
              {favorite.explanation.includes('Benim seçimim') && (
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#9ca3af' }}>🖐️ Kendi Seçimim</Typography>
              )}
            </Stack>

            <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
              {favorite.clothIds.length > 0 ? (
                favorite.clothIds.map((cloth) => (
                  <Box
                    key={cloth._id}
                    component="img"
                    src={cloth.imageUrl || ''}
                    alt="Kıyafet"
                    sx={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 2, border: '1px solid #e5e7eb' }}
                  />
                ))
              ) : (
                <Typography sx={{ fontSize: 12, color: '#ef4444' }}>Resimler yüklenemedi.</Typography>
              )}
            </Stack>

            <Paper elevation={0} sx={{ p: 2, borderRadius: 1.5, bgcolor: '#f9fafb', border: '1px solid #f3f4f6' }}>
              <Typography sx={{ fontSize: 14, fontStyle: 'italic', color: '#374151' }}>{`"${favorite.explanation}"`}</Typography>
            </Paper>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
