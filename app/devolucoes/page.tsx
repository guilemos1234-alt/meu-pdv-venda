'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  RotateCcw, 
  Package, 
  Search, 
  Calendar, 
  User, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  X
} from 'lucide-react'

interface Devolucao {
  id: string
  venda_id: string
  produto_nome: string
  quantidade: number
  motivo: string
  status: 'Pendente' | 'Aprovada' | 'Rejeitada'
  valor_reembolso: number
  data_devolucao: string
  cliente_nome?: string
}

export default function DevolucoesPage() {
  const [devolucoes, setDevolucoes] = useState<Devolucao[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Pendente' | 'Aprovada' | 'Rejeitada'>('Todos')
  const [modalNova, setModalNova] = useState(false)
  const [vendasModal, setVendasModal] = useState<any[]>([])
  const [searchModalTerm, setSearchModalTerm] = useState('')
  const [selectedVenda, setSelectedVenda] = useState<any | null>(null)
  const [selectedProdutoIndex, setSelectedProdutoIndex] = useState(0)
  const [devolucaoQtd, setDevolucaoQtd] = useState(1)
  const [devolucaoMotivo, setDevolucaoMotivo] = useState('')
  const [devolucaoValor, setDevolucaoValor] = useState<number | ''>('')

  useEffect(() => {
    fetchDevolucoes()
  }, [])

  useEffect(() => {
    if (modalNova) {
      loadVendasModal()
      setSelectedVenda(null)
      setSelectedProdutoIndex(0)
      setDevolucaoQtd(1)
      setDevolucaoMotivo('')
      setDevolucaoValor('')
    }
  }, [modalNova])

  function loadVendasModal() {
    const vendas = JSON.parse(localStorage.getItem('vendas') || '[]')
    const vendasFormatadas = (vendas || []).map((v: any, index: number) => ({
      id: v.id ?? index,
      data: v.data ? new Date(v.data).toISOString() : new Date().toISOString(),
      cliente: v.clienteNome || v.cliente || 'Cliente não informado',
      itens: v.itens || [],
      total: v.total || 0,
      original: v
    })).sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())
    setVendasModal(vendasFormatadas)
  }

  async function fetchDevolucoes() {
    const { data, error } = await supabase
      .from('devolucoes')
      .select('*')
      .order('data_devolucao', { ascending: false })

    if (error) {
      console.error('Erro ao buscar devoluções:', error)
    } else {
      setDevolucoes(data || [])
    }
    setLoading(false)
  }

  const devolucoesFiltradas = devolucoes.filter(d => {
    const matchSearch = d.produto_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       d.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filtroStatus === 'Todos' || d.status === filtroStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: devolucoes.length,
    pendentes: devolucoes.filter(d => d.status === 'Pendente').length,
    aprovadas: devolucoes.filter(d => d.status === 'Aprovada').length,
    rejeitadas: devolucoes.filter(d => d.status === 'Rejeitada').length,
    valorTotal: devolucoes.filter(d => d.status === 'Aprovada').reduce((acc, d) => acc + (d.valor_reembolso || 0), 0)
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Aprovada':
        return { color: 'bg-green-100 text-green-700', icon: CheckCircle }
      case 'Rejeitada':
        return { color: 'bg-red-100 text-red-700', icon: XCircle }
      default:
        return { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-rose-600 to-rose-500 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-rose-100 text-sm mb-2">
                <RotateCcw className="w-4 h-4" />
                <span>Controle de Devoluções</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Devoluções</h1>
              <p className="text-rose-100 mt-2">Gerencie trocas e reembolsos</p>
            </div>
            <button
              onClick={() => setModalNova(true)}
              className="flex items-center gap-2 bg-white text-rose-600 px-4 py-2 rounded-lg font-medium hover:bg-rose-50 transition-all"
            >
              <Plus className="w-5 h-5" />
              Nova Devolução
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
                  <p className="text-sm text-gray-500">Pendentes</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.aprovadas}</p>
                  <p className="text-sm text-gray-500">Aprovadas</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.rejeitadas}</p>
                  <p className="text-sm text-gray-500">Rejeitadas</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">R$ {stats.valorTotal.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Reembolsado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Tabs de Status */}
            <div className="flex gap-2">
              {(['Todos', 'Pendente', 'Aprovada', 'Rejeitada'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFiltroStatus(status)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filtroStatus === status
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por produto ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lista de Devoluções */}
      <section className="py-4 px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Data</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Produto</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Qtd</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Motivo</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Reembolso</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {devolucoesFiltradas.map((devolucao) => {
                      const status = getStatusConfig(devolucao.status)
                      const StatusIcon = status.icon

                      return (
                        <tr key={devolucao.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-slate-900">
                                {new Date(devolucao.data_devolucao).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-rose-600" />
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900">{devolucao.produto_nome}</span>
                                {devolucao.cliente_nome && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {devolucao.cliente_nome}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-slate-900">{devolucao.quantidade}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 max-w-xs truncate">{devolucao.motivo}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-green-600">
                              R$ {devolucao.valor_reembolso?.toFixed(2) || '0,00'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {devolucao.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              
              {devolucoesFiltradas.length === 0 && (
                <div className="text-center py-12">
                  <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma devolução encontrada</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modal Nova Devolução: listar vendas e registrar devolução */}
      {modalNova && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full">
            <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Registrar Devolução</h3>
                <p className="text-gray-500 text-sm mt-1">Selecione a venda e o produto a ser devolvido</p>
              </div>
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por id, cliente, produto ou data..."
                    value={searchModalTerm}
                    onChange={(e) => setSearchModalTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setModalNova(false)}
                  className="inline-flex items-center justify-center p-3 rounded-full text-gray-500 hover:bg-gray-100 transition"
                  aria-label="Fechar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div className="h-96 overflow-y-auto">
                  {/* carregar vendas do localStorage e supabase */}
                  {vendasModal.length === 0 ? (
                    <p className="text-gray-500">Nenhuma venda encontrada</p>
                  ) : (
                    <div className="space-y-2">
                      {vendasModal.filter(v => {
                        const q = searchModalTerm.trim().toLowerCase()
                        if (!q) return true
                        const byId = String(v.id).toLowerCase().includes(q)
                        const byCliente = (v.cliente || '').toLowerCase().includes(q)
                        const byProduto = (v.itens || []).some((it: any) => (it.nome || it.produto || '').toLowerCase().includes(q))
                        const byData = new Date(v.data).toLocaleDateString('pt-BR').toLowerCase().includes(q)
                        return byId || byCliente || byProduto || byData
                      }).map((venda, idx) => (
                        <div
                          key={idx}
                          onClick={() => { setSelectedVenda(venda); setSelectedProdutoIndex(0); setDevolucaoQtd(1); setDevolucaoValor('') }}
                          className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 border ${selectedVenda?.id === venda.id ? 'border-rose-400 bg-rose-50' : 'border-transparent'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">Venda {String(venda.id)}</div>
                              <div className="text-sm text-gray-500">{venda.cliente || 'Cliente não informado'}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">R$ {Number(venda.total || 0).toFixed(2)}</div>
                              <div className="text-sm text-gray-400">{new Date(venda.data).toLocaleDateString('pt-BR')}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mt-2">
                            {(venda.itens || []).slice(0,3).map((it: any, i: number) => (
                              <div key={i}>{it.nome || it.produto} x{it.quantidade}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                {/* Formulário quando uma venda é selecionada */}
                {selectedVenda ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Venda selecionada</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">Venda {String(selectedVenda.id)}</div>
                            <div className="text-sm text-gray-500">{selectedVenda.cliente}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">R$ {Number(selectedVenda.total || 0).toFixed(2)}</div>
                            <div className="text-sm text-gray-400">{new Date(selectedVenda.data).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Produto</label>
                      <select
                        value={selectedProdutoIndex}
                        onChange={(e) => setSelectedProdutoIndex(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        {(selectedVenda.itens || []).map((it: any, i: number) => (
                          <option key={i} value={i}>{it.nome || it.produto} — x{it.quantidade}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Quantidade</label>
                        <input
                          type="number"
                          min="1"
                          max={(selectedVenda.itens?.[selectedProdutoIndex]?.quantidade) || 1}
                          value={devolucaoQtd}
                          onChange={(e) => setDevolucaoQtd(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Valor Reembolso</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={devolucaoValor === '' ? (selectedVenda.itens?.[selectedProdutoIndex]?.preco || selectedVenda.itens?.[selectedProdutoIndex]?.preco_unitario || '') : devolucaoValor}
                            onChange={(e) => setDevolucaoValor(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Motivo</label>
                      <textarea
                        rows={3}
                        value={devolucaoMotivo}
                        onChange={(e) => setDevolucaoMotivo(e.target.value)}
                        placeholder="Descreva o motivo da devolução..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setModalNova(false)
                          setSelectedVenda(null)
                          setSearchModalTerm('')
                        }}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={async () => {
                          // Registrar devolução
                          if (!selectedVenda) return
                          const produto = selectedVenda.itens?.[selectedProdutoIndex]
                          if (!produto) { alert('Selecione um produto válido da venda'); return }
                          if (devolucaoQtd <= 0) { alert('Quantidade inválida'); return }

                          const payload = {
                            venda_id: selectedVenda.id,
                            produto_nome: produto.nome || produto.produto,
                            quantidade: devolucaoQtd,
                            motivo: devolucaoMotivo || 'Não informado',
                            status: 'Pendente',
                            valor_reembolso: devolucaoValor === '' ? ((produto.preco || produto.preco_unitario || 0) * devolucaoQtd) : devolucaoValor,
                            data_devolucao: new Date().toISOString(),
                            cliente_nome: selectedVenda.cliente || null
                          }

                          const { data, error } = await supabase.from('devolucoes').insert(payload).select()
                          if (error) {
                            console.error('Erro ao registrar devolução:', error)
                            alert('Erro ao registrar devolução')
                            return
                          }

                          // reset e recarregar
                          setModalNova(false)
                          setSelectedVenda(null)
                          setSearchModalTerm('')
                          setDevolucaoMotivo('')
                          setDevolucaoQtd(1)
                          setDevolucaoValor('')
                          fetchDevolucoes()
                        }}
                        className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-all"
                      >
                        Registrar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Selecione uma venda à esquerda para continuar</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
