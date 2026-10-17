'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, FolderOpen, Package, AlertCircle } from 'lucide-react'

interface CategoriaInfo {
  nome: string
  quantidade: number
}

export default function GerenciarCategoriasPage() {
  const router = useRouter()
  const [categorias, setCategorias] = useState<CategoriaInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [novaCategoria, setNovaCategoria] = useState('')
  const [categoriaEditando, setCategoriaEditando] = useState<string | null>(null)
  const [novoNome, setNovoNome] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchCategorias()
  }, [])

  async function fetchCategorias() {
    const { data, error } = await supabase
      .from('produtos')
      .select('descricao')
      .not('descricao', 'is', null)

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return
    }

    // Contar produtos por categoria
    const contagem: Record<string, number> = {}
    data.forEach((p: any) => {
      const cat = p.descricao
      if (cat) {
        contagem[cat] = (contagem[cat] || 0) + 1
      }
    })

    const lista = Object.entries(contagem)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => a.nome.localeCompare(b.nome))

    setCategorias(lista)
    setLoading(false)
  }

  async function adicionarCategoria() {
    if (!novaCategoria.trim()) {
      setMessage('Digite um nome para a categoria')
      return
    }

    const nomeTrimmed = novaCategoria.trim()
    if (categorias.some(c => c.nome.toLowerCase() === nomeTrimmed.toLowerCase())) {
      setMessage('Esta categoria já existe')
      return
    }

    // Adiciona uma categoria vazia (será criada quando associar a um produto)
    setCategorias([...categorias, { nome: nomeTrimmed, quantidade: 0 }].sort((a, b) => a.nome.localeCompare(b.nome)))
    setNovaCategoria('')
    setMessage('Categoria adicionada! Use-a ao cadastrar um produto.')
    setTimeout(() => setMessage(''), 3000)
  }

  function excluirCategoria(nome: string) {
    console.log('Tentando excluir categoria:', nome)
    const categoria = categorias.find(c => c.nome === nome)
    console.log('Categoria encontrada:', categoria)
    
    if (!categoria) {
      console.log('Categoria não encontrada')
      return
    }
    
    if (categoria.quantidade > 0) {
      alert(`Não é possível excluir. Existem ${categoria.quantidade} produtos nesta categoria.`)
      return
    }

    if (confirm(`Tem certeza que deseja excluir a categoria "${nome}"?`)) {
      console.log('Excluindo categoria:', nome)
      setCategorias(prev => {
        console.log('Estado anterior:', prev)
        const novo = prev.filter(c => c.nome !== nome)
        console.log('Novo estado:', novo)
        return novo
      })
      alert('Categoria excluída com sucesso!')
    }
  }

  async function salvarEdicao(nomeAntigo: string) {
    if (!novoNome.trim() || novoNome.trim() === nomeAntigo) {
      setCategoriaEditando(null)
      setNovoNome('')
      return
    }

    const nomeTrimmed = novoNome.trim()
    if (categorias.some(c => c.nome.toLowerCase() === nomeTrimmed.toLowerCase() && c.nome !== nomeAntigo)) {
      setMessage('Já existe uma categoria com este nome')
      return
    }

    // Atualizar no banco de dados - atualizar todos os produtos com esta categoria
    const { error } = await supabase
      .from('produtos')
      .update({ descricao: nomeTrimmed })
      .eq('descricao', nomeAntigo)

    if (error) {
      setMessage('Erro ao atualizar categoria: ' + error.message)
      return
    }

    // Atualizar localmente
    setCategorias(categorias.map(c => 
      c.nome === nomeAntigo ? { ...c, nome: nomeTrimmed } : c
    ).sort((a, b) => a.nome.localeCompare(b.nome)))
    
    setCategoriaEditando(null)
    setNovoNome('')
    setMessage('Categoria atualizada com sucesso!')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-500 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/produtos" 
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gerenciar Categorias</h1>
                <p className="text-blue-100 text-sm">Organize suas categorias de produtos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Mensagem */}
        {message && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800">{message}</p>
          </div>
        )}

        {/* Adicionar Nova Categoria */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Adicionar Nova Categoria</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nome da categoria..."
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && adicionarCategoria()}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={adicionarCategoria}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>
        </div>

        {/* Lista de Categorias */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-slate-900">
              Categorias Existentes ({categorias.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : categorias.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma categoria encontrada</p>
              <p className="text-sm mt-1">Adicione categorias ao cadastrar produtos</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {categorias.map((categoria) => (
                <div key={categoria.nome} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  {categoriaEditando === categoria.nome ? (
                    <div className="flex-1 flex items-center gap-3">
                      <input
                        type="text"
                        value={novoNome}
                        onChange={(e) => setNovoNome(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && salvarEdicao(categoria.nome)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => salvarEdicao(categoria.nome)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setCategoriaEditando(null)
                          setNovoNome('')
                        }}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{categoria.nome}</p>
                          <p className="text-sm text-gray-500">
                            {categoria.quantidade} {categoria.quantidade === 1 ? 'produto' : 'produtos'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCategoriaEditando(categoria.nome)
                            setNovoNome(categoria.nome)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Renomear"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => excluirCategoria(categoria.nome)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-700">
            <strong>Dica:</strong> Categorias só podem ser excluídas quando não possuem produtos associados. 
            Para excluir uma categoria em uso, primeiro altere a categoria dos produtos.
          </p>
        </div>
      </div>
    </div>
  )
}
