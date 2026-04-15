import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Cloth } from '@/models/Cloth';
import { getServerSession } from "next-auth"; // GÜVENLİK
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });

    await connectDB();
    // SADECE BU E-POSTAYA AİT KIYAFETLERİ GETİR:
    const clothes = await Cloth.find({ userEmail: session.user.email }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: clothes });
  } catch (error) {
    console.error('Clothes GET error:', error);
    return NextResponse.json({ error: 'Kıyafetler getirilemedi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. GÜVENLİK KONTROLÜ
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });
    }

    await connectDB();
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Resim bulunamadı' }, { status: 400 });
    }

    // 2. GROQ YAPAY ZEKA ANALİZİ (Kayıp olan kısım burası!)
    const groqApiKey = process.env.GROQ_API_KEY;
    
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview", // Groq'un süper hızlı görsel modeli
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Sen profesyonel bir moda asistanısın. Bu kıyafeti analiz et ve SADECE şu formatta geçerli bir JSON döndür. Başka hiçbir açıklama yazma:
                {
                  "category": "top|bottom|outerwear|shoes|accessory",
                  "colors": ["renk1", "renk2"],
                  "season": ["yaz", "kış", "ilkbahar", "sonbahar"],
                  "moods": ["şık", "spor", "rahat", "ciddi"],
                  "tags": ["kısa kollu", "pamuklu", "jean" vb.]
                }` 
              },
              { 
                type: "image_url", 
                image_url: { url: imageBase64 } 
              }
            ]
          }
        ],
        temperature: 0.1 // Yaratıcılığı düşürdük ki sadece JSON dönsün
      })
    });

    if (!groqResponse.ok) {
      throw new Error("Yapay zeka analizi başarısız oldu.");
    }

    const aiData = await groqResponse.json();
    let analysisResult;

    try {
      // Groq bazen JSON'ı ```json ... ``` tagleri arasına koyar, onları temizliyoruz
      const rawContent = aiData.choices[0].message.content;
      const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      analysisResult = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("JSON Parse Hatası:", parseError);
      // Eğer AI saçmalarsa çökmesin, varsayılan bir şeyler eklesin
      analysisResult = {
        category: "top",
        colors: ["belirsiz"],
        season: ["tüm mevsimler"],
        moods: ["günlük"],
        tags: ["analiz_edilemedi"]
      };
    }

    // 3. VERİTABANINA KAYIT (Şimdi akıllı ve güvenli)
    const newCloth = await Cloth.create({
      userEmail: session.user.email, // Güvenlik kilidi
      imageUrl: imageBase64,
      category: analysisResult.category || "top",
      colors: analysisResult.colors || [],
      season: analysisResult.season || [],
      moods: analysisResult.moods || [],
      tags: analysisResult.tags || [],
    });

    return NextResponse.json({ success: true, data: newCloth });
    
  } catch (error) {
    console.error('Clothes POST error:', error);
    return NextResponse.json({ error: 'Kıyafet eklenemedi veya analiz edilemedi' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    await connectDB();
    // KİMSE BAŞKASININ KIYAFETİNİ SİLEMESİN DİYE GÜVENLİK (Hem ID hem E-posta eşleşmeli):
    await Cloth.findOneAndDelete({ _id: id, userEmail: session.user.email });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clothes DELETE error:', error);
    return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
  }
}