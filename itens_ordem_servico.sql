-- Tabela de Itens da Ordem de Serviço
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

-- Índices para consultas
CREATE INDEX idx_itens_ordem_servico_ordem_id ON itens_ordem_servico(ordem_servico_id);

-- Habilitar RLS
ALTER TABLE itens_ordem_servico ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações
CREATE POLICY "Permitir todas as operações em itens_ordem_servico" 
ON itens_ordem_servico FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
