'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Package, DollarSign, Tag, Box, FileText, CheckCircle, Barcode, Plus } from 'lucide-react'

export default function EditarProdutoPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    nome: '',
    categoria_texto: '',
    preco_venda: '',
    preco_atacado: '',
    custo: '',
    estoque_atual: '0',
    estoque_minimo: '5',
    tipo_produto: 'Peça' as 'Peça' | 'Serviço',
    gaveta: '',
  })
  const [codigoBarras, setCodigoBarras] = useState('')
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>([])
  const [showCategoriaDropdown, setShowCategoriaDropdown] = useState(false)
  const [showNovaCategoriaInput, setShowNovaCategoriaInput] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState('')

  useEffect(() => {
    fetchProduto()
    fetchCategorias()
  }, [])

  async function fetchCategorias() {
    const { data } = await supabase.from('produtos').select('descricao').not('descricao', 'is', null)
    if (data) {
      const unicos = [...new Set(data.map(p => p.descricao).filter(Boolean))]
      setCategoriasExistentes(unicos)
    }
  }

  async function adicionarNovaCategoria() {
    if (!novaCategoria.trim()) return

    const categoriaTrimmed = novaCategoria.trim()
    if (!categoriasExistentes.includes(categoriaTrimmed)) {
      setCategoriasExistentes([...categoriasExistentes, categoriaTrimmed])
    }

    setFormData({ ...formData, categoria_texto: categoriaTrimmed })
    setNovaCategoria('')
    setShowNovaCategoriaInput(false)
  }

  async function fetchProduto() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      alert('Erro ao buscar produto: ' + error.message)
      router.push('/produtos')
    } else if (data) {
      setCodigoBarras(data.codigo_barras || '')
      setFormData({
        nome: data.nome || '',
        categoria_texto: data.descricao || '',
        preco_venda: data.preco_venda?.toString() || '',
        preco_atacado: data.preco_atacado?.toString() || '',
        custo: data.custo?.toString() || '',
        estoque_atual: data.estoque_atual?.toString() || '0',
        estoque_minimo: data.estoque_minimo?.toString() || '5',
        tipo_produto: data.categoria || 'Peça',
        gaveta: data.gaveta || '',
      })
    }
    setFetching(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('produtos')
      .update({
        nome: formData.nome,
        descricao: formData.categoria_texto || null,
        preco_venda: parseFloat(formData.preco_venda),
        preco_atacado: formData.preco_atacado ? parseFloat(formData.preco_atacado) : null,
        custo: formData.custo ? parseFloat(formData.custo) : null,
        estoque_atual: parseInt(formData.estoque_atual),
        estoque_minimo: parseInt(formData.estoque_minimo) || 5,
        categoria: formData.tipo_produto,
        gaveta: formData.gaveta || null,
      })
      .eq('id', params.id)

    if (error) {
      alert('Erro ao atualizar produto: ' + error.message)
    } else {
      router.push('/produtos')
    }
    setLoading(false)
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-500 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/produtos" 
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar para Produtos</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Editar Produto</h1>
              <p className="text-blue-100 mt-1">Atualize as informações do produto</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Informações Básicas</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {codigoBarras && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Código de Barras (EAN-13)
                    </label>
                    <div className="relative">
                      <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        readOnly
                        value={codigoBarras}
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-mono"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Categoria
                    </label>
                    <Link
                      href="/produtos/categorias"
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Gerenciar Categorias
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ex: Celular, Fone, Carregador..."
                      value={formData.categoria_texto}
                      onChange={(e) => {
                        setFormData({ ...formData, categoria_texto: e.target.value })
                        setShowCategoriaDropdown(e.target.value.length > 0)
                      }}
                      onFocus={() => setShowCategoriaDropdown(formData.categoria_texto.length > 0)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {showCategoriaDropdown && categoriasExistentes.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {categoriasExistentes
                          .filter(cat => cat.toLowerCase().includes(formData.categoria_texto.toLowerCase()))
                          .map((cat, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, categoria_texto: cat })
                                setShowCategoriaDropdown(false)
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                            >
                              {cat}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Tipo de produto (ex: Celular, Fone, Carregador)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tipo de Produto *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo_produto: 'Peça' })}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                        formData.tipo_produto === 'Peça'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <Box className="w-4 h-4" />
                      Peça
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo_produto: 'Serviço' })}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                        formData.tipo_produto === 'Serviço'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <Tag className="w-4 h-4" />
                      Serviço
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Localização (Gaveta)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Gaveta A1, Prateleira 3..."
                    value={formData.gaveta}
                    onChange={(e) => setFormData({ ...formData, gaveta: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Onde o produto está fisicamente armazenado</p>
                </div>
              </div>
            </div>

            {/* Preços */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Preços</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Preço de Venda *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.preco_venda}
                        onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Preço Atacado
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.preco_atacado}
                        onChange={(e) => setFormData({ ...formData, preco_atacado: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Preço especial para lojistas</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Custo (opcional)
                  </label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.custo}
                      onChange={(e) => setFormData({ ...formData, custo: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Para cálculo de margem de lucro</p>
                </div>

                {/* Lucro */}
                {formData.custo && formData.preco_venda && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <h3 className="text-sm font-semibold text-green-800 mb-3">Margem de Lucro</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Varejo */}
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Varejo (1-4 peças)</p>
                        <p className="text-lg font-bold text-green-700">
                          R$ {(parseFloat(formData.preco_venda || '0') - parseFloat(formData.custo || '0')).toFixed(2)}
                        </p>
                        <p className="text-sm text-green-600">
                          {((parseFloat(formData.custo || '0') > 0) 
                            ? (((parseFloat(formData.preco_venda || '0') - parseFloat(formData.custo || '0')) / parseFloat(formData.custo || '0')) * 100).toFixed(1) 
                            : '0')}%
                        </p>
                      </div>
                      
                      {/* Atacado */}
                      {formData.preco_atacado && (
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Atacado (5+ peças)</p>
                          <p className="text-lg font-bold text-blue-700">
                            R$ {(parseFloat(formData.preco_atacado || '0') - parseFloat(formData.custo || '0')).toFixed(2)}
                          </p>
                          <p className="text-sm text-blue-600">
                            {((parseFloat(formData.custo || '0') > 0) 
                              ? (((parseFloat(formData.preco_atacado || '0') - parseFloat(formData.custo || '0')) / parseFloat(formData.custo || '0')) * 100).toFixed(1) 
                              : '0')}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Estoque */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Box className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Estoque</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Quantidade em Estoque
                    </label>
                    <input
                      type="number"
                      value={formData.estoque_atual}
                      onChange={(e) => setFormData({ ...formData, estoque_atual: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Estoque Mínimo
                    </label>
                    <input
                      type="number"
                      value={formData.estoque_minimo}
                      onChange={(e) => setFormData({ ...formData, estoque_minimo: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">Alerta quando estoque estiver abaixo deste valor</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/produtos"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
