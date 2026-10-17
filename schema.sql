-- Tabela de Produtos
CREATE TABLE produtos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco_venda DECIMAL(10, 2) NOT NULL,
    preco_atacado DECIMAL(10, 2),
    custo DECIMAL(10, 2),
    estoque_atual INTEGER DEFAULT 0,
    categoria TEXT CHECK (categoria IN ('Peça', 'Serviço')) DEFAULT 'Peça',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por nome
CREATE INDEX idx_produtos_nome ON produtos(nome);


-- Tabela de Clientes Lojistas
CREATE TABLE clientes_lojistas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_loja TEXT NOT NULL,
    whatsapp TEXT,
    status TEXT CHECK (status IN ('Ativo', 'Inativo')) DEFAULT 'Ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por nome da loja
CREATE INDEX idx_clientes_nome_loja ON clientes_lojistas(nome_loja);


-- View para estoque do lojista (sem custo e sem quantidade exata)
CREATE OR REPLACE VIEW view_estoque_lojista AS
SELECT 
    id,
    nome,
    preco_atacado,
    estoque_atual > 0 AS disponivel
FROM produtos
WHERE categoria = 'Peça';


-- Tabela de Vendas
CREATE TABLE vendas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_lojista_id UUID REFERENCES clientes_lojistas(id),
    metodo_pagamento TEXT NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para consultas por data
CREATE INDEX idx_vendas_data ON vendas(created_at);

-- Comentário sobre métodos de pagamento aceitos
COMMENT ON COLUMN vendas.metodo_pagamento IS 'Métodos aceitos: Pix, Boleto, Dinheiro, Cartão de Crédito, Cartão de Débito, etc';
