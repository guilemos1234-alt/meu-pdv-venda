'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Users, ShoppingCart, Warehouse, Home, Menu, X, Wrench, Truck, BarChart3, RotateCcw, Settings, User } from 'lucide-react'
import { useState } from 'react'
import LogoutButton from './logout-button'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', icon: Home, label: 'Início' },
    { href: '/produtos', icon: Package, label: 'Produtos' },
    { href: '/ordens-servico', icon: Wrench, label: 'Ordem de Serviço' },
    { href: '/clientes', icon: Users, label: 'Clientes' },
    { href: '/fornecedores', icon: Truck, label: 'Fornecedores' },
    { href: '/vendas', icon: ShoppingCart, label: 'Vendas' },
    { href: '/estoque', icon: Warehouse, label: 'Estoque' },
    { href: '/relatorios', icon: BarChart3, label: 'Relatórios' },
    { href: '/devolucoes', icon: RotateCcw, label: 'Devoluções' },
    { href: '/configuracao', icon: Settings, label: 'Configuração' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PDV</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Meu PDV</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Info & Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Admin</span>
            </div>
            <LogoutButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
            <div className="flex items-center gap-3 px-4 py-3">
              <User className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-300">Admin</span>
            </div>
            <div className="px-4">
              <LogoutButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
