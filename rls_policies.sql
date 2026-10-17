-- Criar tabela de fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  endereco TEXT,
  cnpj TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS para permitir operações

-- Habilitar RLS nas tabelas
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes_lojistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;

-- Política para produtos: permitir todas as operações para anon
CREATE POLICY "Permitir todas as operações em produtos" 
ON produtos FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- Política para clientes: permitir todas as operações para anon
CREATE POLICY "Permitir todas as operações em clientes" 
ON clientes_lojistas FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- Adicionar campos de peça na tabela ordens_servico (se não existirem)
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS origem_peca TEXT DEFAULT 'PDV';
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS peca_id UUID REFERENCES produtos(id);
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS peca_nome TEXT;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS fornecedor TEXT;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS preco_peca DECIMAL(10,2);

-- Política para vendas: permitir todas as operações para anon
CREATE POLICY "Permitir todas as operações em vendas" 
ON vendas FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- Criar tabela de transações financeiras com fornecedores
CREATE TABLE IF NOT EXISTS transacoes_fornecedor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('compra', 'pagamento', 'deposito', 'ajuste')),
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  data DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE transacoes_fornecedor ENABLE ROW LEVEL SECURITY;

-- Adicionar colunas de desconto na tabela vendas (se não existirem)
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS desconto_tipo TEXT;
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS desconto_valor DECIMAL(10,2);
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS valor_original DECIMAL(10,2);
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS fornecedor_id UUID REFERENCES fornecedores(id);

-- Política para a view estoque
CREATE POLICY "Permitir leitura na view estoque" 
ON view_estoque_lojista FOR SELECT 
TO anon 
USING (true);
