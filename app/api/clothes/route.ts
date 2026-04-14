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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });

    await connectDB();
    const { imageBase64 } = await req.json();

    // Groq / LLM kodu buradaydı (Mevcut kodun detaylı yapay zeka kısmı buraya eklenecek, ben sadeleştirdim)
    // ÖNEMLİ OLAN KAYIT KISMI:
    
    // Varsayılan değerler (Gerçek uygulamanda Groq'dan gelenleri koyarsın)
    const newCloth = await Cloth.create({
      userEmail: session.user.email, // <--- İŞTE KİLİT NOKTA
      imageUrl: imageBase64,
      category: "top", // Groq'dan gelen data.category olacak
      tags: ["manuel_eklendi"],
      // ... diğer alanlar
    });

    return NextResponse.json({ success: true, data: newCloth });
  } catch (error) {
    console.error('Clothes POST error:', error);
    return NextResponse.json({ error: 'Kıyafet eklenemedi' }, { status: 500 });
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