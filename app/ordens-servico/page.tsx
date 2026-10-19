'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, OrdemServico, ClienteLojista, ItemOrdemServico } from '@/lib/supabase'
import { Plus, Edit, Trash2, Search, Wrench, ArrowRight, Filter, Calendar, Clock, CheckCircle, AlertCircle, XCircle, Loader2, Printer, Eye } from 'lucide-react'

export default function OrdensServicoPage() {
  const [ordens, setOrdens] = useState<(OrdemServico & { cliente: ClienteLojista | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedOrdem, setSelectedOrdem] = useState<(OrdemServico & { cliente: ClienteLojista | null; pecas?: ItemOrdemServico[] }) | null>(null)
  const [concluirModalOpen, setConcluirModalOpen] = useState(false)
  const [ordemParaConcluir, setOrdemParaConcluir] = useState<string | null>(null)
  const [metodoPagamento, setMetodoPagamento] = useState<'Débito' | 'Crédito' | 'Pix'>('Pix')
  const [parcelas, setParcelas] = useState<number>(1)

  useEffect(() => {
    fetchOrdens()
  }, [])

  async function fetchOrdens() {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .order('data_entrada', { ascending: false })

    if (error) {
      console.error('Erro ao buscar ordens:', error)
    } else {
      // Buscar clientes separadamente para cada ordem
      const ordensComClientes = await Promise.all(
        (data || []).map(async (ordem) => {
          let cliente = null
          if (ordem.cliente_id) {
            const { data: clienteData } = await supabase
              .from('clientes_lojistas')
              .select('id, nome_loja, whatsapp, email')
              .eq('id', ordem.cliente_id)
              .single()
            cliente = clienteData
          }
          return { ...ordem, cliente }
        })
      )
      setOrdens(ordensComClientes)
    }
    setLoading(false)
  }

  async function deleteOrdem(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta ordem de serviço?')) return

    const { error } = await supabase.from('ordens_servico').delete().eq('id', id)

    if (error) {
      alert('Erro ao excluir ordem: ' + error.message)
    } else {
      fetchOrdens()
    }
  }

  function abrirModalConcluir(id: string) {
    setOrdemParaConcluir(id)
    setMetodoPagamento('Pix')
    setParcelas(1)
    setConcluirModalOpen(true)
  }

  async function abrirModalImprimir(ordem: OrdemServico & { cliente: ClienteLojista | null }) {
    // Buscar peças da ordem
    const { data: pecasData } = await supabase
      .from('itens_ordem_servico')
      .select('*')
      .eq('ordem_servico_id', ordem.id)

    // Imprimir diretamente sem modal
    const ordemParaImprimir = { ...ordem, pecas: pecasData || [] }

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const estiloCupom = `
      body { font-family: Arial, sans-serif; padding: 10px; max-width: 80mm; margin: 0 auto; line-height: 1.4; }
      .header { text-align: center; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px; }
      .header h1 { font-size: 14px; margin: 0; color: #1e40af; }
      .section { margin: 10px 0; }
      .section h2 { font-size: 12px; margin-bottom: 5px; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; }
      .info-grid { display: grid; grid-template-columns: 1fr; gap: 5px; margin: 5px 0; }
      .info-item { margin: 3px 0; }
      .info-label { font-weight: bold; color: #374151; font-size: 10px; }
      .info-value { color: #6b7280; font-size: 10px; }
      .terms { font-size: 9px; color: #6b7280; background: #f9fafb; padding: 10px; border-left: 2px solid #dc2626; margin-top: 10px; }
      .terms h3 { font-size: 10px; margin: 0 0 5px 0; color: #dc2626; }
      .terms p { margin: 3px 0; }
      .signature { margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      .signature-box { text-align: center; padding: 10px; border-top: 1px solid #000; font-size: 10px; }
      .footer { text-align: center; margin-top: 15px; font-size: 9px; color: #9ca3af; }
    `

    const dataEntrada = ordemParaImprimir.data_entrada ? new Date(ordemParaImprimir.data_entrada).toLocaleDateString('pt-BR') : 'N/A'
    const dataPrevisao = ordemParaImprimir.data_previsao_entrega ? formatDateString(ordemParaImprimir.data_previsao_entrega) : 'A definir'

    printWindow.document.write(`
      <html>
        <head>
          <title>Ordem de Serviço</title>
          <style>${estiloCupom}</style>
        </head>
        <body>
          <div class="header">
            <h1>ORDEM DE SERVIÇO - ULTRA CELL</h1>
            <p>CNPJ: 40.886.908/0001-69 | WhatsApp: (11)97209-8349</p>
            <p>Endereço: Rua Martim Tenório, 65 - Lapa - São Paulo</p>
          </div>

          <div class="section">
            <h2>DADOS DO CLIENTE</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Nome:</span>
                <span class="info-value">${ordemParaImprimir.cliente?.nome_loja || 'Cliente não informado'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Data de Entrada:</span>
                <span class="info-value">${dataEntrada}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>DADOS DO APARELHO</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Aparelho:</span>
                <span class="info-value">${ordemParaImprimir.aparelho || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Modelo:</span>
                <span class="info-value">${ordemParaImprimir.modelo || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Problema:</span>
                <span class="info-value">${ordemParaImprimir.problema_descricao || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Previsão de Entrega:</span>
                <span class="info-value">${dataPrevisao}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>SERVIÇO E PEÇAS</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Serviço executado:</span>
                <span class="info-value">${ordemParaImprimir.solucao || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Valor do Serviço:</span>
                <span class="info-value">${ordemParaImprimir.valor ? 'R$ ' + ordemParaImprimir.valor.toFixed(2) : 'A definir'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value">${ordemParaImprimir.status}</span>
              </div>
            </div>
            ${ordemParaImprimir.pecas && ordemParaImprimir.pecas.length > 0 ? `
              <div style="margin-top: 20px;">
                <h3 style="font-size: 14px; margin-bottom: 10px; color: #374151;">Peças Utilizadas:</h3>
                ${ordemParaImprimir.pecas.map((peca, i) => `
                  <div style="background: #f9fafb; padding: 10px; margin: 5px 0; border-left: 3px solid #f97316;">
                    <p style="margin: 0; font-weight: bold;">${i + 1}. ${peca.peca_nome}</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Quantidade: ${peca.quantidade}</p>
                    ${peca.preco_venda ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #16a34a; font-weight: bold;">Preço: R$ ${peca.preco_venda.toFixed(2)}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <div class="terms">
            <h3>⚠️ TERMOS DE GARANTIA E ABANDONO</h3>
            <p><strong>GARANTIA:</strong> O serviço possui garantia de 180 (cento e oitenta) dias para telas na qualidade oled, original e baterias e 90 (noventa) dias para outros tipos de serviço a partir da data de entrega, cobrindo defeitos de fabricação e mão de obra. Não cobre danos causados por uso inadequado, queda, contato com líquidos ou tentativas de reparo por terceiros não autorizados.</p>
            <p><strong>ABANDONO (Art. 1.331 do Código Civil):</strong> O equipamento será considerado abandonado se não for retirado no prazo de 30 (trinta) dias após a notificação de conclusão do serviço. Após este período, a empresa reserva-se o direito de cobrar taxa de armazenamento de R$ 5,00 (cinco reais) por dia e, após 60 (sessenta) dias, o equipamento poderá ser descartado ou doado.</p>
            <p><strong>NO CASO DO APARELHO ENTRAR DESLIGADO: </strong>A garantia irá cobrir somente o serviço feito, não responsabilizando a loja por possíveis avarias não testadas na hora do recebimento do aparelho.</p>
          </div>

          <div class="signature">
            <div class="signature-box">
            
            </div>
          </div>

        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const formatDateString = (value?: string | null) => {
    if (!value) return ''
    const [datePart] = value.split('T')
    const [year, month, day] = datePart.split('-')
    return year && month && day ? `${day}/${month}/${year}` : datePart
  }

  const formatLocalTimestamp = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  }

  async function confirmarConclusao() {
    if (!ordemParaConcluir) return

    const updateData: any = {
      status: 'Concluído',
      data_conclusao: formatLocalTimestamp(new Date()),
      metodo_pagamento: metodoPagamento,
    }

    if (metodoPagamento === 'Crédito') {
      updateData.parcelas = parcelas
    }

    const { error } = await supabase
      .from('ordens_servico')
      .update(updateData)
      .eq('id', ordemParaConcluir)

    if (error) {
      alert('Erro ao concluir ordem: ' + error.message)
    } else {
      fetchOrdens()
      setConcluirModalOpen(false)
      setOrdemParaConcluir(null)
    }
  }

  const filteredOrdens = ordens.filter(ordem => {
    const matchesSearch = 
      ordem.aparelho.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.problema_descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.cliente?.nome_loja.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter ? ordem.status === statusFilter : true
    
    return matchesSearch && matchesStatus
  })

  const statusColors = {
    'Pendente': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle, border: 'border-yellow-200' },
    'Em andamento': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Loader2, border: 'border-blue-200' },
    'Aguardando peça': { bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock, border: 'border-orange-200' },
    'Concluído': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, border: 'border-green-200' },
    'Cancelado': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, border: 'border-red-200' },
  }

  const statusCounts = {
    'Pendente': ordens.filter(o => o.status === 'Pendente').length,
    'Em andamento': ordens.filter(o => o.status === 'Em andamento').length,
    'Aguardando peça': ordens.filter(o => o.status === 'Aguardando peça').length,
    'Concluído': ordens.filter(o => o.status === 'Concluído').length,
    'Cancelado': ordens.filter(o => o.status === 'Cancelado').length,
  }

  const valorTotal = ordens.reduce((sum, o) => sum + (o.valor || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-500 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-orange-200 text-sm mb-2">
                <Wrench className="w-4 h-4" />
                <span>Gestão de Ordens de Serviço</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Ordens de Serviço</h1>
              <p className="text-orange-100 mt-2">Gerencie os consertos e reparos</p>
            </div>
            <Link
              href="/ordens-servico/novo"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nova OS
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="px-4 -mt-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-3xl font-bold text-slate-900">{ordens.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-3xl font-bold text-yellow-600">{statusCounts['Pendente']}</p>
              <p className="text-sm text-gray-500">Pendentes</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-3xl font-bold text-blue-600">{statusCounts['Em andamento']}</p>
              <p className="text-sm text-gray-500">Em andamento</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-3xl font-bold text-orange-600">{statusCounts['Aguardando peça']}</p>
              <p className="text-sm text-gray-500">Aguardando</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-3xl font-bold text-green-600">{statusCounts['Concluído']}</p>
              <p className="text-sm text-gray-500">Concluídos</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-3xl font-bold text-purple-600">R$ {valorTotal.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Valor Total</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por aparelho, cliente, problema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-12 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
              >
                <option value="">Todos os status</option>
                <option value="Pendente">Pendente</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Aguardando peça">Aguardando peça</option>
                <option value="Concluído">Concluído</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Orders Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrdens.map((ordem) => {
                const statusStyle = statusColors[ordem.status]
                const StatusIcon = statusStyle.icon
                return (
                  <div key={ordem.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className={`p-4 border-b ${statusStyle.border} bg-gradient-to-r ${statusStyle.bg}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-semibold">{ordem.status}</span>
                        </div>
                        <span className="font-mono text-xs text-gray-600">
                          #{ordem.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Wrench className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 truncate">{ordem.aparelho}</h3>
                          {ordem.modelo && (
                            <p className="text-sm text-gray-500">{ordem.modelo}</p>
                          )}
                        </div>
                      </div>

                      {ordem.cliente && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-slate-900 text-sm">{ordem.cliente.nome_loja}</p>
                          {ordem.cliente.whatsapp && (
                            <p className="text-xs text-gray-500">{ordem.cliente.whatsapp}</p>
                          )}
                        </div>
                      )}

                      <div className="mb-4">
                        <p className="text-sm text-gray-500 line-clamp-2">{ordem.problema_descricao}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(ordem.data_entrada).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {ordem.valor && (
                          <span className="font-bold text-slate-900">R$ {ordem.valor.toFixed(2)}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            // Buscar peças da ordem
                            const { data: pecasData } = await supabase
                              .from('itens_ordem_servico')
                              .select('*')
                              .eq('ordem_servico_id', ordem.id)
                            setSelectedOrdem({ ...ordem, pecas: pecasData || [] })
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Detalhes
                        </button>
                        <button
                          onClick={() => abrirModalImprimir(ordem)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Imprimir"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {ordem.status !== 'Concluído' && (
                          <button
                            onClick={() => abrirModalConcluir(ordem.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Concluir assistência"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          href={`/ordens-servico/${ordem.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteOrdem(ordem.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          {filteredOrdens.length === 0 && !loading && (
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhuma ordem de serviço encontrada</p>
              <Link
                href="/ordens-servico/novo"
                className="inline-flex items-center gap-2 mt-4 text-orange-600 hover:text-orange-700 font-medium"
              >
                Criar primeira OS
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Modal de Detalhes */}
      {selectedOrdem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Detalhes da OS</h2>
                <p className="text-gray-500 text-sm mt-1">#{selectedOrdem.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setSelectedOrdem(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Status */}
                <div className={`p-4 rounded-xl border ${statusColors[selectedOrdem.status].border} ${statusColors[selectedOrdem.status].bg}`}>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const StatusIcon = statusColors[selectedOrdem.status].icon
                      return <StatusIcon className="w-5 h-5" />
                    })()}
                    <span className="font-semibold text-lg">{selectedOrdem.status}</span>
                  </div>
                </div>

                {/* Cliente */}
                {selectedOrdem.cliente && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Cliente</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium">{selectedOrdem.cliente.nome_loja}</p>
                      {selectedOrdem.cliente.whatsapp && (
                        <p className="text-sm text-gray-600">{selectedOrdem.cliente.whatsapp}</p>
                      )}
                      {selectedOrdem.cliente.email && (
                        <p className="text-sm text-gray-600">{selectedOrdem.cliente.email}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Aparelho */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Aparelho</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{selectedOrdem.aparelho}</p>
                    {selectedOrdem.modelo && (
                      <p className="text-sm text-gray-600">Modelo: {selectedOrdem.modelo}</p>
                    )}
                  </div>
                </div>

                {/* Problema */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Problema</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedOrdem.problema_descricao}</p>
                  </div>
                </div>

                {/* Diagnóstico */}
                {selectedOrdem.diagnostico && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Diagnóstico</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{selectedOrdem.diagnostico}</p>
                    </div>
                  </div>
                )}

                {/* Solução */}
                {selectedOrdem.solucao && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Solução</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{selectedOrdem.solucao}</p>
                    </div>
                  </div>
                )}

                {/* Datas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Data de Entrada</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{new Date(selectedOrdem.data_entrada).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  {selectedOrdem.data_previsao_entrega && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Previsão de Entrega</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{formatDateString(selectedOrdem.data_previsao_entrega)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Valor */}
                {selectedOrdem.valor && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Valor do Serviço</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-green-600">R$ {selectedOrdem.valor.toFixed(2)}</p>
                    </div>
                  </div>
                )}

                {/* Peças */}
                {selectedOrdem.pecas && selectedOrdem.pecas.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Peças Utilizadas</h3>
                    <div className="space-y-3">
                      {selectedOrdem.pecas.map((peca, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                          <p className="font-medium">{index + 1}. {peca.peca_nome}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">Origem: {peca.origem_peca}</p>
                            <p className="text-sm text-gray-600">Quantidade: {peca.quantidade}</p>
                            {peca.preco_venda && (
                              <p className="text-sm font-bold text-green-600">Preço Venda: R$ {peca.preco_venda.toFixed(2)}</p>
                            )}
                            {peca.preco_peca && (
                              <p className="text-sm text-gray-600">Preço Custo: R$ {peca.preco_peca.toFixed(2)}</p>
                            )}
                            {peca.fornecedor && (
                              <p className="text-sm text-gray-600">Fornecedor: {peca.fornecedor}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                <Printer className="w-5 h-5" />
                Imprimir
              </button>
              <Link
                href={`/ordens-servico/${selectedOrdem.id}`}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                <Edit className="w-5 h-5" />
                Editar
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Conclusão com Pagamento */}
      {concluirModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-slate-900">Concluir Assistência</h2>
              <p className="text-gray-500 text-sm mt-1">Selecione o método de pagamento</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Método de Pagamento</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodoPagamento('Débito')}
                    className={`px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                      metodoPagamento === 'Débito'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                        : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Débito
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPagamento('Crédito')}
                    className={`px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                      metodoPagamento === 'Crédito'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                        : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Crédito
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPagamento('Pix')}
                    className={`px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                      metodoPagamento === 'Pix'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                        : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Pix
                  </button>
                </div>
              </div>

              {metodoPagamento === 'Crédito' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Quantidade de Parcelas</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={parcelas}
                    onChange={(e) => setParcelas(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setConcluirModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarConclusao}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
