-- Tabela para rastrear mensagens WhatsApp enviadas
CREATE TABLE mensagens_whatsapp (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES clientes_lojistas(id) ON DELETE CASCADE,
    mensagem TEXT,
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para buscar mensagens por cliente
CREATE INDEX idx_mensagens_cliente ON mensagens_whatsapp(cliente_id);

-- Índice para buscar por data
CREATE INDEX idx_mensagens_data ON mensagens_whatsapp(data_envio);

-- View para contar mensagens por cliente
CREATE OR REPLACE VIEW view_contador_mensagens AS
SELECT 
    cliente_id,
    COUNT(*) as total_mensagens,
    MAX(data_envio) as ultima_mensagem
FROM mensagens_whatsapp
GROUP BY cliente_id;
