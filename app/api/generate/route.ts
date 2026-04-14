import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Cloth } from '@/models/Cloth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type WeatherInput = {
  temp?: number;
  condition?: string;
};

type WardrobeItem = {
  _id: string;
  category: string;
  imageUrl: string;
  tags: string[];
};

const normalizeCategory = (category: string): string => {
  const value = category.toLowerCase();
  if (value.includes('shoe') || value.includes('ayakk')) return 'shoes';
  if (value.includes('bottom') || value.includes('pant') || value.includes('etek') || value.includes('alt')) return 'bottom';
  if (value.includes('outer') || value.includes('ceket') || value.includes('mont')) return 'outerwear';
  return 'top';
};

const safeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
};

const pickFallbackOutfit = (items: WardrobeItem[]): WardrobeItem[] => {
  const top = items.find((item) => normalizeCategory(item.category) === 'top');
  const bottom = items.find((item) => normalizeCategory(item.category) === 'bottom');
  const shoe = items.find((item) => normalizeCategory(item.category) === 'shoes');

  const picked: WardrobeItem[] = [];
  if (top) picked.push(top);
  if (bottom) picked.push(bottom);
  if (shoe) picked.push(shoe);

  if (picked.length < 3) {
    const alreadyPickedIds = new Set(picked.map((item) => item._id));
    for (const item of items) {
      if (!alreadyPickedIds.has(item._id)) {
        picked.push(item);
        alreadyPickedIds.add(item._id);
      }
      if (picked.length >= 3) break;
    }
  }

  return picked;
};

const parseSelectedIds = (content: string): string[] => {
  try {
    const parsed = JSON.parse(content) as { selectedIds?: unknown };
    if (!Array.isArray(parsed.selectedIds)) return [];
    return parsed.selectedIds.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });
    }

    await connectDB();
    const { mood, weather } = (await req.json()) as { mood?: string; weather?: WeatherInput };
    if (!mood) {
      return NextResponse.json({ error: 'Mood alanı zorunlu.' }, { status: 400 });
    }

    const clothesRaw = (await Cloth.find({ userEmail: session.user.email }).sort({ createdAt: -1 })) as Array<{
      _id: { toString: () => string };
      category?: string;
      imageUrl?: string;
      tags?: unknown;
    }>;

    const clothes: WardrobeItem[] = clothesRaw.map((item) => ({
      _id: item._id.toString(),
      category: item.category ?? 'top',
      imageUrl: item.imageUrl ?? '',
      tags: safeStringArray(item.tags),
    }));

    if (clothes.length === 0) {
      return NextResponse.json({ error: 'Önce dolabına en az bir parça eklemelisin.' }, { status: 400 });
    }

    const weatherText = weather
      ? `${weather.temp ?? '?'}°C ve ${weather.condition ?? 'bilinmiyor'}`
      : 'bilinmiyor';

    const fallbackOutfit = pickFallbackOutfit(clothes);
    let selectedIds = fallbackOutfit.map((item) => item._id);
    let explanation = `Bugünkü ${weatherText} hava ve "${mood}" ruh haline göre dengeli bir kombin seçtim.`;

    if (process.env.GROQ_API_KEY) {
      const prompt = `
Kullanıcının ruh hali: "${mood}"
Hava: ${weatherText}

Dolap parçaları (JSON):
${JSON.stringify(clothes)}

Sadece JSON döndür:
{
  "selectedIds": ["_id", "_id", "_id"],
  "explanation": "Kısa ve samimi stil yorumu"
}

Kurallar:
- Mümkünse 1 üst + 1 alt + 1 ayakkabı seç
- Seçimler listedeki _id değerlerinden olmalı
- selectedIds içinde en az 2 öğe olsun
`;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = completion.choices[0]?.message?.content ?? '';
      const llmIds = parseSelectedIds(content);
      const allowedIds = new Set(clothes.map((item) => item._id));
      const filteredIds = llmIds.filter((id) => allowedIds.has(id));

      if (filteredIds.length >= 2) {
        selectedIds = filteredIds;
      }

      try {
        const parsed = JSON.parse(content) as { explanation?: unknown };
        if (typeof parsed.explanation === 'string' && parsed.explanation.trim()) {
          explanation = parsed.explanation;
        }
      } catch {
        // LLM yanıtı JSON değilse fallback açıklamayı kullan.
      }
    }

    const selected = clothes.filter((item) => selectedIds.includes(item._id));

    return NextResponse.json({
      outfit: selected,
      explanation,
    });
  } catch (error) {
    console.error('Generate outfit error:', error);
    return NextResponse.json({ error: 'Kombin oluşturulamadı' }, { status: 500 });
  }
}