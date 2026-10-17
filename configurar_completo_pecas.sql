-- Configuração completa da tabela itens_ordem_servico

-- 1. Garantir que a tabela existe
CREATE TABLE IF NOT EXISTS itens_ordem_servico (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ordem_servico_id UUID REFERENCES ordens_servico(id) ON DELETE CASCADE,
    origem_peca TEXT NOT NULL CHECK (origem_peca IN ('PDV', 'Loja externa')),
    peca_id UUID REFERENCES produtos(id),
    peca_nome TEXT NOT NULL,
    fornecedor TEXT,
    preco_peca DECIMAL(10,2),
    preco_venda DECIMAL(10,2),
    quantidade INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar coluna preco_venda se não existir
ALTER TABLE itens_ordem_servico ADD COLUMN IF NOT EXISTS preco_venda DECIMAL(10,2);

-- 3. Criar índice se não existir
CREATE INDEX IF NOT EXISTS idx_itens_ordem_servico_ordem_id ON itens_ordem_servico(ordem_servico_id);

-- 4. Habilitar RLS
ALTER TABLE itens_ordem_servico ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas existentes
DROP POLICY IF EXISTS "Permitir todas as operações em itens_ordem_servico" ON itens_ordem_servico;

-- 6. Criar nova política
CREATE POLICY "Permitir todas as operações em itens_ordem_servico" 
ON itens_ordem_servico FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
