-- Adicionar coluna oculto na tabela produtos
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS oculto BOOLEAN DEFAULT FALSE;
