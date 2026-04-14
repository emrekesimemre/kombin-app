export type Tab = 'add' | 'generate' | 'wardrobe' | 'favorites';
export type GenerateMode = 'ai' | 'manual';

export type ClothItem = {
  _id: string;
  imageUrl: string;
  category: string;
  colors?: string[];
  season?: string[];
  moods?: string[];
  tags?: string[];
};

export type OutfitResult = {
  explanation: string;
  outfit: ClothItem[];
};

export type WeatherDay = {
  temp: number;
  icon: string;
  condition: string;
};

export type WeatherData = {
  location: string;
  today: WeatherDay;
  tomorrow: WeatherDay;
};

export type FavoriteItem = {
  _id: string;
  mood: string;
  explanation: string;
  clothIds: ClothItem[];
};
