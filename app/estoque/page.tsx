'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, Produto } from '@/lib/supabase'
import { 
  Warehouse, 
  CheckCircle, 
  XCircle, 
  Search, 
  Package, 
  Info, 
  ArrowRight, 
  ShoppingCart, 
  AlertTriangle,
  Tag,
  Wrench,
  Plus
} from 'lucide-react'

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState<'Todas' | 'Peça' | 'Serviço'>('Todas')
  const [modalPedido, setModalPedido] = useState(false)
  const [itensPedido, setItensPedido] = useState<Produto[]>([])

  useEffect(() => {
    fetchProdutos()
  }, [])

  async function fetchProdutos() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome')

    if (error) {
      console.error('Erro ao buscar produtos:', error)
    } else {
      setProdutos(data || [])
    }
    setLoading(false)
  }

  const produtosFiltrados = produtos.filter(produto => {
    const matchSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = categoriaAtiva === 'Todas' || produto.categoria === categoriaAtiva
    return matchSearch && matchCategoria
  })

  const produtosPorCategoria = {
    'Peça': produtos.filter(p => p.categoria === 'Peça'),
    'Serviço': produtos.filter(p => p.categoria === 'Serviço')
  }

  const estoqueBaixo = produtos.filter(p => 
    p.categoria === 'Peça' && p.estoque_atual <= p.estoque_minimo
  )
  
  const indisponiveis = produtos.filter(p => 
    p.categoria === 'Peça' && p.estoque_atual === 0
  )

  const adicionarAoPedido = (produto: Produto) => {
    if (!itensPedido.find(p => p.id === produto.id)) {
      setItensPedido([...itensPedido, produto])
    }
  }

  const removerDoPedido = (id: string) => {
    setItensPedido(itensPedido.filter(p => p.id !== id))
  }

  const getStatusEstoque = (produto: Produto) => {
    if (produto.categoria === 'Serviço') return { label: 'Serviço', color: 'bg-blue-100 text-blue-700', icon: Wrench }
    if (produto.estoque_atual === 0) return { label: 'Indisponível', color: 'bg-red-100 text-red-700', icon: XCircle }
    if (produto.estoque_atual <= produto.estoque_minimo) return { label: 'Estoque Baixo', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle }
    return { label: 'Em Estoque', color: 'bg-green-100 text-green-700', icon: CheckCircle }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-500 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-orange-100 text-sm mb-2">
                <Warehouse className="w-4 h-4" />
                <span>Controle de Estoque</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Estoque de Produtos</h1>
              <p className="text-orange-100 mt-2">Gerencie peças e serviços</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModalPedido(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Pedido ({itensPedido.length})
              </button>
              <Link
                href="/produtos/novo"
                className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-all"
              >
                <Plus className="w-5 h-5" />
                Novo Produto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Alertas */}
      {(estoqueBaixo.length > 0 || indisponiveis.length > 0) && (
        <section className="px-4 -mt-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  {indisponiveis.length > 0 
                    ? `${indisponiveis.length} produto(s) indisponível(is) e ${estoqueBaixo.length - indisponiveis.length} com estoque baixo`
                    : `${estoqueBaixo.length} produto(s) com estoque baixo`
                  }
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  Clique no botão "Adicionar ao Pedido" nos produtos que precisam de reposição.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{produtos.length}</p>
                  <p className="text-sm text-gray-500">Total Produtos</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Tag className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{produtosPorCategoria['Peça'].length}</p>
                  <p className="text-sm text-gray-500">Peças</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">{produtos.filter(p => p.categoria === 'Peça' && p.estoque_atual > p.estoque_minimo).length}</p>
                  <p className="text-sm text-gray-500">Estoque OK</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-600">{estoqueBaixo.length}</p>
                  <p className="text-sm text-gray-500">Estoque Baixo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros e Busca */}
      <section className="py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Tabs de Categoria */}
            <div className="flex gap-2">
              {(['Todas', 'Peça', 'Serviço'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaAtiva(cat)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    categoriaAtiva === cat
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-4 px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Produto</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Categoria</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Preço Venda</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Estoque</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {produtosFiltrados.map((produto) => {
                      const status = getStatusEstoque(produto)
                      const StatusIcon = status.icon
                      const precisaRepor = produto.categoria === 'Peça' && produto.estoque_atual <= produto.estoque_minimo

                      return (
                        <tr key={produto.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                produto.categoria === 'Peça' 
                                  ? 'bg-gradient-to-br from-orange-100 to-orange-200' 
                                  : 'bg-gradient-to-br from-blue-100 to-blue-200'
                              }`}>
                                {produto.categoria === 'Peça' ? (
                                  <Package className="w-5 h-5 text-orange-600" />
                                ) : (
                                  <Wrench className="w-5 h-5 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900">{produto.nome}</span>
                                {produto.codigo_barras && (
                                  <p className="text-xs text-gray-400">{produto.codigo_barras}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              produto.categoria === 'Peça' 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {produto.categoria}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-lg font-bold text-green-600">
                              R$ {produto.preco_venda?.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {produto.categoria === 'Peça' ? (
                              <div>
                                <span className={`font-bold ${
                                  produto.estoque_atual <= produto.estoque_minimo ? 'text-red-600' : 'text-slate-900'
                                }`}>
                                  {produto.estoque_atual}
                                </span>
                                <span className="text-xs text-gray-400 block">Min: {produto.estoque_minimo}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {precisaRepor ? (
                              <button
                                onClick={() => adicionarAoPedido(produto)}
                                disabled={itensPedido.find(p => p.id === produto.id) !== undefined}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-medium hover:bg-orange-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                {itensPedido.find(p => p.id === produto.id) ? (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    Adicionado
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    Pedir
                                  </>
                                )}
                              </button>
                            ) : (
                              <Link
                                href={`/produtos/${produto.id}`}
                                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                              >
                                Editar
                              </Link>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              
              {produtosFiltrados.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum produto encontrado</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modal de Pedido */}
      {modalPedido && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Lista de Pedido</h3>
              <button
                onClick={() => setModalPedido(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {itensPedido.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum item adicionado ao pedido.
                  <br />
                  <span className="text-sm">Adicione produtos com estoque baixo ou indisponível.</span>
                </p>
              ) : (
                <div className="space-y-3">
                  {itensPedido.map(produto => (
                    <div key={produto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-slate-900">{produto.nome}</p>
                          <p className="text-xs text-gray-500">
                            Estoque: {produto.estoque_atual} | Min: {produto.estoque_minimo}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removerDoPedido(produto.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 space-y-3">
              {itensPedido.length > 0 && (
                <button
                  onClick={() => {
                    const lista = itensPedido.map(p => 
                      `- ${p.nome} (Estoque: ${p.estoque_atual}, Mínimo: ${p.estoque_minimo})`
                    ).join('\n')
                    const mensagem = `*Pedido de Reposição de Estoque*\n\n${lista}\n\nTotal de itens: ${itensPedido.length}`
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`
                    window.open(whatsappUrl, '_blank')
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Enviar Pedido por WhatsApp
                </button>
              )}
              <button
                onClick={() => setModalPedido(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
