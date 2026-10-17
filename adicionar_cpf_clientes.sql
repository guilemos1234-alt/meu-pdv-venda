-- Adicionar campos CPF, email, endereco e tipo_cliente na tabela clientes_lojistas
ALTER TABLE clientes_lojistas ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;
ALTER TABLE clientes_lojistas ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE clientes_lojistas ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE clientes_lojistas ADD COLUMN IF NOT EXISTS tipo_cliente TEXT CHECK (tipo_cliente IN ('Lojista', 'Cliente final')) DEFAULT 'Lojista';
