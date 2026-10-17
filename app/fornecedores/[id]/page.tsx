'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Truck, Phone, Mail, MapPin, Building2, Plus, History, Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { formatPhone } from '@/lib/utils'

interface Fornecedor {
  id: string
  nome: string
  whatsapp: string | null
  email: string | null
  endereco: string | null
  cnpj: string | null
  created_at: string
}

interface Transacao {
  id: string
  tipo: 'compra' | 'pagamento' | 'deposito' | 'ajuste'
  valor: number
  descricao: string | null
  data: string
  created_at: string
}

export default function FornecedorDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null)
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [saldo, setSaldo] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [showModal, setShowModal] = useState(false)
  const [novaTransacao, setNovaTransacao] = useState({
    tipo: 'pagamento' as 'pagamento' | 'deposito' | 'compra',
    valor: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchFornecedor()
    fetchTransacoes()
  }, [])

  async function fetchFornecedor() {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Erro ao buscar fornecedor:', error)
    } else {
      setFornecedor(data)
    }
  }

  async function fetchTransacoes() {
    const { data, error } = await supabase
      .from('transacoes_fornecedor')
      .select('*')
      .eq('fornecedor_id', params.id)
      .order('data', { ascending: false })

    if (error) {
      console.error('Erro ao buscar transações:', error)
    } else {
      setTransacoes(data || [])
      calcularSaldo(data || [])
    }
    setLoading(false)
  }

  function calcularSaldo(transacoes: Transacao[]) {
    // Saldo positivo = você deve ao fornecedor (dívida)
    // Saldo negativo = fornecedor te deve (crédito)
    const total = transacoes.reduce((acc, t) => {
      if (t.tipo === 'compra') return acc + t.valor // você comprou, deve mais
      if (t.tipo === 'pagamento' || t.tipo === 'deposito') return acc - t.valor // você pagou, deve menos
      if (t.tipo === 'ajuste') return acc + t.valor // ajuste pode ser positivo ou negativo
      return acc
    }, 0)
    setSaldo(total)
  }

  async function adicionarTransacao(e: React.FormEvent) {
    e.preventDefault()
    
    const { error } = await supabase.from('transacoes_fornecedor').insert({
      fornecedor_id: params.id,
      tipo: novaTransacao.tipo,
      valor: parseFloat(novaTransacao.valor),
      descricao: novaTransacao.descricao || null,
      data: novaTransacao.data
    })

    if (error) {
      alert('Erro ao adicionar: ' + error.message)
    } else {
      setShowModal(false)
      setNovaTransacao({
        tipo: 'pagamento',
        valor: '',
        descricao: '',
        data: new Date().toISOString().split('T')[0]
      })
      fetchTransacoes()
    }
  }

  function formatarValor(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  function getTipoLabel(tipo: string) {
    const labels: Record<string, string> = {
      compra: 'Compra',
      pagamento: 'Pagamento',
      deposito: 'Depósito',
      ajuste: 'Ajuste'
    }
    return labels[tipo] || tipo
  }

  function getTipoIcon(tipo: string) {
    if (tipo === 'compra') return <ArrowUpCircle className="w-5 h-5 text-red-500" />
    if (tipo === 'pagamento' || tipo === 'deposito') return <ArrowDownCircle className="w-5 h-5 text-green-500" />
    return <History className="w-5 h-5 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!fornecedor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Fornecedor não encontrado</p>
          <Link href="/fornecedores" className="text-teal-600 hover:underline mt-2 inline-block">
            Voltar para fornecedores
          </Link>
        </div>
      </div>
    )
  }

  // Paginação
  const totalPages = Math.ceil(transacoes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const transacoesPaginadas = transacoes.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/fornecedores" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-teal-400 text-sm mb-1">
                <Truck className="w-4 h-4" />
                <span>Fornecedor</span>
              </div>
              <h1 className="text-2xl font-bold">{fornecedor.nome}</h1>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Saldo Card */}
        <div className={`rounded-2xl p-6 mb-6 ${saldo > 0 ? 'bg-red-50 border border-red-200' : saldo < 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium mb-1 ${saldo > 0 ? 'text-red-600' : saldo < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {saldo > 0 ? 'Você deve ao fornecedor' : saldo < 0 ? 'Crédito com fornecedor' : 'Sem saldo'}
              </p>
              <p className={`text-3xl font-bold ${saldo > 0 ? 'text-red-700' : saldo < 0 ? 'text-green-700' : 'text-gray-700'}`}>
                {formatarValor(Math.abs(saldo))}
              </p>
            </div>
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${saldo > 0 ? 'bg-red-100' : saldo < 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Wallet className={`w-8 h-8 ${saldo > 0 ? 'text-red-600' : saldo < 0 ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {fornecedor.cnpj && (
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">CNPJ</p>
                  <p className="font-medium text-slate-900">{fornecedor.cnpj}</p>
                </div>
              </div>
            </div>
          )}
          {fornecedor.whatsapp && (
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">WhatsApp</p>
                  <p className="font-medium text-slate-900">{formatPhone(fornecedor.whatsapp)}</p>
                </div>
              </div>
            </div>
          )}
          {fornecedor.email && (
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">E-mail</p>
                  <p className="font-medium text-slate-900">{fornecedor.email}</p>
                </div>
              </div>
            </div>
          )}
          {fornecedor.endereco && (
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Endereço</p>
                  <p className="font-medium text-slate-900">{fornecedor.endereco}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Registrar Pagamento
          </button>
        </div>

        {/* Histórico de Transações */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-slate-900">Histórico Financeiro</h2>
            <p className="text-sm text-gray-500">Registro de compras e pagamentos</p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {transacoes.length === 0 ? (
              <div className="p-8 text-center">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma transação registrada</p>
              </div>
            ) : (
              transacoesPaginadas.map((transacao) => (
                <div key={transacao.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTipoIcon(transacao.tipo)}
                    <div>
                      <p className="font-medium text-slate-900">{getTipoLabel(transacao.tipo)}</p>
                      {transacao.descricao && (
                        <p className="text-sm text-gray-500">{transacao.descricao}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(transacao.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${transacao.tipo === 'compra' ? 'text-red-600' : 'text-green-600'}`}>
                    {transacao.tipo === 'compra' ? '+' : '-'}{formatarValor(transacao.valor)}
                  </span>
                </div>
              ))
            )}
          </div>
          
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && goToPage(page)}
                      disabled={page === '...'}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${
                        page === currentPage
                          ? 'bg-teal-600 text-white'
                          : page === '...'
                          ? 'cursor-default text-gray-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                Página {currentPage} de {totalPages} • Mostrando {transacoesPaginadas.length} de {transacoes.length} transações
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Nova Transação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Registrar Pagamento</h2>
            <form onSubmit={adicionarTransacao} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNovaTransacao({ ...novaTransacao, tipo: 'compra' })}
                    className={`px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                      novaTransacao.tipo === 'compra'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Compra/Dívida
                  </button>
                  <button
                    type="button"
                    onClick={() => setNovaTransacao({ ...novaTransacao, tipo: 'pagamento' })}
                    className={`px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                      novaTransacao.tipo === 'pagamento'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Pagamento
                  </button>
                  <button
                    type="button"
                    onClick={() => setNovaTransacao({ ...novaTransacao, tipo: 'deposito' })}
                    className={`px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                      novaTransacao.tipo === 'deposito'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Depósito
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Valor *</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 font-medium">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={novaTransacao.valor}
                    onChange={(e) => setNovaTransacao({ ...novaTransacao, valor: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Data</label>
                <input
                  type="date"
                  required
                  value={novaTransacao.data}
                  onChange={(e) => setNovaTransacao({ ...novaTransacao, data: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Descrição (opcional)</label>
                <input
                  type="text"
                  value={novaTransacao.descricao}
                  onChange={(e) => setNovaTransacao({ ...novaTransacao, descricao: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus-ring-2 focus:ring-teal-500"
                  placeholder="Ex: Pagamento de peças..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
