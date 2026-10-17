'use client'

import { useState, useEffect } from 'react'
import { Building2, Phone, MapPin, FileText, Save, Upload, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ConfiguracaoPage() {
  const [configuracao, setConfiguracao] = useState({
    nome_empresa: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    logotipo_url: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [logotipoFile, setLogotipoFile] = useState<File | null>(null)
  const [logotipoPreview, setLogotipoPreview] = useState<string>('')

  useEffect(() => {
    loadConfiguracao()
  }, [])

  async function loadConfiguracao() {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhuma configuração encontrada, usar valores padrão
          setLoading(false)
          return
        }
        console.error('Erro ao carregar configuração:', error)
        setLoading(false)
        return
      }

      if (data) {
        setConfiguracao({
          nome_empresa: data.nome_empresa || '',
          cnpj: data.cnpj || '',
          endereco: data.endereco || '',
          telefone: data.telefone || '',
          logotipo_url: data.logotipo_url || ''
        })
        if (data.logotipo_url) {
          setLogotipoPreview(data.logotipo_url)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
    } finally {
      setLoading(false)
    }
  }

  async function salvarConfiguracao() {
    setSaving(true)
    setMessage('')

    try {
      let logotipoUrl = configuracao.logotipo_url

      // Fazer upload do logotipo se houver um novo arquivo
      if (logotipoFile) {
        const fileName = `logotipo-${Date.now()}.${logotipoFile.name.split('.').pop()}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logotipos')
          .upload(fileName, logotipoFile)

        if (uploadError) {
          console.error('Erro ao fazer upload do logotipo:', uploadError)
          let errorMessage = 'Erro ao fazer upload do logotipo. '
          if (uploadError.message.includes('Bucket not found')) {
            errorMessage += 'Bucket "logotipos" não encontrado. Crie o bucket no Supabase Dashboard > Storage.'
          } else if (uploadError.message.includes('row-level security policy') || uploadError.message.includes('RLS')) {
            errorMessage += 'Política de segurança (RLS) bloqueando o upload. No Supabase Dashboard > Storage > logotipos > Policies, adicione uma política pública para INSERT e SELECT.'
          } else if (uploadError.message.includes('permission')) {
            errorMessage += 'Sem permissão para acessar o storage. Verifique as políticas do bucket.'
          } else if (uploadError.message.includes('size')) {
            errorMessage += 'Arquivo muito grande. Tente uma imagem menor.'
          } else {
            errorMessage += `Detalhes: ${uploadError.message}`
          }
          setMessage(errorMessage)
          setSaving(false)
          return
        }

        // Obter URL pública do logotipo
        const { data: publicUrlData } = supabase.storage
          .from('logotipos')
          .getPublicUrl(fileName)

        logotipoUrl = publicUrlData.publicUrl
      }

      // Verificar se já existe configuração
      const { data: existingData } = await supabase
        .from('configuracoes')
        .select('id')
        .single()

      if (existingData) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('configuracoes')
          .update({
            nome_empresa: configuracao.nome_empresa,
            cnpj: configuracao.cnpj,
            endereco: configuracao.endereco,
            telefone: configuracao.telefone,
            logotipo_url: logotipoUrl
          })
          .eq('id', existingData.id)

        if (error) throw error
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('configuracoes')
          .insert([{
            nome_empresa: configuracao.nome_empresa,
            cnpj: configuracao.cnpj,
            endereco: configuracao.endereco,
            telefone: configuracao.telefone,
            logotipo_url: logotipoUrl
          }])

        if (error) throw error
      }

      setMessage('Configuração salva com sucesso!')
      setTimeout(() => setMessage(''), 3000)
      setLogotipoFile(null)
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      setMessage('Erro ao salvar configuração. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  function handleLogotipoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setLogotipoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogotipoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function removeLogotipo() {
    setLogotipoFile(null)
    setLogotipoPreview('')
    setConfiguracao({ ...configuracao, logotipo_url: '' })
  }

  function formatCNPJ(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18)
  }

  function formatTelefone(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações da Empresa</h1>
          <p className="text-gray-600">Configure os dados da sua empresa que aparecerão nas impressões</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            {/* Logotipo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Logotipo da Empresa
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                {logotipoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={logotipoPreview}
                      alt="Logotipo"
                      className="max-w-full max-h-48 mx-auto rounded-lg"
                    />
                    <button
                      onClick={removeLogotipo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Clique para fazer upload do logotipo</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogotipoChange}
                      className="hidden"
                      id="logotipo-input"
                    />
                    <label
                      htmlFor="logotipo-input"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Selecionar Imagem
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Nome da Empresa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Nome da Empresa
              </label>
              <input
                type="text"
                value={configuracao.nome_empresa}
                onChange={(e) => setConfiguracao({ ...configuracao, nome_empresa: e.target.value })}
                placeholder="Ex: Minha Empresa LTDA"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* CNPJ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                CNPJ
              </label>
              <input
                type="text"
                value={configuracao.cnpj}
                onChange={(e) => setConfiguracao({ ...configuracao, cnpj: formatCNPJ(e.target.value) })}
                placeholder="00.000.000/0000-00"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={18}
              />
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Endereço
              </label>
              <input
                type="text"
                value={configuracao.endereco}
                onChange={(e) => setConfiguracao({ ...configuracao, endereco: e.target.value })}
                placeholder="Rua, número, bairro, cidade - UF"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefone de Contato
              </label>
              <input
                type="text"
                value={configuracao.telefone}
                onChange={(e) => setConfiguracao({ ...configuracao, telefone: formatTelefone(e.target.value) })}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={15}
              />
            </div>

            {/* Botão Salvar */}
            <div className="pt-4">
              <button
                onClick={salvarConfiguracao}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </div>
        </div>

        {/* Informações sobre a tabela */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            <strong>Atenção:</strong> Certifique-se de criar a tabela <code>configuracoes</code> e o bucket de storage <code>logotipos</code> no seu banco de dados Supabase:
          </p>
          <pre className="mt-2 text-xs text-yellow-700 bg-yellow-100 p-2 rounded overflow-x-auto">
            {`-- 1. Criar bucket de storage para logotipos
-- Acesse o Supabase Dashboard > Storage > New bucket
-- Nome: logotipos
-- Public bucket: Sim

-- 2. Configurar políticas do bucket (Policies)
-- Acesse Supabase Dashboard > Storage > logotipos > Policies
-- Clique em "New Policy" > "Get started quickly"
-- Selecione "For full customization" e use:

-- Política para permitir upload público (INSERT):
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'logotipos');

-- Política para permitir leitura pública (SELECT):
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logotipos');

-- 3. Criar tabela de configurações
CREATE TABLE configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_empresa TEXT,
  cnpj TEXT,
  endereco TEXT,
  telefone TEXT,
  logotipo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Adicionar coluna de logotipo se a tabela já existe
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS logotipo_url TEXT;`}
          </pre>
        </div>
      </div>
    </div>
  )
}
