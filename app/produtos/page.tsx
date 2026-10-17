'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, Produto } from '@/lib/supabase'
import { Plus, Edit, Trash2, Search, Package, Filter, ArrowRight, AlertTriangle, Barcode, Printer, X, Eye, EyeOff } from 'lucide-react'

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [descricaoFilter, setDescricaoFilter] = useState<string>('Todos')
  const [mostrarOcultos, setMostrarOcultos] = useState(false)
  const [showConferencia, setShowConferencia] = useState(false)

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

  async function deleteProduto(id: string) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    const { error } = await supabase.from('produtos').delete().eq('id', id)

    if (error) {
      alert('Erro ao excluir produto: ' + error.message)
    } else {
      fetchProdutos()
    }
  }

  async function toggleOcultarProduto(id: string, oculto: boolean) {
    const { error } = await supabase
      .from('produtos')
      .update({ oculto: !oculto })
      .eq('id', id)

    if (error) {
      alert('Erro ao ocultar/desocultar produto: ' + error.message)
    } else {
      fetchProdutos()
    }
  }

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (descricaoFilter === 'Todos' || produto.descricao === descricaoFilter) &&
    (mostrarOcultos || !produto.oculto)
  )

  // Extrair descrições únicas dos produtos
  const descricoes = Array.from(new Set(produtos.map(p => p.descricao).filter((c): c is string => c !== null))).sort()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
                <Package className="w-4 h-4" />
                <span>Gestão de Produtos</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Seu Catálogo</h1>
              <p className="text-gray-400 mt-2">Gerencie todos os produtos do seu negócio</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConferencia(true)}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
              >
                <Printer className="w-5 h-5" />
                Conferência
              </button>
              <Link
                href="/produtos/novo"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Novo Produto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="px-4 -mt-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-3xl font-bold text-slate-900">{produtos.length}</p>
              <p className="text-sm text-gray-500">Total de Produtos</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-3xl font-bold text-blue-600">
                {descricoes.length}
              </p>
              <p className="text-sm text-gray-500">Tipos</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-3xl font-bold text-orange-600">
                {produtos.reduce((sum, p) => sum + p.estoque_atual, 0)}
              </p>
              <p className="text-sm text-gray-500">Em Estoque</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
              <p className="text-3xl font-bold text-red-600">
                R$ {produtos.reduce((sum, p) => sum + (p.custo || 0) * p.estoque_atual, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Valor Total de Custo</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
              <p className="text-3xl font-bold text-green-600">
                R$ {produtos.reduce((sum, p) => sum + p.preco_venda * p.estoque_atual, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Valor Total em Venda</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={descricaoFilter}
                onChange={(e) => setDescricaoFilter(e.target.value)}
                className="bg-transparent text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="Todos">Todos os Tipos</option>
                {descricoes.map((descricao) => (
                  <option key={descricao} value={descricao}>
                    {descricao}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarOcultos}
                  onChange={(e) => setMostrarOcultos(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Mostrar ocultos</span>
              </label>
            </div>
          </div>

          {/* Products Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Produto</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Código</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Categoria</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Preço Venda</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Preço Atacado</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Estoque</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProdutos.map((produto) => (
                      <tr key={produto.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{produto.nome}</p>
                              {produto.descricao && (
                                <p className="text-sm text-gray-500 truncate max-w-xs">{produto.descricao}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {produto.codigo_barras && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Barcode className="w-4 h-4" />
                              <span className="text-sm font-mono">{produto.codigo_barras}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            produto.categoria === 'Peça' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {produto.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-slate-900">
                            R$ {produto.preco_venda.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-slate-600">
                            {produto.preco_atacado ? `R$ ${produto.preco_atacado.toFixed(2)}` : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${
                              produto.estoque_atual <= produto.estoque_minimo
                                ? 'bg-red-100 text-red-700' 
                                : produto.estoque_atual > 0 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                            }`}>
                              {produto.estoque_atual <= produto.estoque_minimo && produto.estoque_atual > 0 && (
                                <AlertTriangle className="w-4 h-4" />
                              )}
                              {produto.estoque_atual}
                            </span>
                            {produto.estoque_atual <= produto.estoque_minimo && produto.estoque_atual > 0 && (
                              <span className="text-xs text-red-600 mt-1">Estoque baixo!</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/produtos/${produto.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => toggleOcultarProduto(produto.id, produto.oculto)}
                              className={`p-2 ${produto.oculto ? 'text-green-600 hover:bg-green-50' : 'text-gray-600 hover:bg-gray-50'} rounded-lg transition-colors`}
                              title={produto.oculto ? 'Desocultar produto' : 'Ocultar produto'}
                            >
                              {produto.oculto ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => deleteProduto(produto.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredProdutos.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum produto encontrado</p>
                  <Link
                    href="/produtos/novo"
                    className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Cadastrar primeiro produto
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modal de Conferência */}
      {showConferencia && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Conferência de Estoque</h2>
                <p className="text-gray-500 text-sm mt-1">Lista de produtos para conferência física</p>
              </div>
              <button
                onClick={() => setShowConferencia(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <button
                onClick={() => window.print()}
                className="mb-4 inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                <Printer className="w-4 h-4" />
                Imprimir Lista
              </button>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Produto</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Código</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Estoque Atual</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Conferido</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Diferença</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {produtos.map((produto, index) => (
                      <tr key={produto.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{produto.nome}</p>
                          {produto.descricao && (
                            <p className="text-xs text-gray-500 truncate max-w-xs">{produto.descricao}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {produto.codigo_barras ? (
                            <span className="text-sm font-mono text-gray-600">{produto.codigo_barras}</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-slate-900">{produto.estoque_atual}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-400">-</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Instruções:</strong> Imprima esta lista e faça a conferência física do estoque. 
                  Preencha a coluna "Conferido" com a quantidade real encontrada. 
                  A coluna "Diferença" será calculada automaticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
