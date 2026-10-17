'use client'

import { useState, useEffect } from 'react'
import { supabase, Produto } from '@/lib/supabase'
import { Search, Package, DollarSign, Box, Tag, ShoppingBag, Store, Phone, Mail, MapPin, Barcode, Instagram, Facebook } from 'lucide-react'

export default function CatalogoPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState<string>('Todos')
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null)

  useEffect(() => {
    fetchProdutos()
  }, [])

  async function fetchProdutos() {
    const { data } = await supabase
      .from('produtos')
      .select('*')
      .order('nome')
      .not('oculto', 'eq', true)
    setProdutos(data || [])
    setLoading(false)
  }

  // Extrair categorias únicas
  const categorias = Array.from(new Set(produtos.map(p => p.descricao).filter((c): c is string => c !== null))).sort()

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoriaFilter === 'Todos' || produto.descricao === categoriaFilter)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Catálogo Online
                </h1>
                <p className="text-sm text-slate-500">Produtos de qualidade para você</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="tel:+5511999999999" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                <Phone className="w-5 h-5" />
                <span className="font-medium">(11) 99999-9999</span>
              </a>
              <a href="mailto:contato@loja.com" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                <Mail className="w-5 h-5" />
                <span className="font-medium">contato@loja.com</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Nossos Produtos</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Explore nossa seleção exclusiva de produtos com os melhores preços e qualidade garantida
          </p>
          <div className="flex items-center justify-center gap-12 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[150px]">
              <p className="text-4xl font-bold">{produtos.length}</p>
              <p className="text-blue-200 text-sm mt-1">Produtos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[150px]">
              <p className="text-4xl font-bold">{categorias.length}</p>
              <p className="text-blue-200 text-sm mt-1">Categorias</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[150px]">
              <p className="text-4xl font-bold">{produtos.reduce((sum, p) => sum + p.estoque_atual, 0)}</p>
              <p className="text-blue-200 text-sm mt-1">Em Estoque</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                />
              </div>
            </div>
            <div className="md:w-72">
              <select
                value={categoriaFilter}
                onChange={(e) => setCategoriaFilter(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-lg font-medium"
              >
                <option value="Todos">Todas as Categorias</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            <p className="mt-6 text-slate-600 text-lg">Carregando produtos...</p>
          </div>
        ) : filteredProdutos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-xl border border-slate-200">
            <Package className="w-20 h-20 mx-auto mb-6 text-slate-300" />
            <p className="text-slate-600 text-xl font-semibold">Nenhum produto encontrado</p>
            <p className="text-slate-400 mt-2">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProdutos.map((produto) => (
              <div
                key={produto.id}
                onClick={() => setSelectedProduct(produto)}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-2xl hover:border-blue-400 transition-all cursor-pointer group"
              >
                <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
                  <div className="w-full h-full bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Package className="w-20 h-20 text-slate-300" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-slate-900 text-lg line-clamp-2">{produto.nome}</h3>
                    {produto.categoria === 'Peça' && (
                      <Box className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    )}
                    {produto.categoria === 'Serviço' && (
                      <Tag className="w-6 h-6 text-purple-500 flex-shrink-0" />
                    )}
                  </div>
                  {produto.descricao && (
                    <p className="text-sm text-slate-500 mb-4">{produto.descricao}</p>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-slate-900">
                        R$ {produto.preco_venda.toFixed(2)}
                      </span>
                    </div>
                    {produto.preco_atacado && (
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                        Atacado: R$ {produto.preco_atacado.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ShoppingBag className="w-4 h-4 text-slate-400" />
                    <span className={`font-medium ${produto.estoque_atual > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {produto.estoque_atual > 0 ? `${produto.estoque_atual} em estoque` : 'Esgotado'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-10">
              <div className="w-full h-full bg-white rounded-2xl shadow-sm flex items-center justify-center">
                <Package className="w-40 h-40 text-slate-300" />
              </div>
            </div>
            <div className="p-10">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">{selectedProduct.nome}</h2>
                  {selectedProduct.descricao && (
                    <p className="text-lg text-slate-600">{selectedProduct.descricao}</p>
                  )}
                </div>
                <div className={`px-4 py-2 rounded-full text-base font-semibold ${
                  selectedProduct.categoria === 'Peça' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {selectedProduct.categoria}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6">
                  <p className="text-sm text-slate-500 mb-2 font-medium">Preço Unitário</p>
                  <p className="text-3xl font-bold text-slate-900">R$ {selectedProduct.preco_venda.toFixed(2)}</p>
                </div>
                {selectedProduct.preco_atacado && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                    <p className="text-sm text-green-600 mb-2 font-medium">Preço Atacado (5+)</p>
                    <p className="text-3xl font-bold text-green-700">R$ {selectedProduct.preco_atacado.toFixed(2)}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className={`text-lg font-medium ${selectedProduct.estoque_atual > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedProduct.estoque_atual > 0 
                      ? `${selectedProduct.estoque_atual} unidades em estoque` 
                      : 'Produto esgotado'}
                  </span>
                </div>
                {selectedProduct.codigo_barras && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Barcode className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-lg text-slate-600">{selectedProduct.codigo_barras}</span>
                  </div>
                )}
                {selectedProduct.gaveta && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-orange-600" />
                    </div>
                    <span className="text-lg text-slate-600">Localização: {selectedProduct.gaveta}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Catálogo Online</h3>
              </div>
              <p className="text-slate-400">Produtos de qualidade com os melhores preços para você.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-400">
                  <Phone className="w-5 h-5" />
                  <span>(11) 99999-9999</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="w-5 h-5" />
                  <span>contato@loja.com</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Redes Sociais</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-400">© 2024 Catálogo Online. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
