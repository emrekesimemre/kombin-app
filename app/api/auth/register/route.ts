import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    // Bu e-posta ile kayıtlı biri var mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Bu e-posta zaten kullanımda!" }, { status: 400 });
    }

    // Şifreyi güvenli hale getir (hash)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı kaydet
    await User.create({ name, email, password: hashedPassword });

    return NextResponse.json({ success: true, message: "Kayıt başarılı!" });
  } catch (error) {
    console.error('Register POST error:', error);
    return NextResponse.json({ error: "Kayıt olurken bir hata oluştu." }, { status: 500 });
  }
}