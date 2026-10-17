'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, ClienteLojista, Produto, ItemOrdemServico } from '@/lib/supabase'
import { formatPhone, formatCpfCnpj } from '@/lib/utils'
import { ArrowLeft, Save, Wrench, User, Calendar, DollarSign, FileText, AlertCircle, CheckCircle, Loader2, Clock, XCircle, Store, Phone, Mail, MapPin, UserCircle, Plus, Package, Printer } from 'lucide-react'

export default function EditarOrdemServicoPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [clientes, setClientes] = useState<ClienteLojista[]>([])
  const [novoClienteAberto, setNovoClienteAberto] = useState(false)
  const [clienteFormLoading, setClienteFormLoading] = useState(false)
  const [novoClienteData, setNovoClienteData] = useState({
    nome_loja: '',
    telefone: '',
    cpf_cnpj: '',
    endereco: '',
    tipo_cliente: 'Lojista' as 'Lojista' | 'Cliente final',
  })
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [formData, setFormData] = useState({
    cliente_id: '',
    aparelho: '',
    modelo: '',
    problema_descricao: '',
    diagnostico: '',
    solucao: '',
    valor: '',
    status: 'Pendente' as 'Pendente' | 'Em andamento' | 'Aguardando peça' | 'Concluído' | 'Cancelado',
    data_previsao_entrega: '',
    data_conclusao: '',
  })
  const [pecas, setPecas] = useState<ItemOrdemServico[]>([])
  const [companyInfo, setCompanyInfo] = useState({
    nome_empresa: '',
    endereco: '',
    telefone: '',
  })

  useEffect(() => {
    fetchClientes()
    fetchProdutos()
    fetchOrdem()
    fetchPecas()
    fetchCompanyInfo()
  }, [])

  async function fetchClientes() {
    const { data, error } = await supabase
      .from('clientes_lojistas')
      .select('*')
      .order('nome_loja')

    if (error) {
      console.error('Erro ao buscar clientes:', error)
    } else {
      setClientes(data || [])
    }
  }

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
  }

  async function fetchCompanyInfo() {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .limit(1)

      if (error) {
        // Se a tabela não existir ou RLS bloquear, apenas ignora
        console.debug('Aviso ao buscar configurações:', error.message)
        return
      }

      if (data && data.length > 0) {
        setCompanyInfo({
          nome_empresa: data[0].nome_empresa || '',
          endereco: data[0].endereco || '',
          telefone: data[0].telefone || '',
        })
      }
    } catch (err) {
      console.debug('Aviso ao buscar informações da empresa:', err)
      // Não quebra a aplicação se a tabela não existir
    }
  }

  function parseLocalDate(value?: string | null): Date | null {
    if (!value) return null

    const localIsoMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\.\d+)?)?$/.exec(value)
    if (localIsoMatch) {
      const [, year, month, day, hour, minute, second] = localIsoMatch
      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second || '0')
      )
    }

    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  async function fetchOrdem() {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      alert('Erro ao buscar ordem de serviço: ' + error.message)
      router.push('/ordens-servico')
    } else if (data) {
      setFormData({
        cliente_id: data.cliente_id || '',
        aparelho: data.aparelho || '',
        modelo: data.modelo || '',
        problema_descricao: data.problema_descricao || '',
        diagnostico: data.diagnostico || '',
        solucao: data.solucao || '',
        valor: data.valor?.toString() || '',
        status: data.status || 'Pendente',
        data_previsao_entrega: data.data_previsao_entrega ? data.data_previsao_entrega.split('T')[0] : '',
        data_conclusao: data.data_conclusao || '',
      })
    }
    setFetching(false)
  }

  async function fetchPecas() {
    const { data, error } = await supabase
      .from('itens_ordem_servico')
      .select('*')
      .eq('ordem_servico_id', params.id)

    if (error) {
      console.error('Erro ao buscar peças:', error)
    } else {
      setPecas(data || [])
    }
  }

  async function cadastrarClienteOSEdit() {
    if (!novoClienteData.nome_loja.trim()) {
      alert('O nome da loja é obrigatório para cadastrar o cliente.')
      return
    }

    setClienteFormLoading(true)
    const payload: any = {
      nome_loja: novoClienteData.nome_loja,
      whatsapp: novoClienteData.telefone || null,
      cpf_cnpj: novoClienteData.cpf_cnpj || null,
      endereco: novoClienteData.endereco || null,
      tipo_cliente: novoClienteData.tipo_cliente,
    }

    const { data, error } = await supabase
      .from('clientes_lojistas')
      .insert(payload)
      .select()
      .single()

    if (error || !data) {
      alert('Erro ao cadastrar cliente: ' + (error?.message || 'Erro desconhecido'))
      setClienteFormLoading(false)
      return
    }

    await fetchClientes()
    setFormData(prev => ({ ...prev, cliente_id: data.id }))
    setNovoClienteData({
      nome_loja: '',
      telefone: '',
      cpf_cnpj: '',
      endereco: '',
      tipo_cliente: 'Lojista',
    })
    setNovoClienteAberto(false)
    setClienteFormLoading(false)
    alert('Cliente cadastrado e selecionado na ordem de serviço.')
  }

  function adicionarPeca() {
    setPecas([...pecas, {
      id: '',
      ordem_servico_id: params.id as string,
      origem_peca: 'PDV',
      peca_id: '',
      peca_nome: '',
      fornecedor: '',
      preco_peca: null,
      preco_venda: null,
      quantidade: 1,
      created_at: new Date().toISOString()
    }])
  }

  function removerPeca(index: number) {
    setPecas(pecas.filter((_, i) => i !== index))
  }

  function atualizarPeca(index: number, campo: keyof ItemOrdemServico, valor: any) {
    const novasPecas = [...pecas]
    novasPecas[index] = { ...novasPecas[index], [campo]: valor }
    setPecas(novasPecas)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const updateData: any = {
      cliente_id: formData.cliente_id || null,
      aparelho: formData.aparelho,
      modelo: formData.modelo || null,
      problema_descricao: formData.problema_descricao,
      diagnostico: formData.diagnostico || null,
      solucao: formData.solucao || null,
      valor: formData.valor ? parseFloat(formData.valor) : null,
      status: formData.status,
      data_previsao_entrega: formData.data_previsao_entrega || null,
    }

    // Se status for Concluído, adiciona data de conclusão e dá baixa no estoque
    if (formData.status === 'Concluído') {
      updateData.data_conclusao = new Date().toISOString()
      
      // Dar baixa no estoque para peças do PDV
      for (const peca of pecas) {
        if (peca.origem_peca === 'PDV' && peca.peca_id) {
          const produto = produtos.find(p => p.id === peca.peca_id)
          if (produto && produto.estoque_atual > 0) {
            const novoEstoque = produto.estoque_atual - peca.quantidade
            if (novoEstoque >= 0) {
              const { error: stockError } = await supabase
                .from('produtos')
                .update({ estoque_atual: novoEstoque })
                .eq('id', peca.peca_id)
              
              if (stockError) {
                console.error('Erro ao dar baixa no estoque:', stockError)
              } else {
                await fetchProdutos()
              }
            }
          }
        }
      }
    }

    const { error } = await supabase
      .from('ordens_servico')
      .update(updateData)
      .eq('id', params.id)

    if (error) {
      alert('Erro ao atualizar ordem de serviço: ' + error.message)
      setLoading(false)
      return
    }

    // Atualizar as peças
    // Primeiro, deletar todas as peças existentes
    await supabase.from('itens_ordem_servico').delete().eq('ordem_servico_id', params.id)

    // Depois, inserir as peças atualizadas (apenas se tiverem nome preenchido)
    const pecasValidas = pecas.filter(peca => peca.peca_nome.trim() !== '')
    if (pecasValidas.length > 0) {
      const pecasPayload = pecasValidas.map(peca => ({
        ordem_servico_id: params.id,
        origem_peca: peca.origem_peca,
        peca_id: peca.peca_id || null,
        peca_nome: peca.peca_nome,
        fornecedor: peca.fornecedor || null,
        preco_peca: peca.preco_peca || null,
        preco_venda: peca.preco_venda || null,
        quantidade: peca.quantidade,
      }))

      const { error: pecasError } = await supabase.from('itens_ordem_servico').insert(pecasPayload)
      
      if (pecasError) {
        alert('Erro ao salvar peças: ' + pecasError.message)
        console.error('Erro ao salvar peças:', pecasError)
      }
    }

    router.push('/ordens-servico')
    setLoading(false)
  }

  const statusOptions = [
    { value: 'Pendente', label: 'Pendente', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'Em andamento', label: 'Em andamento', icon: Loader2, color: 'bg-blue-100 text-blue-700' },
    { value: 'Aguardando peça', label: 'Aguardando peça', icon: Clock, color: 'bg-orange-100 text-orange-700' },
    { value: 'Concluído', label: 'Concluído', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { value: 'Cancelado', label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-700' },
  ]

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-500 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/ordens-servico" 
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar para Ordens</span>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Editar Ordem de Serviço</h1>
                <p className="text-orange-100 mt-1">Atualize as informações da OS</p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all"
            >
              <Printer className="w-5 h-5" />
              Imprimir
            </button>
          </div>
        </div>
      </section>

      {/* Company Information - Visible on Print */}
      {companyInfo?.nome_empresa && (
        <section className="bg-white border-b-2 border-orange-200 hidden print:block py-6 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl font-bold">{companyInfo.nome_empresa}</h2>
            {companyInfo.endereco && <p className="text-sm">Endereço: {companyInfo.endereco}</p>}
            {companyInfo.telefone && <p className="text-sm">Telefone: {companyInfo.telefone}</p>}
          </div>
        </section>
      )}

      {/* Form */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cliente e Aparelho */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Cliente e Aparelho</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Cliente
                    </label>
                    <button
                      type="button"
                      onClick={() => setNovoClienteAberto(prev => !prev)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-800"
                    >
                      <Plus className="w-4 h-4" />
                      Novo cliente
                    </button>
                  </div>
                  <select
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Selecione um cliente (opcional)</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome_loja} {cliente.cpf_cnpj ? `- ${formatCpfCnpj(cliente.cpf_cnpj)}` : ''}
                      </option>
                    ))}
                  </select>

                  {formData.cliente_id && (
                    <div className="mt-2 text-sm text-gray-600">
                      {clientes.find(c => c.id === formData.cliente_id)?.whatsapp && (
                        <p>WhatsApp: {formatPhone(clientes.find(c => c.id === formData.cliente_id)!.whatsapp!)}</p>
                      )}
                      {clientes.find(c => c.id === formData.cliente_id)?.cpf_cnpj && (
                        <p>CPF/CNPJ: {formatCpfCnpj(clientes.find(c => c.id === formData.cliente_id)!.cpf_cnpj!)}</p>
                      )}
                    </div>
                  )}

                  {novoClienteAberto && (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                      <h3 className="text-sm font-semibold text-slate-900 mb-4">Cadastrar cliente direto na ordem de serviço</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                          <input
                            type="text"
                            value={novoClienteData.nome_loja}
                            onChange={(e) => setNovoClienteData({ ...novoClienteData, nome_loja: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                              type="tel"
                              placeholder="(11) 99999-9999"
                              maxLength={14}
                              value={novoClienteData.telefone}
                              onChange={(e) => setNovoClienteData({ ...novoClienteData, telefone: formatPhone(e.target.value) })}
                              className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">CPF/CNPJ</label>
                          <input
                            type="text"
                            placeholder="000.000.000-00 ou 00.000.000/0000-00"
                            maxLength={18}
                            value={novoClienteData.cpf_cnpj}
                            onChange={(e) => setNovoClienteData({ ...novoClienteData, cpf_cnpj: formatCpfCnpj(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Rua, número, bairro, cidade"
                              value={novoClienteData.endereco}
                              onChange={(e) => setNovoClienteData({ ...novoClienteData, endereco: e.target.value })}
                              className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Cliente *</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setNovoClienteData({ ...novoClienteData, tipo_cliente: 'Lojista' })}
                              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                                novoClienteData.tipo_cliente === 'Lojista'
                                  ? 'bg-green-600 text-white shadow-md'
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                              }`}
                            >
                              <Store className="w-4 h-4" />
                              Lojista
                            </button>
                            <button
                              type="button"
                              onClick={() => setNovoClienteData({ ...novoClienteData, tipo_cliente: 'Cliente final' })}
                              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                                novoClienteData.tipo_cliente === 'Cliente final'
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                              }`}
                            >
                              <UserCircle className="w-4 h-4" />
                              Cliente Final
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => cadastrarClienteOSEdit()}
                          disabled={clienteFormLoading}
                          className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {clienteFormLoading ? 'Salvando...' : 'Salvar cliente'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Aparelho *
                    </label>
                    <select
                      required
                      value={formData.aparelho}
                      onChange={(e) => setFormData({ ...formData, aparelho: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Selecione...</option>
                      <option value="Computador">Computador</option>
                      <option value="Celular">Celular</option>
                      <option value="Notebook">Notebook</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Modelo
                    </label>
                    <input
                      type="text"
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Problema e Diagnóstico */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Problema e Diagnóstico</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Descrição do Problema *
                  </label>
                  <textarea
                    required
                    value={formData.problema_descricao}
                    onChange={(e) => setFormData({ ...formData, problema_descricao: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Diagnóstico Técnico
                  </label>
                  <textarea
                    value={formData.diagnostico}
                    onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Solução / Serviço Realizado
                  </label>
                  <textarea
                    value={formData.solucao}
                    onChange={(e) => setFormData({ ...formData, solucao: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Status e Valor */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Status e Valor</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {statusOptions.map((option) => {
                      const StatusIcon = option.icon
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, status: option.value as any })}
                          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-medium transition-all text-sm ${
                            formData.status === option.value
                              ? `${option.color} shadow-md`
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Valor do Serviço
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.valor}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Previsão de Entrega
                      </div>
                    </label>
                    <input
                      type="date"
                      value={formData.data_previsao_entrega}
                      onChange={(e) => setFormData({ ...formData, data_previsao_entrega: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {formData.data_conclusao && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Data de Conclusão
                    </label>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-green-700 font-medium">
                        {parseLocalDate(formData.data_conclusao)?.toLocaleDateString('pt-BR')} às {parseLocalDate(formData.data_conclusao)?.toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Peças */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <label className="block text-sm font-semibold text-slate-700">
                      Peças Utilizadas
                    </label>
                    <button
                      type="button"
                      onClick={adicionarPeca}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-800"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Peça
                    </button>
                  </div>

                  {pecas.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">Nenhuma peça adicionada</p>
                  ) : (
                    <div className="space-y-4">
                      {pecas.map((peca, index) => (
                        <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-slate-700">Peça #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removerPeca(index)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remover
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Origem da Peça
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => atualizarPeca(index, 'origem_peca', 'PDV')}
                                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                                    peca.origem_peca === 'PDV'
                                      ? 'bg-orange-600 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  <Store className="w-3 h-3" />
                                  PDV
                                </button>
                                <button
                                  type="button"
                                  onClick={() => atualizarPeca(index, 'origem_peca', 'Loja externa')}
                                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                                    peca.origem_peca === 'Loja externa'
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  <Package className="w-3 h-3" />
                                  Loja Externa
                                </button>
                              </div>
                            </div>

                            {peca.origem_peca === 'PDV' ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Peça do Estoque
                                  </label>
                                  <select
                                    value={peca.peca_id || ''}
                                    onChange={(e) => {
                                      const selectedId = e.target.value
                                      const produto = produtos.find(p => p.id === selectedId)
                                      const novasPecas = [...pecas]
                                      novasPecas[index] = { 
                                        ...novasPecas[index], 
                                        peca_id: selectedId,
                                        peca_nome: produto?.nome || '',
                                        preco_peca: produto?.custo || null,
                                        preco_venda: produto?.preco_venda || null
                                      }
                                      setPecas(novasPecas)
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  >
                                    <option value="">Selecione uma peça</option>
                                    {produtos.map((produto) => (
                                      <option key={produto.id} value={produto.id}>
                                        {produto.nome} {produto.preco_venda ? `- Venda: R$ ${produto.preco_venda.toFixed(2)}` : ''} {produto.custo ? `(Custo: R$ ${produto.custo.toFixed(2)})` : ''} (Estoque: {produto.estoque_atual || 0})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Preço Venda (pode alterar)
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">R$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      placeholder="0,00"
                                      value={peca.preco_venda || ''}
                                      onChange={(e) => atualizarPeca(index, 'preco_venda', parseFloat(e.target.value) || null)}
                                      className="w-full pl-10 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Fornecedor
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Nome do fornecedor..."
                                    value={peca.fornecedor || ''}
                                    onChange={(e) => atualizarPeca(index, 'fornecedor', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nome da Peça
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Ex: Tela iPhone 11..."
                                    value={peca.peca_nome}
                                    onChange={(e) => atualizarPeca(index, 'peca_nome', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                      Preço Custo
                                    </label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">R$</span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={peca.preco_peca || ''}
                                        onChange={(e) => atualizarPeca(index, 'preco_peca', parseFloat(e.target.value) || null)}
                                        className="w-full pl-10 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                      Preço Venda
                                    </label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">R$</span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={peca.preco_venda || ''}
                                        onChange={(e) => atualizarPeca(index, 'preco_venda', parseFloat(e.target.value) || null)}
                                        className="w-full pl-10 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Quantidade
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={peca.quantidade}
                                onChange={(e) => atualizarPeca(index, 'quantidade', parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/ordens-servico"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
