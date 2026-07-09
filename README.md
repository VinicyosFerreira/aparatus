# Aparatus

🧔 **Aparatus** é uma aplicação web para descoberta de barbearias, consulta de serviços e realização de agendamentos com pagamento online. O projeto foi construído com foco em uma experiência simples para o cliente final e em uma base técnica moderna, escalável e preparada para evolução.

## 🚀 Visão Geral

O sistema permite que usuários encontrem barbearias, pesquisem serviços, visualizem detalhes de cada estabelecimento, escolham horários disponíveis, realizem pagamentos via Stripe e acompanhem seus agendamentos.

Principais recursos:

- **Listagem de barbearias** recomendadas e populares.
- **Busca por serviços**, como corte, barba, sobrancelha e hidratação.
- **Página de detalhes** da barbearia com descrição, endereço, contatos e serviços.
- **Autenticação social com Google** usando Better Auth.
- **Agendamento protegido por autenticação**.
- **Checkout com Stripe** para pagamento dos serviços.
- **Webhook da Stripe** para confirmar o pagamento e criar a reserva.
- **Cancelamento de reservas** com tentativa de reembolso quando houver cobrança associada.
- **Controle de horários disponíveis** por barbearia e data.

## 🧱 Tecnologias Utilizadas

- **Next.js 16** com App Router.
- **React 19** para construção da interface.
- **TypeScript** para tipagem estática.
- **Tailwind CSS 4** para estilização.
- **Prisma 6** como ORM.
- **PostgreSQL** como banco de dados.
- **Better Auth** para autenticação.
- **Google OAuth** como provedor social.
- **Stripe** para checkout, pagamentos, webhooks e reembolsos.
- **next-safe-action** para Server Actions tipadas e validadas.
- **Zod** para validação de dados.
- **TanStack Query** para gerenciamento de estado assíncrono no cliente.
- **Radix UI** e componentes locais para construção da interface.
- **Sonner** para notificações.
- **date-fns** para manipulação de datas.
- **Lucide React** para ícones.

## 🧠 Arquitetura e Decisões Técnicas

O projeto utiliza uma arquitetura orientada ao App Router do Next.js, separando páginas, componentes, ações de servidor, integrações e acesso a dados.

Estratégias importantes:

- **Server Components** para páginas que consultam dados diretamente no servidor.
- **Server Actions** para fluxos de negócio sensíveis, como criação e cancelamento de agendamentos.
- **Validação centralizada** com Zod e `next-safe-action`.
- **Prisma Client compartilhado** em `lib/prisma.ts`, usando uma estratégia semelhante ao padrão **Singleton** em ambiente de desenvolvimento para evitar múltiplas conexões durante hot reload.
- **Separação de responsabilidades** entre UI, regras de negócio, autenticação, banco de dados e integrações externas.
- **Revalidação de rotas** com `revalidatePath` após alterações relevantes.
- **Regra de unicidade** no banco para impedir conflito de agendamento na mesma barbearia e horário.

Embora o projeto não implemente uma arquitetura limpa formal em camadas rígidas, ele aplica princípios práticos de **baixo acoplamento**, **responsabilidade única** e **validação na borda das ações**, facilitando manutenção e evolução.

## 📁 Estrutura de Pastas

```txt
.
├── app/
│   ├── _actions/              # Server Actions de agendamento, checkout e disponibilidade
│   ├── _components/           # Componentes compartilhados da aplicação
│   ├── _providers/            # Providers globais, como TanStack Query
│   ├── api/
│   │   ├── auth/              # Rotas da Better Auth
│   │   └── stripe/webhook/    # Webhook para eventos da Stripe
│   ├── barbershops/           # Busca e detalhes das barbearias
│   ├── bookings/              # Página de agendamentos do usuário
│   ├── globals.css            # Estilos globais
│   ├── layout.tsx             # Layout raiz
│   └── page.tsx               # Página inicial
├── lib/
│   ├── auth.ts                # Configuração da Better Auth
│   ├── auth-client.ts         # Cliente de autenticação
│   ├── prisma.ts              # Prisma Client compartilhado
│   ├── safe-action.ts         # Cliente base do next-safe-action
│   └── utils.ts               # Utilitários gerais
├── prisma/
│   ├── schema.prisma          # Modelagem do banco de dados
│   └── seed.ts                # Dados iniciais de barbearias e serviços
├── public/                    # Imagens, logo e assets estáticos
├── prompts/                   # Materiais auxiliares do desenvolvimento
├── package.json               # Scripts e dependências
├── prisma.config.ts           # Configuração do Prisma
└── vercel.json                # Configuração de deploy
```

## ⚙️ Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/aparatus"

