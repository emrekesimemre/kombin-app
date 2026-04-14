"use client";

import { useEffect, useMemo, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import AddTab from './components/home/AddTab';
import BottomNav from './components/home/BottomNav';
import FavoritesTab from './components/home/FavoritesTab';
import GenerateTab from './components/home/GenerateTab';
import HomeShell from './components/home/HomeShell';
import WardrobeTab from './components/home/WardrobeTab';
import type { ClothItem, FavoriteItem, GenerateMode, OutfitResult, Tab, WeatherData } from './components/home/types';

const isWeatherData = (value: unknown): value is WeatherData => {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  const today = data.today as Record<string, unknown> | undefined;
  const tomorrow = data.tomorrow as Record<string, unknown> | undefined;

  return Boolean(
    today &&
      tomorrow &&
      typeof today.temp === 'number' &&
      typeof today.condition === 'string' &&
      typeof today.icon === 'string' &&
      typeof tomorrow.temp === 'number' &&
      typeof tomorrow.condition === 'string' &&
      typeof tomorrow.icon === 'string'
  );
};

const normalizeWeatherData = (value: unknown): WeatherData | null => {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  const today = data.today as Record<string, unknown> | undefined;
  const tomorrow = data.tomorrow as Record<string, unknown> | undefined;

  if (
    !today ||
    !tomorrow ||
    typeof today.temp !== 'number' ||
    typeof today.icon !== 'string' ||
    typeof today.condition !== 'string' ||
    typeof tomorrow.temp !== 'number' ||
    typeof tomorrow.icon !== 'string' ||
    typeof tomorrow.condition !== 'string'
  ) {
    return null;
  }

  return {
    location: typeof data.location === 'string' && data.location.trim() ? data.location : 'Konum bilinmiyor',
    today: {
      temp: today.temp,
      icon: today.icon,
      condition: today.condition,
    },
    tomorrow: {
      temp: tomorrow.temp,
      icon: tomorrow.icon,
      condition: tomorrow.condition,
    },
  };
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('add');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [generateMode, setGenerateMode] = useState<GenerateMode>('ai');
  const [mood, setMood] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [outfitResult, setOutfitResult] = useState<OutfitResult | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const [manualMood, setManualMood] = useState('');
  const [manualSelectedIds, setManualSelectedIds] = useState<string[]>([]);
  const [manualCategory, setManualCategory] = useState('all');

  const [clothes, setClothes] = useState<ClothItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchWardrobe = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('/api/clothes');
      const data = (await res.json()) as { success?: boolean; data?: ClothItem[] };
      if (data.success) setClothes(data.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingList(false);
    }
  };

  const fetchFavorites = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('/api/favorites');
      const data = (await res.json()) as { success?: boolean; data?: FavoriteItem[] };
      if (data.success) setFavorites(data.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchWardrobe();
    if (activeTab === 'favorites') {
      fetchFavorites();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchWeather = async () => {
      const defaultCoords = { lat: 41.0082, lon: 28.9784 };

      const getCoords = () =>
        new Promise<{ lat: number; lon: number }>((resolve) => {
          if (!navigator.geolocation) {
            resolve(defaultCoords);
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
              });
            },
            () => resolve(defaultCoords),
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
          );
        });

      try {
        const coords = await getCoords();
        const res = await fetch(`/api/weather?lat=${coords.lat}&lon=${coords.lon}`, { cache: 'no-store' });
        const data: unknown = await res.json();
        const normalized = normalizeWeatherData(data);
        if (normalized) {
          setWeatherData(normalized);
        } else if (isWeatherData(data)) {
          setWeatherData(data);
        }
      } catch (error) {
        console.error('Hava durumu hatası', error);
      }
    };

    fetchWeather();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const res = await fetch('/api/clothes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: reader.result }),
        });

        if (res.ok) {
          toast.success('Dolabına başarıyla eklendi! 👗');
          setFile(null);
          setPreview(null);
          fetchWardrobe();
        } else {
          toast.error('Yükleme başarısız oldu');
        }
      };
    } catch (error) {
      console.error(error);
      toast.error('Hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateOutfit = async () => {
    if (!mood) return;
    setIsGenerating(true);
    setOutfitResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, weather: weatherData?.today }),
      });
      const data = (await res.json()) as OutfitResult | { error?: string };

      if (res.ok) {
        setOutfitResult(data as OutfitResult);
      } else {
        toast.error((data as { error?: string }).error ?? 'Kombin oluşturulamadı');
      }
    } catch (error) {
      console.error(error);
      toast.error('Hata oluştu');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToFavorites = async () => {
    if (!outfitResult) return;

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood,
          explanation: outfitResult.explanation,
          clothIds: outfitResult.outfit.map((item) => item._id),
        }),
      });

      if (res.ok) {
        toast.success('Favori kombinlerine eklendi! ❤️');
      } else {
        toast.error('Kaydedilemedi');
      }
    } catch (error) {
      console.error(error);
      toast.error('Kaydedilemedi');
    }
  };

  const saveManualOutfit = async () => {
    if (manualSelectedIds.length === 0) {
      toast.warning('En az 1 parça seçmelisin!');
      return;
    }

    if (!manualMood) {
      toast.info('Kombinine bir isim ver! (Örn: Pazar Kahvesi)');
      return;
    }

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: manualMood,
          explanation: 'Benim seçimim, benim tarzım! ✨ Kendi zevkime göre oluşturduğum harika bir kombin.',
          clothIds: manualSelectedIds,
        }),
      });

      if (res.ok) {
        toast.success('Kendi kombinin başarıyla kaydedildi! ❤️');
        setManualSelectedIds([]);
        setManualMood('');
        setActiveTab('favorites');
      } else {
        toast.error('Kaydedilemedi');
      }
    } catch (error) {
      console.error(error);
      toast.error('Kaydedilemedi');
    }
  };

  const toggleManualSelection = (id: string) => {
    setManualSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const deleteCloth = async (id: string) => {
    if (!confirm('Silmek istediğine emin misin?')) return;
    await fetch(`/api/clothes?id=${id}`, { method: 'DELETE' });
    fetchWardrobe();
  };

  const manualSelectedClothes = useMemo(
    () => clothes.filter((item) => manualSelectedIds.includes(item._id)),
    [clothes, manualSelectedIds]
  );

  const renderActiveTabContent = () => {
    if (activeTab === 'add') {
      return (
        <AddTab
          file={file}
          preview={preview}
          isUploading={isUploading}
          onFileChange={(selectedFile) => {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
          }}
          onUpload={handleUpload}
        />
      );
    }

    if (activeTab === 'generate') {
      return (
        <GenerateTab
          generateMode={generateMode}
          weatherData={weatherData}
          mood={mood}
          isGenerating={isGenerating}
          outfitResult={outfitResult}
          manualMood={manualMood}
          manualSelectedIds={manualSelectedIds}
          manualSelectedClothes={manualSelectedClothes}
          manualCategory={manualCategory}
          clothes={clothes}
          onModeChange={setGenerateMode}
          onMoodChange={setMood}
          onGenerate={handleGenerateOutfit}
          onSaveFavorite={saveToFavorites}
          onManualMoodChange={setManualMood}
          onManualCategoryChange={setManualCategory}
          onToggleManual={toggleManualSelection}
          onSaveManual={saveManualOutfit}
        />
      );
    }

    if (activeTab === 'wardrobe') {
      return (
        <WardrobeTab
          isLoadingList={isLoadingList}
          clothes={clothes}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          onDelete={deleteCloth}
        />
      );
    }

    return <FavoritesTab isLoadingList={isLoadingList} favorites={favorites} />;
  };

  if (status === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#fdf2f8',
          display: 'grid',
          placeItems: 'center',
          gap: 1,
        }}
      >
        <CircularProgress sx={{ color: '#f472b6' }} />
        <Typography sx={{ fontWeight: 700, color: '#f472b6' }}>Gardırop Açılıyor...</Typography>
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#fdf2f8',
          display: 'grid',
          placeItems: 'center',
          gap: 1,
        }}
      >
        <CircularProgress sx={{ color: '#f472b6' }} />
        <Typography sx={{ fontWeight: 700, color: '#f472b6' }}>Çıkış yapılıyor...</Typography>
      </Box>
    );
  }

  return (
    <>
      <HomeShell userName={session?.user?.name} onSignOut={() => signOut()}>
        {renderActiveTabContent()}
      </HomeShell>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </>
  );
}
