import './globals.css'
import Navbar from '@/components/navbar'

export const metadata = {
  title: 'Meu PDV - Sistema de Vendas',
  description: 'Sistema PDV profissional com gestão de produtos, clientes e vendas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 min-h-screen">
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  )
}
