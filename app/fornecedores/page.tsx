'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatPhone } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, ArrowRight, Phone, Mail, MapPin, Truck } from 'lucide-react'

interface Fornecedor {
  id: string
  nome: string
  whatsapp: string | null
  email: string | null
  endereco: string | null
  cnpj: string | null
  created_at: string
}

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFornecedores()
  }, [])

  async function fetchFornecedores() {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .order('nome')

    if (error) {
      console.error('Erro ao buscar fornecedores:', error)
    } else {
      setFornecedores(data || [])
    }
    setLoading(false)
  }

  async function deleteFornecedor(id: string) {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return

    const { error } = await supabase
      .from('fornecedores')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Erro ao excluir fornecedor: ' + error.message)
    } else {
      setFornecedores(fornecedores.filter(f => f.id !== id))
    }
  }

  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-teal-400 text-sm mb-2">
                <Truck className="w-4 h-4" />
                <span>Gestão de Fornecedores</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Fornecedores</h1>
              <p className="text-gray-400 mt-2">Gerencie seus fornecedores e parceiros de negócio</p>
            </div>
            <Link
              href="/fornecedores/novo"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Novo Fornecedor
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
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{fornecedores.length}</p>
                  <p className="text-sm text-gray-500">Total de Fornecedores</p>
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
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar fornecedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Fornecedores Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFornecedores.map((fornecedor) => (
                <div key={fornecedor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <Link href={`/fornecedores/${fornecedor.id}`} className="block p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center">
                        <Truck className="w-7 h-7 text-teal-600" />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{fornecedor.nome}</h3>
                    
                    {fornecedor.email && (
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{fornecedor.email}</span>
                      </div>
                    )}
                    
                    {fornecedor.whatsapp && (
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{formatPhone(fornecedor.whatsapp)}</span>
                      </div>
                    )}
                    
                    {fornecedor.endereco && (
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{fornecedor.endereco}</span>
                      </div>
                    )}
                    
                    {fornecedor.cnpj && (
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">CNPJ: {fornecedor.cnpj}</span>
                      </div>
                    )}
                  </Link>
                  
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <span className="text-xs text-gray-400">
                      Cadastrado em {new Date(fornecedor.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex gap-2">
                      <Link 
                        href={`/fornecedores/${fornecedor.id}`}
                        className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        Ver Finanças
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          deleteFornecedor(fornecedor.id)
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {filteredFornecedores.length === 0 && !loading && (
            <div className="text-center py-12">
              <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum fornecedor encontrado</p>
              <Link
                href="/fornecedores/novo"
                className="inline-flex items-center gap-2 mt-4 text-teal-600 hover:text-teal-700 font-medium"
              >
                Cadastrar primeiro fornecedor
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
