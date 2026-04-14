import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import type { ClothItem, GenerateMode, OutfitResult, WeatherData } from './types';

type GenerateTabProps = {
  generateMode: GenerateMode;
  weatherData: WeatherData | null;
  mood: string;
  isGenerating: boolean;
  outfitResult: OutfitResult | null;
  manualMood: string;
  manualSelectedIds: string[];
  manualSelectedClothes: ClothItem[];
  manualCategory: string;
  clothes: ClothItem[];
  onModeChange: (mode: GenerateMode) => void;
  onMoodChange: (value: string) => void;
  onGenerate: () => void;
  onSaveFavorite: () => void;
  onManualMoodChange: (value: string) => void;
  onManualCategoryChange: (value: string) => void;
  onToggleManual: (id: string) => void;
  onSaveManual: () => void;
};

const moodSuggestions = ['Neşeli 😊', 'Ciddi 🕶️', 'Rahat 🛋️', 'Enerjik ⚡', 'Şık 🌟'];
const manualCategories = [
  { id: 'all', label: 'Tümü' },
  { id: 'top', label: 'Üst' },
  { id: 'bottom', label: 'Alt' },
  { id: 'outerwear', label: 'Ceket' },
  { id: 'shoes', label: 'Ayakkabı' },
];

const getWeatherIconUrl = (icon: string) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

const getWeatherEmoji = (icon: string) => {
  if (icon.includes('01')) return '☀️';
  if (icon.includes('02')) return '🌤️';
  if (icon.includes('03') || icon.includes('04')) return '☁️';
  if (icon.includes('09') || icon.includes('10')) return '🌧️';
  if (icon.includes('11')) return '⛈️';
  if (icon.includes('13')) return '❄️';
  if (icon.includes('50')) return '🌫️';
  return '🌤️';
};

type WeatherIconProps = {
  icon: string;
  alt: string;
  muted?: boolean;
};

function WeatherIcon({ icon, alt, muted = false }: Readonly<WeatherIconProps>) {
  return (
    <Box sx={{ position: 'relative', width: 28, height: 28, display: 'grid', placeItems: 'center' }}>
      <Typography sx={{ fontSize: 18, lineHeight: 1 }}>{getWeatherEmoji(icon)}</Typography>
      <Box
        component="img"
        src={getWeatherIconUrl(icon)}
        alt={alt}
        sx={{
          position: 'absolute',
          inset: 0,
          width: 28,
          height: 28,
          filter: muted ? 'grayscale(1)' : 'none',
          opacity: muted ? 0.7 : 1,
        }}
        onError={(event: React.SyntheticEvent<HTMLImageElement>) => {
          event.currentTarget.remove();
        }}
      />
    </Box>
  );
}

