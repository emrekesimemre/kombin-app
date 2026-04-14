import { Box, Button, Paper, Typography } from '@mui/material';

type AddTabProps = {
  file: File | null;
  preview: string | null;
  isUploading: boolean;
  onFileChange: (file: File) => void;
  onUpload: () => void;
};

export default function AddTab({ file, preview, isUploading, onFileChange, onUpload }: Readonly<AddTabProps>) {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', textAlign: 'center' }}>
        Yeni Parça Ekle ✨
      </Typography>

      <Paper
        component="label"
        elevation={0}
        sx={{
          cursor: 'pointer',
          height: 288,
          borderRadius: 3,
          border: '2px dashed #fbcfe8',
          bgcolor: '#fdf2f8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          '&:hover': { bgcolor: '#fce7f3' },
        }}
      >
        {preview ? (
          <Box component="img" src={preview} alt="Önizleme" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box sx={{ textAlign: 'center', color: '#ec4899' }}>
            <Typography sx={{ fontSize: 42, lineHeight: 1 }}>📸</Typography>
            <Typography sx={{ fontWeight: 600 }}>Fotoğraf Çek / Seç</Typography>
          </Box>
        )}
        <Box
          component="input"
          type="file"
          accept="image/*"
          sx={{ display: 'none' }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.files?.[0]) {
              onFileChange(event.target.files[0]);
            }
          }}
        />
      </Paper>

      <Button
        onClick={onUpload}
        disabled={!file || isUploading}
        variant="contained"
        sx={{
          py: 1.7,
          borderRadius: 2.5,
          fontWeight: 700,
          fontSize: 18,
          textTransform: 'none',
          bgcolor: !file || isUploading ? '#d1d5db' : '#db2777',
          boxShadow: !file || isUploading ? 'none' : '0 10px 24px rgba(219,39,119,0.25)',
          '&:hover': {
            bgcolor: !file || isUploading ? '#d1d5db' : '#be185d',
            boxShadow: !file || isUploading ? 'none' : '0 10px 24px rgba(219,39,119,0.3)',
          },
        }}
      >
        {isUploading ? 'Yapay Zeka İnceliyor... ⏳' : 'Dolaba Ekle'}
      </Button>
    </Box>
  );
}
