'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, ClienteLojista } from '@/lib/supabase'
import { Plus, Edit, Trash2, Users, Phone, Search, Store, ArrowRight, UserCircle, MapPin } from 'lucide-react'
import { formatPhone, formatCpfCnpj } from '@/lib/utils'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteLojista[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'lojista' | 'cliente_final'>('todos')
  const [filtroTelefone, setFiltroTelefone] = useState(false)

  useEffect(() => {
    fetchClientes()
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
    setLoading(false)
  }

  async function deleteCliente(id: string) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return

    // Verificar se existem vendas associadas ao cliente
    const { data: vendas, error: checkError } = await supabase
      .from('vendas')
      .select('id')
      .eq('cliente_lojista_id', id)

    if (checkError) {
      alert('Erro ao verificar vendas do cliente: ' + checkError.message)
      return
    }

    if (vendas && vendas.length > 0) {
      alert('Não é possível excluir este cliente pois existem ' + vendas.length + ' venda(s) associada(s). Exclua as vendas primeiro.')
      return
    }

    // Verificar se existem ordens de serviço associadas ao cliente
    const { data: ordens, error: checkErrorOS } = await supabase
      .from('ordens_servico')
      .select('id')
      .eq('cliente_id', id)

    if (checkErrorOS) {
      alert('Erro ao verificar ordens de serviço do cliente: ' + checkErrorOS.message)
      return
    }

    if (ordens && ordens.length > 0) {
      alert('Não é possível excluir este cliente pois existem ' + ordens.length + ' ordem(ns) de serviço associada(s). Exclua as ordens de serviço primeiro.')
      return
    }

    const { error } = await supabase.from('clientes_lojistas').delete().eq('id', id)

    if (error) {
      alert('Erro ao excluir cliente: ' + error.message)
    } else {
      fetchClientes()
    }
  }

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.nome_loja.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = 
      filtroTipo === 'todos' ||
      (filtroTipo === 'lojista' && cliente.tipo_cliente === 'Lojista') ||
      (filtroTipo === 'cliente_final' && cliente.tipo_cliente === 'Cliente final')
    const matchesTelefone = !filtroTelefone || (cliente.whatsapp && cliente.whatsapp.length > 0)
    return matchesSearch && matchesTipo && matchesTelefone
  })

  const clientesLojistas = clientes.filter(c => c.tipo_cliente === 'Lojista').length
  const clientesFinais = clientes.filter(c => c.tipo_cliente === 'Cliente final').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                <Users className="w-4 h-4" />
                <span>Gestão de Clientes</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Clientes</h1>
              <p className="text-gray-400 mt-2">Gerencie seus clientes e parceiros comerciais</p>
            </div>
            <Link
              href="/clientes/novo"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Novo Cliente
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="px-4 -mt-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{clientes.length}</p>
                  <p className="text-sm text-gray-500">Total de Clientes</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">{clientesLojistas}</p>
                  <p className="text-sm text-gray-500">Lojistas</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">{clientesFinais}</p>
                  <p className="text-sm text-gray-500">Clientes Finais</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="relative max-w-md mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            {/* Filtros de tipo */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroTipo('todos')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filtroTipo === 'todos'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Todos ({clientes.length})
              </button>
              <button
                onClick={() => setFiltroTipo('lojista')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filtroTipo === 'lojista'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Lojistas ({clientesLojistas})
              </button>
              <button
                onClick={() => setFiltroTipo('cliente_final')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filtroTipo === 'cliente_final'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Clientes Finais ({clientesFinais})
              </button>
              <button
                onClick={() => setFiltroTelefone(!filtroTelefone)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  filtroTelefone
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Phone className="w-4 h-4" />
                Com Telefone
              </button>
            </div>
          </div>

          {/* Clientes Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClientes.map((cliente) => (
                <div key={cliente.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                      <Store className="w-7 h-7 text-green-600" />
                    </div>
                    <div className="flex gap-2">
                      <Link 
                        href={`/clientes/${cliente.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteCliente(cliente.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{cliente.nome_loja}</h3>
                  
                  {cliente.whatsapp && (
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{formatPhone(cliente.whatsapp)}</span>
                    </div>
                  )}
                  
                  {cliente.cpf_cnpj && (
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <UserCircle className="w-4 h-4" />
                      <span className="text-sm">{formatCpfCnpj(cliente.cpf_cnpj)}</span>
                    </div>
                  )}
                  
                  {cliente.endereco && (
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{cliente.endereco}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      cliente.tipo_cliente === 'Lojista' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {cliente.tipo_cliente === 'Lojista' ? (
                        <Store className="w-3 h-3" />
                      ) : (
                        <UserCircle className="w-3 h-3" />
                      )}
                      {cliente.tipo_cliente}
                    </span>
                    <span className="text-xs text-gray-400">
                      Cadastrado em {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {filteredClientes.length === 0 && !loading && (
            <div className="text-center py-12">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum lojista encontrado</p>
              <Link
                href="/clientes/novo"
                className="inline-flex items-center gap-2 mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Cadastrar primeiro cliente
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
