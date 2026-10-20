# Configuração de Autenticação no Vercel

## Credenciais Padrão
- **Email:** admin@ultracell.com
- **Senha:** admin123

## Como alterar as credenciais no Vercel

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto "meu-pdv-venda"
3. Clique em **Settings** (engrenagem)
4. Clique em **Environment Variables** no menu lateral
5. Adicione as seguintes variáveis:

   **ADMIN_EMAIL**
   - Value: seu-email@exemplo.com
   - Environment: Production, Preview, and Development
   - Clique em Save

   **ADMIN_PASSWORD**
   - Value: sua-senha-segura
   - Environment: Production, Preview, and Development
   - Clique em Save

6. Vá para a aba **Deployments**
7. Clique nos três pontos (...) ao lado do deployment mais recente
8. Clique em **Redeploy**

## Como alterar as credenciais localmente

Edite o arquivo `.env.local`:
```
ADMIN_EMAIL=seu-email@exemplo.com
ADMIN_PASSWORD=sua-senha-segura
```

Depois reinicie o servidor:
```bash
npm run dev
```

## Importante
- Nunca commit o arquivo `.env.local` (já está no .gitignore)
- Use senhas fortes
- Altere as credenciais padrão o mais rápido possível
