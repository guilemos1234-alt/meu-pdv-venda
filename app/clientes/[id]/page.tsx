'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Phone, Users, Store, UserCircle, MapPin } from 'lucide-react'
import { formatPhone } from '@/lib/utils'

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    nome_loja: '',
    whatsapp: '',
    cpf_cnpj: '',
    endereco: '',
    tipo_cliente: 'Lojista' as 'Lojista' | 'Cliente final',
  })

  useEffect(() => {
    fetchCliente()
  }, [])

  async function fetchCliente() {
    const { data, error } = await supabase
      .from('clientes_lojistas')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      alert('Erro ao buscar cliente: ' + error.message)
      router.push('/clientes')
    } else if (data) {
      setFormData({
        nome_loja: data.nome_loja || '',
        whatsapp: data.whatsapp || '',
        cpf_cnpj: data.cpf_cnpj || '',
        endereco: data.endereco || '',
        tipo_cliente: data.tipo_cliente || 'Lojista',
      })
    }
    setFetching(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('clientes_lojistas')
      .update({
        nome_loja: formData.nome_loja,
        whatsapp: formData.whatsapp || null,
        cpf_cnpj: formData.cpf_cnpj || null,
        endereco: formData.endereco || null,
        tipo_cliente: formData.tipo_cliente,
      })
      .eq('id', params.id)

    if (error) {
      alert('Erro ao atualizar cliente: ' + error.message)
    } else {
      router.push('/clientes')
    }
    setLoading(false)
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-green-600 to-green-500 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/clientes" 
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar para Clientes</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Editar Cliente</h1>
              <p className="text-green-100 mt-1">Atualize as informações do cliente</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja/Cliente *</label>
              <input
                type="text"
                required
                value={formData.nome_loja}
                onChange={(e) => setFormData({ ...formData, nome_loja: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  maxLength={14}
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })}
                  className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
              <input
                type="text"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                value={formData.cpf_cnpj}
                onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rua, número, bairro, cidade"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cliente *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo_cliente: 'Lojista' })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    formData.tipo_cliente === 'Lojista'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Lojista
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo_cliente: 'Cliente final' })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    formData.tipo_cliente === 'Cliente final'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <UserCircle className="w-4 h-4" />
                  Cliente Final
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Link
                href="/clientes"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
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
