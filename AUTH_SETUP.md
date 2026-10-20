# Configuração de Autenticação com Supabase

Este sistema usa **Supabase Auth** para autenticação, que já está configurado no seu projeto.

## Como criar um usuário no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **Authentication**
4. Clique em **Users**
5. Clique em **Add user**
6. Preencha:
   - **Email:** seu-email@exemplo.com
   - **Password:** sua-senha-segura
   - **Auto Confirm User:** marque esta opção
7. Clique em **Create user**

## Como fazer login

1. Acesse o site: https://meu-pdv-venda.vercel.app
2. Você será redirecionado para a página de login
3. Use o email e senha que você criou no Supabase
4. Clique em "Entrar"

## Como criar mais usuários

Se você precisar adicionar mais usuários (funcionários, etc.):

1. Acesse o painel do Supabase
2. Vá em **Authentication** → **Users**
3. Clique em **Add user**
4. Crie quantos usuários precisar

## Vantagens do Supabase Auth

- ✅ Não precisa configurar variáveis de ambiente no Vercel
- ✅ Funciona automaticamente no Vercel
- ✅ Sistema seguro e profissional
- ✅ Fácil de gerenciar usuários
- ✅ Suporta múltiplos usuários

## Alterar senha de um usuário

1. Acesse o painel do Supabase
2. Vá em **Authentication** → **Users**
3. Clique no usuário que deseja alterar
4. Clique em **Reset Password**
5. Defina a nova senha
