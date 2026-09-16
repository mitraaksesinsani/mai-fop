import { NextRequest, NextResponse } from 'next/server';
import { authenticateUserAction } from '@/app/actions/masterData';
import { INITIAL_SYSTEM_USERS } from '@/lib/serverDb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = (body.email || body.username || body.identifier || '').trim().toLowerCase();
    const password = (body.password || '').trim();
    const rememberMe = body.rememberMe !== false;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Username/Email dan Password wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Verifikasi via authenticateUserAction
    let authResult = await authenticateUserAction(identifier, password);

    // 2. Fallback jika ada akun bawaan yang cocok
    if (!authResult.success) {
      const builtIn = INITIAL_SYSTEM_USERS.find(
        (u) =>
          u.username.toLowerCase() === identifier ||
          (u.email && u.email.toLowerCase() === identifier) ||
          `${u.username.toLowerCase()}@mai.co.id` === identifier
      );

      if (builtIn) {
        if (builtIn.password === password) {
          authResult = {
            success: true,
            user: {
              id: builtIn.id,
              email: builtIn.email || `${builtIn.username}@mai.co.id`,
              name: builtIn.fullName,
              role: builtIn.role,
              phone: builtIn.phone,
              avatar: builtIn.avatar,
            },
          };
        } else {
          return NextResponse.json(
            { error: 'Password yang dimasukkan salah.' },
            { status: 401 }
          );
        }
      }
    }

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Username atau Password salah.' },
        { status: 401 }
      );
    }

    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 1;
    const token = `auth_token_${authResult.user.id}_${Date.now()}`;

    const response = NextResponse.json({
      success: true,
      user: authResult.user,
      token,
      accessToken: token,
    });

    // Set cookie langsung melalui HTTP response header agar mobile browser 100% menyimpannya
    response.cookies.set({
      name: 'nims_token',
      value: token,
      path: '/',
      maxAge,
      sameSite: 'lax',
      secure: false, // Memungkinkan akses via HTTP lokal (192.168.x.x)
      httpOnly: false,
    });

    return response;
  } catch (err: any) {
    console.error('API /api/auth/login error:', err);
    return NextResponse.json(
      { error: err?.message || 'Terjadi kesalahan pada server saat otentikasi.' },
      { status: 500 }
    );
  }
}
