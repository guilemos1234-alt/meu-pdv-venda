'use client'

import { useState, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import { supabase, Produto, ClienteLojista } from '@/lib/supabase'
import { formatPhone, formatCpfCnpj } from '@/lib/utils'
import { Plus, Trash2, Save, ShoppingCart, CreditCard, Store, Package, Search, Receipt, CheckCircle, Tag, Percent, Truck } from 'lucide-react'

interface ItemVenda {
  produto_id: string
  produto_nome: string
  quantidade: number
  preco_unitario: number
}

export default function VendasPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clientes, setClientes] = useState<ClienteLojista[]>([])
  const [itens, setItens] = useState<ItemVenda[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState('')
  const [metodoPagamento, setMetodoPagamento] = useState('Pix')
  const [tipoDesconto, setTipoDesconto] = useState<'valor' | 'percentual'>('valor')
  const [valorDesconto, setValorDesconto] = useState('')
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('')
  const [fornecedores, setFornecedores] = useState<{id: string, nome: string}[]>([])
  const [tipoTransacaoFornecedor, setTipoTransacaoFornecedor] = useState<'deposito' | 'pagamento'>('deposito')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [novoClienteAberto, setNovoClienteAberto] = useState(false)
  const [clienteFormLoading, setClienteFormLoading] = useState(false)
  const [novoClienteData, setNovoClienteData] = useState({
    nome_loja: '',
    telefone: '',
    cpf_cnpj: '',
    endereco: '',
    tipo_cliente: 'Lojista' as 'Lojista' | 'Cliente final',
  })

  useEffect(() => {
    fetchProdutos()
    fetchClientes()
    fetchFornecedores()
  }, [])

  async function fetchProdutos() {
    const { data } = await supabase.from('produtos').select('*').order('nome').not('oculto', 'eq', true)
    setProdutos(data || [])
  }

  async function fetchClientes() {
    const { data } = await supabase.from('clientes_lojistas').select('*').order('nome_loja')
    setClientes(data || [])
  }

  async function fetchFornecedores() {
    const { data } = await supabase.from('fornecedores').select('id, nome').order('nome')
    setFornecedores(data || [])
  }

  function getPreco(produto: Produto, quantidade: number): number {
    // Atacado só aplica com 5+ peças
    if (quantidade >= 5 && produto.preco_atacado) {
      return produto.preco_atacado
    }
    return produto.preco_venda
  }

  function adicionarItem(produto: Produto) {
    const itemExistente = itens.find(item => item.produto_id === produto.id)
    
    if (itemExistente) {
      const novaQuantidade = itemExistente.quantidade + 1
      const novoPreco = getPreco(produto, novaQuantidade)
      setItens(itens.map(item => 
        item.produto_id === produto.id 
          ? { ...item, quantidade: novaQuantidade, preco_unitario: novoPreco }
          : item
      ))
    } else {
      const preco = getPreco(produto, 1) // Começa com varejo (1 peça)
      setItens([...itens, {
        produto_id: produto.id,
        produto_nome: produto.nome,
        quantidade: 1,
        preco_unitario: preco
      }])
    }
  }

  function removerItem(produtoId: string) {
    setItens(itens.filter(item => item.produto_id !== produtoId))
  }

  function atualizarQuantidade(produtoId: string, quantidade: number) {
    if (quantidade <= 0) {
      removerItem(produtoId)
      return
    }
    
    const produto = produtos.find(p => p.id === produtoId)
    if (!produto) return
    
    const novoPreco = getPreco(produto, quantidade)
    
    setItens(itens.map(item => 
      item.produto_id === produtoId 
        ? { ...item, quantidade, preco_unitario: novoPreco }
        : item
    ))
  }

  const valorTotal = itens.reduce((sum, item) => sum + (item.preco_unitario * item.quantidade), 0)
  const itemCount = itens.reduce((sum, item) => sum + item.quantidade, 0)
  
  // Calcular desconto
  const descontoNumero = parseFloat(valorDesconto) || 0
  const valorDescontoCalculado = tipoDesconto === 'percentual' 
    ? (valorTotal * descontoNumero / 100) 
    : descontoNumero
  const valorFinal = Math.max(0, valorTotal - valorDescontoCalculado)

  async function finalizarVenda() {
    if (itens.length === 0) {
      alert('Adicione pelo menos um item à venda')
      return
    }

    // Verificar se há estoque suficiente
    for (const item of itens) {
      const produto = produtos.find(p => p.id === item.produto_id)
      if (!produto || produto.estoque_atual < item.quantidade) {
        alert(`Estoque insuficiente para ${item.produto_nome}. Disponível: ${produto?.estoque_atual || 0}`)
        return
      }
    }

    setLoading(true)

    // Registrar a venda
    const vendaInsert = {
      cliente_lojista_id: clienteSelecionado || null,
      fornecedor_id: metodoPagamento === 'Pix Fornecedor' ? fornecedorSelecionado || null : null,
      metodo_pagamento: metodoPagamento,
      valor_total: valorFinal,
      desconto_tipo: tipoDesconto,
      desconto_valor: valorDescontoCalculado,
      valor_original: valorTotal,
    }
    
    console.log('=== INSERINDO VENDA ===')
    console.log('Dados da venda:', vendaInsert)
    console.log('Tipo desconto:', typeof tipoDesconto, tipoDesconto)
    console.log('Valor desconto:', typeof valorDescontoCalculado, valorDescontoCalculado)

    const { data: vendaData, error: vendaError } = await supabase
      .from('vendas')
      .insert(vendaInsert)
      .select()
      .single()

    if (vendaError || !vendaData) {
      alert('Erro ao registrar venda: ' + (vendaError?.message || 'Erro desconhecido'))
      setLoading(false)
      return
    }

    // Registrar os itens da venda
    const itensParaInserir = itens.map(item => ({
      venda_id: vendaData.id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
    }))

    console.log('=== DEBUG VENDAS ===')
    console.log('Venda inserida - vendaData:', vendaData)
    console.log('Itens para inserir:', itensParaInserir)
    console.log('Quantidade de itens:', itensParaInserir.length)

    // Tentar inserir um por um para ver qual erro
    let itensInseridosComSucesso = 0
    let errosInsercao = []
    
    for (const item of itensParaInserir) {
      console.log('Inserindo item:', item)
      const { data, error } = await supabase
        .from('itens_venda')
        .insert(item)
        .select()
      
      if (error) {
        console.error('Erro ao inserir item:', error)
        console.error('Detalhes do erro:', JSON.stringify(error, null, 2))
        errosInsercao.push(error.message || 'Erro desconhecido')
      } else {
        console.log('Item inserido:', data)
        itensInseridosComSucesso++
      }
    }
    
    console.log('=== RESUMO INSERÇÃO ===')
    console.log('Total de itens:', itensParaInserir.length)
    console.log('Itens inseridos com sucesso:', itensInseridosComSucesso)
    console.log('Erros:', errosInsercao)

    // Atualizar estoque dos produtos
    for (const item of itens) {
      const produto = produtos.find(p => p.id === item.produto_id)
      if (produto) {
        const novoEstoque = produto.estoque_atual - item.quantidade
        const { error: estoqueError } = await supabase
          .from('produtos')
          .update({ estoque_atual: novoEstoque })
          .eq('id', item.produto_id)
        
        if (estoqueError) {
          console.error('Erro ao atualizar estoque:', estoqueError)
        }
      }
    }

    // Recarregar produtos para atualizar estoque na tela
    await fetchProdutos()
    
    // Salvar venda no localStorage para relatórios
    const vendasLocalStorage = JSON.parse(localStorage.getItem('vendas') || '[]')
    const clienteNome = clienteSelecionado ? (clientes.find(c => c.id === clienteSelecionado)?.nome_loja || clienteSelecionado) : null

    const novaVenda = {
      id: vendaData.id,
      total: valorFinal,
      itens: itens.map(item => {
        const produto = produtos.find(p => p.id === item.produto_id)
        return {
          nome: item.produto_nome,
          quantidade: item.quantidade,
          preco: item.preco_unitario,
          custo: produto?.custo || 0
        }
      }),
      data: new Date().toISOString(),
      clienteId: clienteSelecionado || null,
      clienteNome: clienteNome,
      metodoPagamento: metodoPagamento,
      fornecedorId: fornecedorSelecionado || null,
      fornecedorNome: fornecedorSelecionado ? (fornecedores.find(f => f.id === fornecedorSelecionado)?.nome || null) : null
    }
    vendasLocalStorage.push(novaVenda)
    localStorage.setItem('vendas', JSON.stringify(vendasLocalStorage))
    
    // Se for Pix Fornecedor, registrar também a transação financeira
    if (metodoPagamento === 'Pix Fornecedor' && fornecedorSelecionado) {
      const { error: transacaoError } = await supabase.from('transacoes_fornecedor').insert({
        fornecedor_id: fornecedorSelecionado,
        tipo: tipoTransacaoFornecedor,
        valor: valorFinal,
        descricao: `Venda via Pix - ${tipoTransacaoFornecedor === 'deposito' ? 'Crédito' : 'Pagamento'}`,
        data: new Date().toISOString().split('T')[0]
      })
      
      if (transacaoError) {
        console.error('Erro ao registrar transação com fornecedor:', transacaoError)
      }
    }
    
    if (errosInsercao.length > 0) {
      alert(`Venda registrada, mas ${errosInsercao.length} item(s) não foram salvos:\n${errosInsercao.join('\n')}`)
    } else if (itensInseridosComSucesso === 0 && itensParaInserir.length > 0) {
      alert('ERRO: Nenhum item foi salvo! Verifique o console para detalhes.')
    } else {
      alert(`Venda registrada com sucesso! ${itensInseridosComSucesso} item(s) salvo(s).`)
      
      // Perguntar se deseja imprimir
      if (confirm('Deseja imprimir o cupom da venda?')) {
        // Aqui você pode adicionar a lógica de impressão
        // Por enquanto, apenas mostra um alerta
        alert('Funcionalidade de impressão será implementada em breve.')
      }
    }
    setItens([])
    setClienteSelecionado('')
    setFornecedorSelecionado('')
    setValorDesconto('')
    setLoading(false)
  }

  async function cadastrarClienteVenda(e: FormEvent) {
    e.preventDefault()
    if (!novoClienteData.nome_loja.trim()) {
      alert('O nome da loja é obrigatório para cadastrar o cliente.')
      return
    }

    if (!novoClienteData.telefone.trim()) {
      alert('O telefone é obrigatório para cadastrar o cliente.')
      return
    }

    setClienteFormLoading(true)
    const { data, error } = await supabase
      .from('clientes_lojistas')
      .insert({
        nome_loja: novoClienteData.nome_loja,
        whatsapp: novoClienteData.telefone || null,
        cpf_cnpj: novoClienteData.cpf_cnpj || null,
        endereco: novoClienteData.endereco || null,
        tipo_cliente: novoClienteData.tipo_cliente,
      })
      .select()
      .single()

    if (error || !data) {
      alert('Erro ao cadastrar cliente: ' + (error?.message || 'Erro desconhecido'))
      setClienteFormLoading(false)
      return
    }

    await fetchClientes()
    setClienteSelecionado(data.id)
    setNovoClienteData({
      nome_loja: '',
      telefone: '',
      cpf_cnpj: '',
      endereco: '',
      tipo_cliente: 'Lojista',
    })
    setNovoClienteAberto(false)
    setClienteFormLoading(false)
    alert('Cliente cadastrado e adicionado à venda.')
  }

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-900 to-purple-700 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-300 text-sm mb-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Ponto de Venda</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Nova Venda</h1>
              <p className="text-purple-200 mt-2">Registre vendas de forma rápida e eficiente</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-2xl px-6 py-3">
              <Receipt className="w-6 h-6 text-purple-300" />
              <div>
                <p className="text-sm text-purple-200">Total da Venda</p>
                <p className="text-2xl font-bold">R$ {valorTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Produtos */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Selecionar Produtos</h2>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                {filteredProdutos.map((produto) => (
                  <div key={produto.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{produto.nome}</p>
                        <p className="text-sm text-gray-500">Estoque: {produto.estoque_atual}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          R$ {produto.preco_venda.toFixed(2)}
                        </p>
                        {produto.preco_atacado && (
                          <p className="text-xs text-green-600">
                            Atacado (5+): R$ {produto.preco_atacado.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => adicionarItem(produto)}
                        className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredProdutos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum produto encontrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Carrinho */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Carrinho</h2>
                    <p className="text-sm text-gray-500">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {itens.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500">Carrinho vazio</p>
                    <p className="text-sm text-gray-400 mt-1">Adicione produtos para começar</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    {itens.map((item) => (
                      <div key={item.produto_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{item.produto_nome}</p>
                          <p className="text-sm text-gray-500">
                            R$ {item.preco_unitario.toFixed(2)} x {item.quantidade}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-white rounded-lg shadow-sm">
                            <button
                              onClick={() => atualizarQuantidade(item.produto_id, item.quantidade - 1)}
                              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                            >
                              -
                            </button>
                            <span className="px-3 py-2 font-semibold text-slate-900 min-w-[3rem] text-center">
                              {item.quantidade}
                            </span>
                            <button
                              onClick={() => atualizarQuantidade(item.produto_id, item.quantidade + 1)}
                              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removerItem(item.produto_id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {itens.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-slate-700">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4" />
                            Cliente (opcional)
                          </div>
                        </label>
                        <button
                          type="button"
                          onClick={() => setNovoClienteAberto((prev) => !prev)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 hover:text-purple-900"
                        >
                          <Plus className="w-4 h-4" />
                          Novo cliente
                        </button>
                      </div>
                      <select
                        value={clienteSelecionado}
                        onChange={(e) => setClienteSelecionado(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Venda avulsa</option>
                        {clientes.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>{cliente.nome_loja} {cliente.cpf_cnpj ? `- ${formatCpfCnpj(cliente.cpf_cnpj)}` : ''}</option>
                        ))}
                      </select>

                      {clienteSelecionado && (
                        <div className="mt-2 text-sm text-gray-600">
                          {clientes.find(c => c.id === clienteSelecionado)?.whatsapp && (
                            <p>WhatsApp: {formatPhone(clientes.find(c => c.id === clienteSelecionado)!.whatsapp!)}</p>
                          )}
                          {clientes.find(c => c.id === clienteSelecionado)?.cpf_cnpj && (
                            <p>CPF/CNPJ: {formatCpfCnpj(clientes.find(c => c.id === clienteSelecionado)!.cpf_cnpj!)}</p>
                          )}
                        </div>
                      )}

                      {novoClienteAberto && (
                        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                          <h3 className="text-sm font-semibold text-slate-900 mb-3">Cadastrar cliente direto na venda</h3>
                          <form onSubmit={cadastrarClienteVenda} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Loja *</label>
                              <input
                                type="text"
                                required
                                value={novoClienteData.nome_loja}
                                onChange={(e) => setNovoClienteData({ ...novoClienteData, nome_loja: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone *</label>
                              <div className="relative">
                                <input
                                  type="tel"
                                  placeholder="(11) 99999-9999"
                                  maxLength={14}
                                  value={novoClienteData.telefone}
                                  onChange={(e) => setNovoClienteData({ ...novoClienteData, telefone: formatPhone(e.target.value) })}
                                  className="w-full pl-3 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                              <input
                                type="text"
                                placeholder="Rua, número, bairro, cidade"
                                value={novoClienteData.endereco}
                                onChange={(e) => setNovoClienteData({ ...novoClienteData, endereco: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Cliente *</label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setNovoClienteData({ ...novoClienteData, tipo_cliente: 'Lojista' })}
                                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                                    novoClienteData.tipo_cliente === 'Lojista'
                                      ? 'bg-green-600 text-white shadow-md'
                                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                  }`}
                                >
                                  Lojista
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNovoClienteData({ ...novoClienteData, tipo_cliente: 'Cliente final' })}
                                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                                    novoClienteData.tipo_cliente === 'Cliente final'
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                  }`}
                                >
                                  Cliente Final
                                </button>
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={clienteFormLoading}
                              className="w-full inline-flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition-all disabled:opacity-50"
                            >
                              <Save className="w-4 h-4" />
                              {clienteFormLoading ? 'Salvando...' : 'Salvar cliente'}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Forma de Pagamento *
                        </div>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Pix Fornecedor'].map((metodo) => (
                          <button
                            key={metodo}
                            onClick={() => setMetodoPagamento(metodo)}
                            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                              metodoPagamento === metodo
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {metodo === 'Cartão de Crédito' ? 'Crédito' : metodo === 'Cartão de Débito' ? 'Débito' : metodo === 'Pix Fornecedor' ? 'Pix Fornecedor' : metodo}
                          </button>
                        ))}
                      </div>
                      
                      {/* Lista de fornecedores quando Pix Fornecedor é selecionado */}
                      {metodoPagamento === 'Pix Fornecedor' && (
                        <div className="mt-3 space-y-3">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4" />
                              Fornecedor *
                            </div>
                          </label>
                          <select
                            value={fornecedorSelecionado}
                            onChange={(e) => setFornecedorSelecionado(e.target.value)}
                            required={metodoPagamento === 'Pix Fornecedor'}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Selecione o fornecedor</option>
                            {fornecedores.map((fornecedor) => (
                              <option key={fornecedor.id} value={fornecedor.id}>{fornecedor.nome}</option>
                            ))}
                          </select>

                          {/* Tipo de transação com fornecedor */}
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2">Tipo de operação</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setTipoTransacaoFornecedor('deposito')}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  tipoTransacaoFornecedor === 'deposito'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                Crédito (Depósito)
                              </button>
                              <button
                                type="button"
                                onClick={() => setTipoTransacaoFornecedor('pagamento')}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  tipoTransacaoFornecedor === 'pagamento'
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                Pagar Dívida
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {tipoTransacaoFornecedor === 'deposito' 
                                ? 'Valor será adicionado como crédito com o fornecedor' 
                                : 'Valor será abatido da dívida com o fornecedor'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      {/* Desconto */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Desconto
                          </div>
                        </label>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <button
                            onClick={() => setTipoDesconto('valor')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              tipoDesconto === 'valor'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            R$
                          </button>
                          <button
                            onClick={() => setTipoDesconto('percentual')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              tipoDesconto === 'percentual'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <Percent className="w-4 h-4 inline" />
                          </button>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                            {tipoDesconto === 'valor' ? 'R$' : '%'}
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            value={valorDesconto}
                            onChange={(e) => setValorDesconto(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        {valorDescontoCalculado > 0 && (
                          <p className="text-sm text-green-600 mt-1">
                            Economia: R$ {valorDescontoCalculado.toFixed(2)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-semibold text-slate-900">R$ {valorTotal.toFixed(2)}</span>
                      </div>
                      {valorDescontoCalculado > 0 && (
                        <div className="flex items-center justify-between mb-2 text-green-600">
                          <span className="text-sm">Desconto</span>
                          <span className="font-semibold">- R$ {valorDescontoCalculado.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-6 pt-2 border-t border-gray-100">
                        <span className="text-lg font-bold text-slate-900">Total</span>
                        <span className="text-3xl font-bold text-purple-600">R$ {valorFinal.toFixed(2)}</span>
                      </div>

                      <button
                        onClick={finalizarVenda}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg disabled:opacity-50"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {loading ? 'Processando...' : 'Finalizar Venda'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
