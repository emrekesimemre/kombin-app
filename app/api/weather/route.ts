import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat') || '41.0082'; // Varsayılan İstanbul
  const lon = searchParams.get('lon') || '28.9784';
  const apiKey = process.env.OPENWEATHER_API_KEY;

  try {
    // 5 günlük / 3 saatlik tahmin verisini çekiyoruz (Ücretsiz katmanda en iyisi budur)
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=tr`
    );
    const data = await res.json();
    console.log("🚀 ~ GET ~ data:", data)

    if (!res.ok) throw new Error('Hava durumu alınamadı');

    // Bugün (ilk veri) ve Yarın (yaklaşık 24 saat sonraki veri)
    const today = data.list[0];
    const tomorrow = data.list[8] ?? data.list[1] ?? data.list[0]; // Kısa listede fallback
    const location = data?.city?.name || 'İstanbul';
    console.log("🚀 ~ GET ~ location:", location)

    return NextResponse.json({
      location,
      today: {
        temp: Math.round(today.main.temp),
        condition: today.weather[0].description,
        icon: today.weather[0].icon,
      },
      tomorrow: {
        temp: Math.round(tomorrow.main.temp),
        condition: tomorrow.weather[0].description,
        icon: tomorrow.weather[0].icon,
      }
    });
  } catch (error) {
    console.error('Weather GET error:', error);
    return NextResponse.json({ error: 'Hava durumu hatası' }, { status: 500 });
  }
}