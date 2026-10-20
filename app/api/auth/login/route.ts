import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validação simples - você pode alterar estas credenciais
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ultracell.com'
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Gerar um token simples (em produção, use JWT real)
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64')

      const response = NextResponse.json({
        success: true,
        user: { email }
      })

      // Set cookie
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return response
    }

    return NextResponse.json(
      { error: 'Email ou senha incorretos' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar login' },
      { status: 500 }
    )
  }
}
