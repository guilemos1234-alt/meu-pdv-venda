-- Corrigir política RLS para itens_ordem_servico
DROP POLICY IF EXISTS "Permitir todas as operações em itens_ordem_servico" ON itens_ordem_servico;

CREATE POLICY "Permitir todas as operações em itens_ordem_servico" 
ON itens_ordem_servico FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
