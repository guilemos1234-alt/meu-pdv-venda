-- Tabela de Vendas
CREATE TABLE IF NOT EXISTS vendas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_lojista_id UUID REFERENCES clientes_lojistas(id),
    fornecedor_id UUID REFERENCES fornecedores(id),
    metodo_pagamento TEXT NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    desconto_tipo TEXT,
    desconto_valor DECIMAL(10,2),
    valor_original DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Itens da Venda
CREATE TABLE IF NOT EXISTS itens_venda (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id),
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_vendas_created_at ON vendas(created_at);
CREATE INDEX idx_itens_venda_venda_id ON itens_venda(venda_id);

-- RLS
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_venda ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todas" ON vendas FOR ALL USING (true);
CREATE POLICY "Permitir todas" ON itens_venda FOR ALL USING (true);