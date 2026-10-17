import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos para as tabelas
export interface Produto {
  id: string
  nome: string
  descricao: string | null
  preco_venda: number
  preco_atacado: number | null
  custo: number | null
  estoque_atual: number
  estoque_minimo: number
  codigo_barras: string | null
  categoria: 'Peça' | 'Serviço'
  gaveta: string | null
  oculto: boolean
  created_at: string
}

export interface ClienteLojista {
  id: string
  nome_loja: string
  whatsapp: string | null
  cpf_cnpj: string | null
  email: string | null
  endereco: string | null
  tipo_cliente: 'Lojista' | 'Cliente final'
  created_at: string
  total_mensagens?: number
  ultima_mensagem?: string
}

export interface OrdemServico {
  id: string
  cliente_id: string | null
  aparelho: string
  modelo: string | null
  problema_descricao: string
  diagnostico: string | null
  solucao: string | null
  valor: number | null
  status: 'Pendente' | 'Em andamento' | 'Aguardando peça' | 'Concluído' | 'Cancelado'
  data_entrada: string
  data_previsao_entrega: string | null
  data_conclusao: string | null
  metodo_pagamento: string | null
  parcelas: number | null
  created_at: string
}

export interface ItemOrdemServico {
  id: string
  ordem_servico_id: string
  origem_peca: 'PDV' | 'Loja externa'
  peca_id: string | null
  peca_nome: string
  fornecedor: string | null
  preco_peca: number | null
  preco_venda: number | null
  quantidade: number
  created_at: string
}

export interface Venda {
  id: string
  cliente_lojista_id: string | null
  metodo_pagamento: string
  valor_total: number
  created_at: string
}

export interface ViewEstoqueLojista {
  id: string
  nome: string
  preco_atacado: number | null
  disponivel: boolean
}

export interface MensagemWhatsApp {
  id: string
  cliente_id: string
  mensagem: string
  data_envio: string
}

export interface ModeloCelular {
  id: string
  marca: string
  modelo: string
  created_at: string
}
