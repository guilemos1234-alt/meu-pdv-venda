-- Habilitar RLS na tabela mensagens_whatsapp
ALTER TABLE mensagens_whatsapp ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserções (qualquer usuário autenticado pode inserir)
CREATE POLICY "Permitir inserção de mensagens" 
ON mensagens_whatsapp 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Política para permitir leitura (qualquer usuário autenticado pode ler)
CREATE POLICY "Permitir leitura de mensagens" 
ON mensagens_whatsapp 
FOR SELECT 
TO authenticated 
USING (true);

-- Política para permitir deleção (qualquer usuário autenticado pode deletar)
CREATE POLICY "Permitir deleção de mensagens" 
ON mensagens_whatsapp 
FOR DELETE 
TO authenticated 
USING (true);
