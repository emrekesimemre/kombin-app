import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Favorite } from '@/models/Favorite';
import { getServerSession } from "next-auth"; // GÜVENLİK
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });

    await connectDB();
    const { mood, explanation, clothIds } = await req.json();
    
    // KAYDEDERKEN E-POSTAYI DA YAZ:
    const newFav = await Favorite.create({ 
      userEmail: session.user.email, // <--- KİLİT NOKTA
      mood, 
      explanation, 
      clothIds 
    });
    
    return NextResponse.json({ success: true, data: newFav });
  } catch (error) {
    console.error('Favorites POST error:', error);
    return NextResponse.json({ error: 'Kaydedilemedi' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });

    await connectDB();
    // SADECE GİRİŞ YAPAN KİŞİNİN FAVORİLERİNİ GETİR:
    const favs = await Favorite.find({ userEmail: session.user.email })
                               .populate('clothIds')
                               .sort({ createdAt: -1 });
                               
    return NextResponse.json({ success: true, data: favs });
  } catch (error) {
    console.error('Favorites GET error:', error);
    return NextResponse.json({ error: 'Favoriler getirilemedi' }, { status: 500 });
  }
}