export default function GenerateTab(props: Readonly<GenerateTabProps>) {
  const {
    generateMode,
    weatherData,
    mood,
    isGenerating,
    outfitResult,
    manualMood,
    manualSelectedIds,
    manualSelectedClothes,
    manualCategory,
    clothes,
    onModeChange,
    onMoodChange,
    onGenerate,
    onSaveFavorite,
    onManualMoodChange,
    onManualCategoryChange,
    onToggleManual,
    onSaveManual,
  } = props;
    console.log("🚀 ~ GenerateTab ~ weatherData:", weatherData)

  const filteredManualClothes = clothes.filter(
    (item) => manualCategory === 'all' || item.category === manualCategory
  );

  return (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ p: 0.75, borderRadius: 2.5, bgcolor: '#f3f4f6' }}>
        <ToggleButtonGroup
          color="standard"
          exclusive
          fullWidth
          value={generateMode}
          onChange={(_, value: GenerateMode | null) => {
            if (value) onModeChange(value);
          }}
        >
          <ToggleButton
            value="ai"
            sx={{
              border: 'none',
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              color: generateMode === 'ai' ? '#4f46e5' : '#6b7280',
              height: 40,
              minHeight: 0,
              py: 0.5,
              px: 1.5,
              fontSize: 14,
              '&.Mui-selected': { bgcolor: '#fff', color: '#4f46e5' },
              '&.Mui-selected:hover': { bgcolor: '#fff' },
            }}
          >
            ✨ Yapay Zeka
          </ToggleButton>
          <ToggleButton
            value="manual"
            sx={{
              border: 'none',
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              color: generateMode === 'manual' ? '#db2777' : '#6b7280',
              height: 40,
              minHeight: 0,
              py: 0.5,
              px: 1.5,
              fontSize: 14,
              '&.Mui-selected': { bgcolor: '#fff', color: '#db2777' },
              '&.Mui-selected:hover': { bgcolor: '#fff' },
            }}
          >
            🖐️ Kendim Seçeceğim
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {generateMode === 'ai' && weatherData && (
        <Stack spacing={1.5}>
          <Typography sx={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#6b7280' }}>
            Hava durumu: {weatherData.location || 'Konum bilinmiyor'}
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center' }}>
          <Paper
            elevation={0}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              border: '1px solid #dbeafe',
              bgcolor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase' }}>
              Bugün
            </Typography>
            <WeatherIcon icon={weatherData.today.icon} alt="Bugün hava" />
            <Typography sx={{ fontSize: 14, fontWeight: 900, color: '#334155' }}>{weatherData.today.temp}°</Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              border: '1px solid #f3f4f6',
              bgcolor: '#f9fafb',
              opacity: 0.8,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase' }}>
              Yarın
            </Typography>
            <WeatherIcon icon={weatherData.tomorrow.icon} alt="Yarın hava" muted />
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>{weatherData.tomorrow.temp}°</Typography>
          </Paper>
          </Stack>
        </Stack>
      )}

      {generateMode === 'ai' && (
        <Stack spacing={2.5}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', textAlign: 'center' }}>
            Nasıl Hissediyorsun? 🎭
          </Typography>
          <TextField
            value={mood}
            onChange={(event) => onMoodChange(event.target.value)}
            placeholder="Örn: Neşeli, Ciddi, Sportif..."
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2.5, '&.Mui-focused fieldset': { borderColor: '#6366f1' } },
            }}
          />
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {moodSuggestions.map((label) => (
              <Chip
                key={label}
                label={label}
                onClick={() => onMoodChange(label)}
                sx={{
                  bgcolor: '#fff',
                  border: '1px solid #e5e7eb',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#eef2ff', color: '#4338ca' },
                }}
              />
            ))}
          </Stack>
          <Button
            onClick={onGenerate}
            disabled={!mood || isGenerating}
            variant="contained"
            sx={{
              py: 1.7,
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: 18,
              textTransform: 'none',
              bgcolor: !mood || isGenerating ? '#d1d5db' : '#4f46e5',
              boxShadow: !mood || isGenerating ? 'none' : '0 10px 24px rgba(79,70,229,0.25)',
              '&:hover': { bgcolor: !mood || isGenerating ? '#d1d5db' : '#4338ca' },
            }}
          >
            {isGenerating ? 'Stilist Düşünüyor... 👗' : 'Bana Kombin Yap!'}
          </Button>

          {outfitResult && (
            <Stack spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  border: '1px solid #c7d2fe',
                  background: 'linear-gradient(135deg, #eef2ff 0%, #fdf2f8 100%)',
                }}
              >
                <Typography sx={{ color: '#374151', fontStyle: 'italic', fontWeight: 500 }}>
                  {`"${outfitResult.explanation}"`}
                </Typography>
              </Paper>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2 }}>
                {outfitResult.outfit.map((item) => (
                  <Paper key={item._id} sx={{ p: 1, borderRadius: 2, position: 'relative' }}>
                    <Chip
                      label={item.category}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        zIndex: 2,
                      }}
                    />
                    <Box
                      component="img"
                      src={item.imageUrl}
                      alt={item.category}
                      sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 1.5 }}
                    />
                  </Paper>
                ))}
              </Box>
              <Button
                variant="outlined"
                onClick={onSaveFavorite}
                sx={{
                  py: 1.4,
                  borderRadius: 2.5,
                  borderWidth: 2,
                  textTransform: 'none',
                  color: '#db2777',
                  borderColor: '#ec4899',
                  fontWeight: 700,
                  '&:hover': { borderWidth: 2, bgcolor: '#fdf2f8', borderColor: '#ec4899' },
                }}
              >
                ❤️ Bu Kombini Kaydet
              </Button>
            </Stack>
          )}
        </Stack>
      )}

      {generateMode === 'manual' && (
        <Stack spacing={3} sx={{ pb: 6 }}>
          <TextField
            label="Kombin İsmi 🏷️"
            value={manualMood}
            onChange={(event) => onManualMoodChange(event.target.value)}
            placeholder="Örn: Cuma Gecesi, Ofis Günü..."
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
          />

          <Paper
            elevation={0}
            sx={{ p: 2, borderRadius: 3, border: '1px solid #fbcfe8', bgcolor: '#fdf2f8', minHeight: 120 }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#ec4899', textTransform: 'uppercase', textAlign: 'center' }}>
              Seçtiğin Parçalar ({manualSelectedIds.length})
            </Typography>
            {manualSelectedIds.length === 0 ? (
              <Typography sx={{ mt: 2, textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                Henüz bir parça seçmedin.
              </Typography>
            ) : (
              <Stack
                direction="row"
                spacing={1.5}
                useFlexGap
                sx={{ flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}
              >
                {manualSelectedClothes.map((item) => (
                  <Box key={item._id} sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={item.imageUrl}
                      alt="Seçili"
                      sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1.5, border: '2px solid #f472b6' }}
                    />
                    <Button
                      size="small"
                      onClick={() => onToggleManual(item._id)}
                      sx={{
                        minWidth: 20,
                        width: 20,
                        height: 20,
                        p: 0,
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        borderRadius: '50%',
                        bgcolor: '#fff',
                        color: '#6b7280',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      ✕
                    </Button>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          <Stack spacing={1.5}>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
            >
              {manualCategories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={manualCategory === cat.id ? 'contained' : 'outlined'}
                  onClick={() => onManualCategoryChange(cat.id)}
                  sx={{
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: 12,
                    bgcolor: manualCategory === cat.id ? '#1f2937' : '#fff',
                    borderColor: '#e5e7eb',
                    color: manualCategory === cat.id ? '#fff' : '#4b5563',
                    '&:hover': {
                      bgcolor: manualCategory === cat.id ? '#111827' : '#f3f4f6',
                      borderColor: '#e5e7eb',
                    },
                  }}
                >
                  {cat.label}
                </Button>
              ))}
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, maxHeight: 256, overflowY: 'auto', pr: 1 }}>
              {filteredManualClothes.map((item) => {
                const isSelected = manualSelectedIds.includes(item._id);
                return (
                  <Button
                    key={item._id}
                    onClick={() => onToggleManual(item._id)}
                    sx={{
                      p: 0,
                      minWidth: 0,
                      borderRadius: 1.5,
                      border: isSelected ? '4px solid #ec4899' : '1px solid #e5e7eb',
                      position: 'relative',
                      overflow: 'hidden',
                      aspectRatio: '1 / 1',
                      opacity: isSelected ? 0.9 : 1,
                    }}
                  >
                    <Box component="img" src={item.imageUrl} alt="Kıyafet" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {isSelected && (
                      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(236,72,153,0.2)', display: 'grid', placeItems: 'center' }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: '#ec4899',
                            color: '#fff',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </Box>
                      </Box>
                    )}
                  </Button>
                );
              })}
            </Box>
          </Stack>

          <Button
            onClick={onSaveManual}
            variant="contained"
            sx={{
              py: 1.7,
              borderRadius: 2.5,
              fontSize: 18,
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: '#db2777',
              boxShadow: '0 10px 24px rgba(219,39,119,0.25)',
              '&:hover': { bgcolor: '#be185d' },
            }}
          >
            ❤️ Kombinimi Kaydet
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