BETTER_AUTH_SECRET="sua-chave-secreta"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="seu-client-id-google"
GOOGLE_CLIENT_SECRET="seu-client-secret-google"

STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Descrição das variáveis:

- `DATABASE_URL`: string de conexão do PostgreSQL.
- `BETTER_AUTH_SECRET`: chave secreta usada pela Better Auth.
- `BETTER_AUTH_URL`: URL base da autenticação.
- `NEXT_PUBLIC_APP_URL`: URL pública da aplicação usada no checkout da Stripe.
- `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`: credenciais OAuth do Google.
- `STRIPE_SECRET_KEY`: chave privada da Stripe.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: chave pública da Stripe usada no cliente.
- `STRIPE_WEBHOOK_SECRET`: segredo do webhook para validar eventos recebidos da Stripe.

## ▶️ Comandos de Desenvolvimento

Instale as dependências:

```bash
npm install
```

Gere o Prisma Client:

```bash
npx prisma generate
```

Execute as migrations em desenvolvimento:

```bash
npx prisma migrate dev
```

Popule o banco com dados iniciais:

```bash
npx prisma db seed
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse:

```txt
http://localhost:3000
```

Execute o lint:

```bash
npm run lint
```

Gere o build de produção:

```bash
npm run build
```

Inicie a aplicação em modo produção:

```bash
npm run start
```

## 💳 Stripe e Webhook

O fluxo de pagamento utiliza Stripe Checkout:

1. O usuário escolhe um serviço e horário.
2. A aplicação cria uma sessão de checkout com os dados do serviço.
3. A Stripe redireciona o usuário para pagamento.
4. Após confirmação, o webhook `POST /api/stripe/webhook` recebe o evento `checkout.session.completed`.
5. A aplicação cria o agendamento no banco com os metadados enviados para a Stripe.

Para testar webhooks localmente, use a Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Depois, copie o segredo gerado para `STRIPE_WEBHOOK_SECRET`.

## 🔐 Autenticação

A autenticação é feita com **Better Auth** e provedor **Google OAuth**.

Fluxo resumido:

- As rotas de autenticação ficam em `app/api/auth/[...all]/route.ts`.
- A configuração principal está em `lib/auth.ts`.
- Sessões são persistidas no PostgreSQL via Prisma Adapter.
- Páginas e ações sensíveis consultam a sessão no servidor antes de executar regras de negócio.

## 📆 Regras de Agendamento

Regras implementadas:

- Apenas usuários autenticados podem criar, consultar ou cancelar agendamentos.
- Os horários disponíveis são calculados com base nas reservas existentes.
- A agenda padrão considera intervalos de **30 minutos**, das **09:00 às 18:00**.
- Uma barbearia não pode ter dois agendamentos no mesmo horário.
- Reservas passadas não podem ser canceladas.
- Reservas pagas tentam gerar reembolso pela Stripe no cancelamento.

## 🌐 Dependências Externas

- **PostgreSQL**: banco de dados principal.
- **Stripe**: checkout, confirmação de pagamento, webhooks e reembolso.
- **Google Cloud Console**: criação das credenciais OAuth.
- **UploadThing/CDN externo**: imagens usadas no seed apontam para URLs públicas.
- **Vercel**: plataforma indicada para deploy de aplicações Next.js.

## 🚢 Deploy

O projeto está preparado para deploy em plataformas compatíveis com Next.js, especialmente **Vercel**.

Checklist de deploy:

- Configurar todas as variáveis de ambiente no provedor.
- Provisionar um banco PostgreSQL acessível pela aplicação.
- Executar migrations no ambiente de produção.
- Configurar URL pública correta em `NEXT_PUBLIC_APP_URL`.
- Criar e configurar o webhook de produção na Stripe.
- Garantir que as URLs de callback do Google OAuth apontem para o domínio de produção.

## 📚 Documentação Relevante

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/)
- [Prisma](https://www.prisma.io/docs)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Better Auth](https://www.better-auth.com/docs)
- [Stripe Checkout](https://docs.stripe.com/checkout)
- [Stripe Webhooks](https://docs.stripe.com/webhooks)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Zod](https://zod.dev/)

## ✨ Diferenciais do Projeto

- Integração real entre **autenticação, banco de dados, pagamentos e reservas**.
- Uso de **Server Actions** para manter regras críticas no servidor.
- Modelagem de dados clara e compatível com crescimento do produto.
- Fluxo de pagamento com confirmação assíncrona via webhook.
- Base moderna com Next.js, React, TypeScript, Prisma e Stripe.
- Documentação estruturada para facilitar avaliação técnica, manutenção e apresentação profissional.

