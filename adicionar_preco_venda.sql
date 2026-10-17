-- Adicionar coluna preco_venda na tabela itens_ordem_servico
ALTER TABLE itens_ordem_servico ADD COLUMN IF NOT EXISTS preco_venda DECIMAL(10,2);
