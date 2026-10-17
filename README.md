# Sistema PDV Ultra Cell

Sistema de gestão para loja de acessórios para celular com controle de estoque, vendas, clientes e ordens de serviço.

## Tecnologias

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Supabase
- Lucide React

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

## Desenvolvimento

Instale as dependências:

```bash
npm install
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Funcionalidades

- **Produtos**: Cadastro, edição, busca e controle de estoque
- **Vendas**: Registro de vendas com carrinho e múltiplos pagamentos
- **Clientes**: Gestão de clientes e lojistas
- **Ordens de Serviço**: Criação e acompanhamento de ordens de serviço
- **Financeiro**: Registro de despesas e receitas
- **Dashboard**: Visão geral do negócio
- **Relatórios**: Estatísticas e métricas

## Deploy no Vercel

### Passo 1: Fazer commit do código

```bash
git add .
git commit -m "Initial commit"
```

### Passo 2: Criar repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Crie um novo repositório
3. Siga as instruções para fazer push do código

### Passo 3: Conectar no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "Add New Project"
4. Selecione o repositório do PDV
5. Configure as variáveis de ambiente no Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Clique em "Deploy"

O sistema estará disponível em um domínio do Vercel.

## Contato

- WhatsApp: (11) 97209-8349
- Email: ultracelllapa@gmail.com
