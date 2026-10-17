-- Criação da tabela de configurações
CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_empresa TEXT,
    cnpj TEXT,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    logotipo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desabilitar RLS para permitir leitura pública
ALTER TABLE configuracoes DISABLE ROW LEVEL SECURITY;

-- Criar política para permitir SELECT para todos (desabilitada se RLS estiver off)
-- CREATE POLICY "Allow public read" ON configuracoes FOR SELECT USING (true);
-- CREATE POLICY "Allow authenticated insert/update/delete" ON configuracoes FOR ALL USING (auth.role() = 'authenticated');

-- Índice para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_configuracoes_id ON configuracoes(id);
