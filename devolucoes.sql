-- Tabela de Devoluções
CREATE TABLE IF NOT EXISTS devolucoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venda_id UUID NOT NULL,
    produto_nome TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    motivo TEXT NOT NULL,
    status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Aprovada', 'Rejeitada')),
    valor_reembolso DECIMAL(10,2) NOT NULL,
    data_devolucao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cliente_nome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para otimizar buscas por data
CREATE INDEX IF NOT EXISTS idx_devolucoes_data_desc ON devolucoes(data_devolucao DESC);
CREATE INDEX IF NOT EXISTS idx_devolucoes_status ON devolucoes(status);
CREATE INDEX IF NOT EXISTS idx_devolucoes_venda_id ON devolucoes(venda_id);

-- Habilitar RLS e permitir acesso a todos
ALTER TABLE devolucoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todas operacoes" ON devolucoes FOR ALL USING (true);
