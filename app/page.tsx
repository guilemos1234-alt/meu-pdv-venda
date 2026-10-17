'use client'

import Link from 'next/link'
import { Package, Users, ShoppingCart, Warehouse, TrendingUp, DollarSign, ArrowRight, Zap, Truck, BarChart3, RotateCcw } from 'lucide-react'

export default function Home() {
  const menuItems = [
    { 
      href: '/produtos', 
      icon: Package, 
      label: 'Produtos',
      description: 'Gerencie seu catálogo completo',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      href: '/clientes', 
      icon: Users, 
      label: 'Clientes',
      description: 'Cadastre seus lojistas',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      href: '/fornecedores', 
      icon: Truck, 
      label: 'Fornecedores',
      description: 'Cadastre seus fornecedores',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600'
    },
    { 
      href: '/vendas', 
      icon: ShoppingCart, 
      label: 'Vendas',
      description: 'Registre novas vendas',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    { 
      href: '/estoque', 
      icon: Warehouse, 
      label: 'Estoque',
      description: 'Visão do lojista',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    { 
      href: '/relatorios', 
      icon: BarChart3, 
      label: 'Relatórios',
      description: 'Acompanhe métricas',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    { 
      href: '/devolucoes', 
      icon: RotateCcw, 
      label: 'Devoluções',
      description: 'Gerencie trocas',
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600'
    },
  ]

  const stats = [
    { icon: TrendingUp, label: 'Vendas Hoje', value: 'R$ 0,00' },
    { icon: DollarSign, label: 'Mês Atual', value: 'R$ 0,00' },
    { icon: Package, label: 'Produtos', value: '0' },
    { icon: Users, label: 'Clientes', value: '0' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
            <Zap className="w-4 h-4 text-orange-400" />
            <span>Sistema Profissional de Gestão</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Gerencie seu Negócio<br />
            <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
              com Eficiência
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Controle completo de produtos, clientes, vendas e estoque. 
            Tudo em um só lugar, de forma simples e profissional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/vendas"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <ShoppingCart className="w-5 h-5" />
              Nova Venda
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/produtos"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all backdrop-blur"
            >
              <Package className="w-5 h-5" />
              Ver Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 -mt-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-slate-700" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">O que você precisa fazer?</h2>
            <p className="text-gray-600">Acesse rapidamente todas as funcionalidades do sistema</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                <div className="p-6">
                  <div className={`w-14 h-14 ${item.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-7 h-7 ${item.textColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.label}</h3>
                  <p className="text-gray-500 text-sm mb-4">{item.description}</p>
                  <div className={`flex items-center gap-2 ${item.textColor} font-medium text-sm`}>
                    <span>Acessar</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Por que usar nosso PDV?</h2>
            <p className="text-gray-600">Funcionalidades pensadas para o seu negócio</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Controle Total</h3>
              <p className="text-gray-500">Gerencie produtos, estoque e vendas em tempo real. Tenha visibilidade completa do seu negócio.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Gestão de Clientes</h3>
              <p className="text-gray-500">Cadastre lojistas e acompanhe o histórico de vendas por cliente de forma organizada.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Rápido e Simples</h3>
              <p className="text-gray-500">Interface intuitiva que permite registrar vendas em segundos, sem complicação.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PDV</span>
                </div>
                <span className="font-bold text-xl">Meu PDV</span>
              </div>
              <p className="text-gray-400 text-sm">
                Sistema profissional de gestão para seu negócio. 
                Controle vendas, produtos e clientes em um só lugar.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/produtos" className="hover:text-white transition-colors">Produtos</Link></li>
                <li><Link href="/clientes" className="hover:text-white transition-colors">Clientes</Link></li>
                <li><Link href="/fornecedores" className="hover:text-white transition-colors">Fornecedores</Link></li>
                <li><Link href="/vendas" className="hover:text-white transition-colors">Vendas</Link></li>
                <li><Link href="/estoque" className="hover:text-white transition-colors">Estoque</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>suporte@meupdv.com</li>
                <li>(11) 99999-9999</li>
                <li>São Paulo, SP</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2024 Meu PDV. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
