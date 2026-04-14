import { Box, Button, Paper, Stack, TextField, Typography, Chip } from '@mui/material';
import type { ClothItem } from './types';

type WardrobeTabProps = {
  isLoadingList: boolean;
  clothes: ClothItem[];
  searchQuery: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDelete: (id: string) => void;
};

const filterCategories = [
  { id: 'all', label: 'Hepsi', icon: '🌈' },
  { id: 'top', label: 'Üst', icon: '👕' },
  { id: 'bottom', label: 'Alt', icon: '👖' },
  { id: 'outerwear', label: 'Ceket', icon: '🧥' },
  { id: 'shoes', label: 'Ayakkabı', icon: '👟' },
];

export default function WardrobeTab({
  isLoadingList,
  clothes,
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onDelete,
}: Readonly<WardrobeTabProps>) {
  const searchLower = searchQuery.toLowerCase();
  const filtered = clothes.filter((item) => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch =
      item.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
      item.colors?.some((color) => color.toLowerCase().includes(searchLower)) ||
      item.category?.toLowerCase().includes(searchLower);

    return matchCategory && (searchQuery === '' || Boolean(matchSearch));
  });

  return (
    <Stack spacing={3} sx={{ pb: 6 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', textAlign: 'center' }}>
        Tüm Kıyafetlerim 🛍️
      </Typography>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #fbcfe8', bgcolor: '#fdf2f8' }}>
        <Stack spacing={2}>
          <TextField
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Kıyafet ara (Örn: kırmızı, yazlık...)"
            size="small"
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: '#fff' } }}
          />

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {filterCategories.map((category) => (
              <Button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                variant={selectedCategory === category.id ? 'contained' : 'outlined'}
                sx={{
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  bgcolor: selectedCategory === category.id ? '#ec4899' : '#fff',
                  color: selectedCategory === category.id ? '#fff' : '#4b5563',
                  borderColor: selectedCategory === category.id ? 'transparent' : '#e5e7eb',
                  '&:hover': {
                    bgcolor: selectedCategory === category.id ? '#db2777' : '#fdf2f8',
                    borderColor: selectedCategory === category.id ? 'transparent' : '#e5e7eb',
                  },
                }}
              >
                {category.icon} {category.label}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Paper>

      {isLoadingList && <Typography sx={{ textAlign: 'center', color: '#6b7280' }}>Dolap açılıyor...</Typography>}
      {!isLoadingList && clothes.length === 0 && (
        <Typography sx={{ textAlign: 'center', color: '#6b7280' }}>Dolabın henüz boş.</Typography>
      )}

      {!isLoadingList && clothes.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.5 }}>
          {filtered.map((item) => (
            <Paper key={item._id} sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', aspectRatio: '1 / 1' }}>
              <Box component="img" src={item.imageUrl} alt="Kıyafet" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <Button
                onClick={() => onDelete(item._id)}
                sx={{
                  minWidth: 28,
                  width: 28,
                  height: 28,
                  p: 0,
                  borderRadius: '50%',
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  fontSize: 12,
                }}
              >
                🗑️
              </Button>
              <Chip
                label={item.category}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              />
            </Paper>
          ))}
        </Box>
      )}
    </Stack>
  );
}
