'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DollarSign, ShoppingCart, Package, TrendingUp, BarChart3, Wrench, Printer, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Relatorios() {
  const [stats, setStats] = useState({
    totalVendas: 0,
    totalValor: 0,
    itensVendidos: 0,
    ticketMedio: 0
  })

  const [assistenciasStats, setAssistenciasStats] = useState({
    totalValorAssistencias: 0,
    assistenciasConcluidas: 0
  })

  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState<{ nome: string, vendas: number }[]>([])
  const [listaVendas, setListaVendas] = useState<any[]>([])
  const [listaAssistencias, setListaAssistencias] = useState<any[]>([])
  const [imprimirModalOpen, setImprimirModalOpen] = useState(false)
  const [vendaParaImprimir, setVendaParaImprimir] = useState<any>(null)

  function abrirModalImprimir(venda: any) {
    setVendaParaImprimir(venda)
    setImprimirModalOpen(true)
  }

  function imprimirVenda(formato: 'A4' | 'Cupom80mm') {
    if (!vendaParaImprimir) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const produtos = vendaParaImprimir.itens.map((item: any) => 
      `<div style="display: flex; justify-content: space-between; margin: 5px 0;">
        <span>${item.nome || item.produto} x${item.quantidade}</span>
        <span>R$ ${((item.preco || item.valor || 0) * item.quantidade).toFixed(2)}</span>
      </div>`
    ).join('')

    const estiloA4 = `
      body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px; }
      .header h2 { font-size: 24px; margin: 0; }
      .info { margin-bottom: 15px; font-size: 14px; }
      .info p { margin: 5px 0; }
      .produtos { margin: 20px 0; }
      .produtos h3 { font-size: 18px; margin-bottom: 10px; }
      .total { font-weight: bold; font-size: 24px; margin-top: 30px; border-top: 2px solid #000; padding-top: 15px; text-align: right; }
      .footer { text-align: center; margin-top: 40px; font-size: 14px; }
    `

    const estiloCupom = `
      body { font-family: Arial, sans-serif; padding: 10px; max-width: 80mm; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px; }
      .header h2 { font-size: 14px; margin: 0; }
      .info { margin-bottom: 5px; font-size: 10px; }
      .info p { margin: 2px 0; }
      .produtos { margin: 10px 0; }
      .produtos h3 { font-size: 12px; margin-bottom: 5px; }
      .total { font-weight: bold; font-size: 14px; margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; text-align: right; }
      .footer { text-align: center; margin-top: 10px; font-size: 10px; }
    `

    printWindow.document.write(`
      <html>
        <head>
          <title>Recibo de Venda</title>
          <style>${formato === 'A4' ? estiloA4 : estiloCupom}</style>
        </head>
        <body>
          <div class="header">
            <h2>RECIBO DE VENDA</h2>
            <div class="info">
              <p><strong>CNPJ:</strong> 40.886.747/0001-80</p>
              <p><strong>WhatsApp:</strong> (11)97209-8349</p>
              <p><strong>Endereço:</strong> Rua Martim Tenório, 65 - Lapa</p>
              <p>São Paulo</p>
            </div>
          </div>
          <div class="info">
            <p><strong>Data:</strong> ${vendaParaImprimir.data.toLocaleDateString('pt-BR')} ${vendaParaImprimir.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Cliente:</strong> ${vendaParaImprimir.cliente}</p>
            <p><strong>Pagamento:</strong> ${vendaParaImprimir.pagamento}</p>
          </div>
          <div class="info">
            <h3>Produtos:</h3>
            ${produtos}
          </div>
          <div class="total">
            <p>TOTAL: R$ ${vendaParaImprimir.total.toFixed(2)}</p>
          </div>
          <div class="footer">
            <p>Obrigado pela preferência!</p>
          </div>
            <div class="info">
              <h3>_________________________________________</h3>
              <h4>Condições Gerais: É obrigatória a apresentação do produto na embalagem original com todos os acessórios.</h4>
              <h4>O produto e os selos de garantia não podem apresentar sinais de violação ou rasuras.</h4>
              <h4>Garantia de fones da marca Kaidi: 1 ano.</h4>
              <h4>Garantia de carregadores da marca Kaidi e Peining: 6 meses.</h4>
              <h4>Garantia de peças: 3 meses.</h4>
              <h4>Garantia de demais produtos: 3 meses.</h4>
              <h4>A garantia não será válida se o produto for danificado por uso inadequado, água, impacto, ou se houver tentativa de reparo por terceiros.</h4>
              <h2>Telas que apresentarem riscos, quebras, flex rasgado ou não estiverem livres de colas ou silicones não serão substituídas.</h2>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    setImprimirModalOpen(false)
    setVendaParaImprimir(null)
  }

  async function cancelarVenda(vendaId: number) {
    if (!confirm('Tem certeza que deseja cancelar esta venda?')) return

    // Deletar venda do Supabase
    const { error } = await supabase.from('vendas').delete().eq('id', vendaId)

    if (error) {
      alert('Erro ao cancelar venda: ' + error.message)
      return
    }

    // Recarregar os dados
    window.location.reload()
  }

  useEffect(() => {
    async function load() {
      // buscar clientes para mapear ids -> nomes
      let clientesMap: Record<string, string> = {}
      try {
        const response = await supabase.from('clientes_lojistas').select('id, nome_loja')
        const clientesData = response.data
        if (clientesData) {
          clientesData.forEach((c: any) => {
            clientesMap[c.id] = c.nome_loja
          })
        }
      } catch (e) {
        // falha ao buscar não impede uso de localStorage
      }

      // Buscar fornecedores para mapear ids -> nomes
      let fornecedoresMap: Record<string, string> = {}
      try {
        const response = await supabase.from('fornecedores').select('id, nome')
        const fornecedoresData = response.data
        if (fornecedoresData) {
          fornecedoresData.forEach((f: any) => {
            fornecedoresMap[f.id] = f.nome
          })
        }
      } catch (e) {
        // falha ao buscar não impede funcionamento
      }

      // Buscar produtos para mapear ids -> nomes
      let produtosMap: Record<string, string> = {}
      try {
        const response = await supabase.from('produtos').select('id, nome')
        const produtosData = response.data
        if (produtosData) {
          produtosData.forEach((p: any) => {
            produtosMap[p.id] = p.nome
          })
        }
      } catch (e) {
        // falha ao buscar não impede funcionamento
      }

      // Buscar vendas do Supabase
      const { data: vendas, error: vendasError } = await supabase
        .from('vendas')
        .select('*')
        .order('created_at', { ascending: false })

      let totalVendas = 0
      let totalValor = 0
      let itensVendidos = 0
      const produtosCount: any = {}
      const vendasDetalhadas: any[] = []

      if (!vendasError && vendas) {
        totalVendas = vendas.length

        // Para cada venda, buscar seus itens
        for (const venda of vendas) {
          const { data: itensVenda, error: itensError } = await supabase
            .from('itens_venda')
            .select('*')
            .eq('venda_id', venda.id)

          if (!itensError && itensVenda) {
            const itensComNomes = itensVenda.map((item: any) => ({
              ...item,
              nome: produtosMap[item.produto_id] || 'Produto não encontrado'
            }))

            totalValor += venda.valor_total || 0
            itensVendidos += itensVenda.length

            // Calcular produtos mais vendidos
            itensVenda.forEach((item: any) => {
              const nome = produtosMap[item.produto_id] || 'Produto não encontrado'
              produtosCount[nome] = (produtosCount[nome] || 0) + item.quantidade
            })

            // Montar lista de vendas realizadas
            const clienteNome = clientesMap[venda.cliente_lojista_id] || 'Cliente não informado'
            const fornecedorNome = fornecedoresMap[venda.fornecedor_id] || null

            vendasDetalhadas.push({
              id: venda.id,
              data: new Date(venda.created_at),
              cliente: clienteNome,
              pagamento: venda.metodo_pagamento || 'N/A',
              fornecedorNome: fornecedorNome,
              itens: itensComNomes,
              total: venda.valor_total || 0
            })
          }
        }
      }

      const ticketMedio = totalVendas > 0 ? totalValor / totalVendas : 0

      setStats({
        totalVendas,
        totalValor,
        itensVendidos,
        ticketMedio
      })

      // Calcular produtos mais vendidos
      const produtosOrdenados = Object.entries(produtosCount)
        .map(([nome, vendas]) => ({ nome, vendas: vendas as number }))
        .sort((a, b) => b.vendas - a.vendas)
        .slice(0, 3)

      setProdutosMaisVendidos(produtosOrdenados)

      // Ordenar vendas por data (mais recentes primeiro)
      vendasDetalhadas.sort((a: any, b: any) => b.data.getTime() - a.data.getTime())
      setListaVendas(vendasDetalhadas.slice(0, 5))

      // Buscar assistências realizadas (ordens de serviço concluídas)
      const { data: assistencias, error: assistenciasError } = await supabase
        .from('ordens_servico')
        .select('*')
        .in('status', ['Concluído', 'Concluída'])
        .order('created_at', { ascending: false })

      if (!assistenciasError && assistencias) {
        const assistenciasDetalhadas = assistencias.map((assistencia: any) => ({
          id: assistencia.id,
          data: new Date(assistencia.created_at),
          cliente: clientesMap[assistencia.cliente_id] || 'Cliente não informado',
          aparelho: assistencia.aparelho || 'N/A',
          modelo: assistencia.modelo || 'N/A',
          problema: assistencia.problema || 'N/A',
          valor: assistencia.valor || 0,
          metodo_pagamento: assistencia.metodo_pagamento || 'N/A',
          parcelas: assistencia.parcelas || null
        }))
        
        setListaAssistencias(assistenciasDetalhadas.slice(0, 5))

        const totalAssistencias = assistencias.length
        const totalValorAssistencias = assistencias.reduce((acc: number, os: any) => acc + (os.valor || 0), 0)
        const assistenciasConcluidas = assistencias.filter((os: any) => os.status === 'Concluído' || os.status === 'Concluída').length

        setAssistenciasStats({
          totalValorAssistencias,
          assistenciasConcluidas
        })
      }
    }

    load()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
          <p className="text-gray-600">Acompanhe as métricas do seu negócio</p>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Total em Vendas</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              R$ {stats.totalValor.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total de Vendas</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalVendas}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Assistências Concluídas</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {assistenciasStats.assistenciasConcluidas}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Ticket Médio</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              R$ {stats.ticketMedio.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Produtos Mais Vendidos */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Produtos Mais Vendidos</h2>
          {produtosMaisVendidos.length > 0 ? (
            <div className="space-y-3">
              {produtosMaisVendidos.map((produto, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{produto.nome}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{produto.vendas}</p>
                    <p className="text-sm text-gray-500">vendidos</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum produto vendido ainda</p>
          )}
        </div>

        {/* Lista de Vendas Realizadas */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Vendas Realizadas</h2>
          {listaVendas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Data/Hora</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Pagamento</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Produtos</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Qtd</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {listaVendas.map((venda) => (
                    <tr key={venda.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {venda.data.toLocaleDateString('pt-BR')} {' '}
                        <span className="text-gray-600">{venda.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{venda.cliente}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {venda.pagamento === 'Pix Fornecedor' || venda.pagamento === 'PixFornecedor'
                          ? `${venda.pagamento} ${venda.fornecedorNome ? `— ${venda.fornecedorNome}` : ''}`
                          : (venda.pagamento || 'N/A')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {venda.itens.map((item: any, idx: number) => (
                          <div key={idx} className="text-gray-700">
                            {item.nome || item.produto}
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-gray-900">
                        {venda.itens.reduce((acc: number, item: any) => acc + (item.quantidade || 0), 0)}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-gray-900 text-right">
                        R$ {venda.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => abrirModalImprimir(venda)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Imprimir"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => cancelarVenda(venda.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhuma venda registrada ainda</p>
          )}
        </div>

        {/* Lista de Assistências Realizadas */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-200 mb-8">
          <h2 className="text-xl font-bold text-orange-600 mb-4">Assistências Realizadas</h2>
          {listaAssistencias.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-orange-200">
                    <th className="text-left py-3 px-4 font-semibold text-orange-700">Data/Hora</th>
                    <th className="text-left py-3 px-4 font-semibold text-orange-700">Cliente</th>
                    <th className="text-left py-3 px-4 font-semibold text-orange-700">Pagamento</th>
                    <th className="text-left py-3 px-4 font-semibold text-orange-700">Peça Utilizada</th>
                    <th className="text-center py-3 px-4 font-semibold text-orange-700">Qtd</th>
                    <th className="text-right py-3 px-4 font-semibold text-orange-700">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {listaAssistencias.map((assistencia) => (
                    <tr key={assistencia.id} className="border-b border-orange-100 hover:bg-orange-50">
                      <td className="py-3 px-4 text-sm text-orange-900">
                        {assistencia.data.toLocaleDateString('pt-BR')} {' '}
                        <span className="text-orange-700">{assistencia.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-orange-900">{assistencia.cliente}</td>
                      <td className="py-3 px-4 text-sm text-orange-700">
                        {assistencia.metodo_pagamento === 'Crédito' && assistencia.parcelas
                          ? `${assistencia.metodo_pagamento} (${assistencia.parcelas}x)`
                          : assistencia.metodo_pagamento}
                      </td>
                      <td className="py-3 px-4 text-sm text-orange-700">{assistencia.modelo || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-center text-orange-900">1</td>
                      <td className="py-3 px-4 text-sm font-bold text-orange-900 text-right">
                        R$ {assistencia.valor.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-orange-500 text-center py-8">Nenhuma assistência registrada ainda</p>
          )}
        </div>

        {/* Link para Relatório Completo */}
        <div className="mt-8 text-center">
          <Link
            href="/relatorios-completo"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            <BarChart3 className="w-5 h-5" />
            Ver Relatório Completo
          </Link>
        </div>

        {/* Modal de Seleção de Formato de Impressão */}
        {imprimirModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Selecione o Formato de Impressão</h3>
              <div className="space-y-3">
                <button
                  onClick={() => imprimirVenda('A4')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                >
                  <Printer className="w-5 h-5" />
                  Impressora A4
                </button>
                <button
                  onClick={() => imprimirVenda('Cupom80mm')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
                >
                  <Printer className="w-5 h-5" />
                  Cupom 80mm
                </button>
                <button
                  onClick={() => { setImprimirModalOpen(false); setVendaParaImprimir(null) }}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
