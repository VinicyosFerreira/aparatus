# Guia de Desenvolvimento do Aparatus

Este guia foi feito para ajudar um desenvolvedor júnior a entrar no projeto com segurança, entender os principais fluxos e conseguir evoluir a aplicação sem precisar adivinhar onde cada coisa acontece.

O **Aparatus** é uma aplicação de agendamento para barbearias. O usuário consegue procurar barbearias, ver serviços, escolher data e horário, pagar pelo serviço via Stripe e acompanhar suas reservas.

## 1. Visão Geral do Projeto

O projeto usa **Next.js com App Router**, então boa parte da aplicação fica dentro da pasta `app/`.

Na prática, o sistema é dividido em quatro grandes áreas:

- **Interface**: páginas e componentes visuais.
- **Regras de negócio**: Server Actions para criar reserva, cancelar reserva, criar checkout e buscar horários.
- **Persistência**: Prisma acessando PostgreSQL.
- **Integrações externas**: Better Auth, Google OAuth e Stripe.

Pense no projeto como um fluxo de ponta a ponta:

```txt
Usuário navega pela interface
↓
Escolhe barbearia, serviço, data e horário
↓
Server Action valida usuário e dados
↓
Stripe recebe o pagamento
↓
Webhook confirma pagamento
↓
Reserva é criada no banco
↓
Usuário acompanha ou cancela a reserva
```

## 2. Pastas Mais Importantes

```txt
app/
├── page.tsx                         # Página inicial
├── barbershops/page.tsx             # Página de busca de barbearias
├── barbershops/[id]/page.tsx        # Página de detalhes de uma barbearia
├── bookings/page.tsx                # Página de reservas do usuário logado
├── _actions/                        # Server Actions com regras de negócio
├── _components/                     # Componentes reutilizáveis da interface
├── _components/ui/                  # Componentes base de UI
├── _providers/                      # Providers globais
└── api/                             # Rotas de API, auth e webhooks

lib/
├── auth.ts                          # Configuração da autenticação
├── auth-client.ts                   # Cliente de autenticação usado no browser
├── prisma.ts                        # Cliente Prisma compartilhado
├── safe-action.ts                   # Cliente base do next-safe-action
└── utils.ts                         # Funções utilitárias

prisma/
├── schema.prisma                    # Modelagem das tabelas
└── seed.ts                          # Dados iniciais para popular o banco
```

## 3. Como o App Router Está Sendo Usado

O Next.js App Router separa páginas por diretórios.

Exemplos:

- `app/page.tsx`: renderiza a home.
- `app/barbershops/page.tsx`: renderiza a busca.
- `app/barbershops/[id]/page.tsx`: renderiza uma barbearia específica.
- `app/bookings/page.tsx`: renderiza os agendamentos do usuário.

Quando o arquivo é uma página e não usa `"use client"`, ele roda no servidor por padrão. Isso permite buscar dados direto com Prisma, como acontece na home e nas páginas de barbearia.

Quando um componente precisa de estado, evento de clique, hooks ou integração no navegador, ele precisa começar com:

```tsx
"use client";
```

Exemplos de componentes client:

- `app/_components/service-item.tsx`
- `app/_components/booking-item.tsx`
- `app/_components/sidebar-menu.tsx`

## 4. Fluxo Principal: Busca e Listagem de Barbearias

### Onde começa

Arquivo principal:

```txt
app/page.tsx
```

A home busca barbearias no banco usando Prisma:

- `recommendedBarbershops`: ordenadas por nome ascendente.
- `popularBarbershops`: ordenadas por nome descendente.

Depois renderiza:

- `Header`
- `SearchInput`
- `QuickSearchButtons`
- banner principal
- listas com `BarbershopItem`
- `Footer`

### Busca por serviço

Arquivo:

```txt
app/barbershops/page.tsx
```

A busca usa o parâmetro de URL `search`.

Exemplo:

```txt
/barbershops?search=barba
```

A query procura barbearias que tenham pelo menos um serviço cujo nome contenha o termo pesquisado:

```txt
Barbershop -> services -> name contains search
```

Isso significa que a busca atual é baseada no nome do serviço, não no nome da barbearia.

## 5. Fluxo Principal: Detalhes da Barbearia

Arquivo:

```txt
app/barbershops/[id]/page.tsx
```

Essa página recebe o `id` da barbearia pela URL.

Exemplo:

```txt
/barbershops/123
```

Ela busca a barbearia pelo `id` e inclui os serviços:

```ts
include: {
  services: true,
}
```

Se a barbearia não existir, chama:

```ts
notFound();
```

Na tela aparecem:

- imagem da barbearia;
- nome;
- endereço;
- descrição;
- lista de serviços;
- telefones de contato.

Cada serviço é renderizado pelo componente:

```txt
app/_components/service-item.tsx
```

Esse componente é muito importante porque ele inicia o fluxo de reserva.

## 6. Fluxo Principal: Criar Reserva com Pagamento

Este é o fluxo mais crítico do projeto.

### Arquivos envolvidos

```txt
app/_components/service-item.tsx
app/_actions/get-date-available-time-slots.ts
app/_actions/create-booking-checkout-session.ts
app/api/stripe/webhook/route.ts
prisma/schema.prisma
```

### Passo a passo

1. O usuário entra na página de uma barbearia.
2. O usuário clica em **Reservar** em um serviço.
3. O componente `ServiceItem` abre um `Sheet`.
4. O usuário escolhe uma data no calendário.
5. A aplicação busca os horários disponíveis para aquela data.
6. O usuário escolhe um horário.
7. O usuário clica em **Confirmar**.
8. A aplicação cria uma sessão de checkout na Stripe.
9. O usuário é redirecionado para a Stripe.
10. A Stripe confirma o pagamento.
11. O webhook recebe o evento `checkout.session.completed`.
12. O backend cria a reserva no banco.

### Seleção de data e horário

No `ServiceItem`, quando o usuário seleciona uma data, a aplicação chama:

```txt
getDateAvailableTimeSlots
```

Essa action fica em:

```txt
app/_actions/get-date-available-time-slots.ts
```

Ela:

- verifica se existe usuário autenticado;
- busca reservas da barbearia no dia selecionado;
- transforma as reservas existentes em horários ocupados;
- remove os horários ocupados da lista padrão.

Lista padrão atual:

```txt
09:00 até 18:00, com intervalos de 30 minutos
```

Importante: hoje todo serviço é tratado como se ocupasse **30 minutos**.

### Criação do checkout

Quando o usuário confirma, o componente chama:

```txt
createBookingCheckoutSession
```

Arquivo:

```txt
app/_actions/create-booking-checkout-session.ts
```

Essa action:

- valida se `STRIPE_SECRET_KEY` existe;
- verifica se o usuário está logado;
- busca o serviço no banco;
- cria uma sessão de checkout na Stripe;
- envia metadados importantes para a Stripe.

Metadados enviados:

```txt
serviceId
barbershopId
userId
date
```

Esses metadados são essenciais porque o webhook usa esses dados para criar a reserva depois do pagamento.

### Confirmação via webhook

Arquivo:

```txt
app/api/stripe/webhook/route.ts
```

Quando a Stripe envia o evento `checkout.session.completed`, o webhook:

- valida a assinatura da Stripe;
- lê os metadados da sessão;
- busca o `payment_intent`;
- extrai o `chargeId`;
- cria a reserva no banco;
- salva `stripeChargeId` para permitir reembolso futuro.

Ponto de atenção: a reserva só é criada depois da confirmação da Stripe. Isso é bom porque evita reserva sem pagamento confirmado.

## 7. Fluxo Alternativo: Criar Reserva Sem Stripe

Existe uma action chamada:

```txt
app/_actions/create-booking.ts
```

Ela cria uma reserva diretamente no banco, sem passar pela Stripe.

Atualmente, no `ServiceItem`, esse fluxo está comentado. Ele parece ter sido usado antes da integração com pagamento.

Use essa action com cuidado. Se o produto deve exigir pagamento antes de reservar, mantenha o fluxo via Stripe como principal.

## 8. Fluxo Principal: Meus Agendamentos

Arquivo:

```txt
app/bookings/page.tsx
```

Essa página:

- verifica se existe sessão;
- redireciona para `/` se o usuário não estiver logado;
- busca reservas do usuário;
- inclui dados de serviço e barbearia;
- separa reservas em confirmadas e finalizadas.

Critério atual:

```txt
Confirmada = não cancelada e data maior ou igual a agora
Finalizada = cancelada ou data menor que agora
```

Cada reserva é exibida com:

```txt
app/_components/booking-item.tsx
```

## 9. Fluxo Principal: Cancelar Reserva

### Arquivos envolvidos

```txt
app/_components/booking-item.tsx
app/_actions/cancel-booking.ts
```

### Passo a passo

1. O usuário abre a página `/bookings`.
2. O usuário clica em uma reserva.
3. O `BookingItem` abre um painel com detalhes.
4. Se a reserva estiver confirmada, aparece o botão **Cancelar Reserva**.
5. O usuário confirma no modal.
6. A action `cancelBooking` é executada.
7. A reserva é marcada como cancelada.
8. A rota `/bookings` é revalidada.

### Validações feitas no servidor

A action `cancelBooking` valida:

- se o usuário está logado;
- se a reserva existe;
- se a reserva pertence ao usuário logado;
- se a reserva ainda não foi cancelada;
- se a reserva não é passada.

### Reembolso

Se a reserva possuir `stripeChargeId`, o sistema tenta criar um reembolso na Stripe:

```txt
stripe.refunds.create
```

Se a Stripe retornar erro, o cancelamento não segue normalmente e o usuário recebe uma mensagem de erro.

## 10. Autenticação

### Bibliotecas

O projeto usa:

- **Better Auth**
- **Google OAuth**
- **Prisma Adapter**

### Arquivos principais

```txt
lib/auth.ts
lib/auth-client.ts
app/api/auth/[...all]/route.ts
app/_components/sidebar-menu.tsx
```

### Como funciona

No servidor, a configuração fica em:

```txt
lib/auth.ts
```

Ela define:

- banco via Prisma Adapter;
- provider `google`;
- credenciais vindas das variáveis `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.

A rota:

```txt
app/api/auth/[...all]/route.ts
```

expõe os handlers `GET` e `POST` da Better Auth para o Next.js.

No cliente, o menu lateral usa:

```txt
authClient.useSession()
authClient.signIn.social()
authClient.signOut()
```

Arquivo:

```txt
app/_components/sidebar-menu.tsx
```

## 11. Relacionamento das Tabelas

O schema fica em:

```txt
prisma/schema.prisma
```

### Visão em alto nível

```txt
User 1---N Booking N---1 Barbershop
                   N---1 BarbershopService

Barbershop 1---N BarbershopService
Barbershop 1---N Booking

User 1---N Session
User 1---N Account
```

### Barbershop

Representa uma barbearia.

Campos importantes:

- `id`
- `name`
- `address`
- `description`
- `imageUrl`
- `phones`

Relacionamentos:

- uma barbearia possui muitos serviços;
- uma barbearia possui muitos agendamentos.

### BarbershopService

Representa um serviço oferecido por uma barbearia.

Campos importantes:

- `id`
- `name`
- `description`
- `imageUrl`
- `priceInCents`
- `barbershopId`

Relacionamentos:

- cada serviço pertence a uma barbearia;
- cada serviço pode estar em muitos agendamentos.

Observação importante: o preço é salvo em centavos. Exemplo:

```txt
R$ 60,00 -> 6000
```

Isso evita problemas de arredondamento com valores monetários.

### Booking

Representa uma reserva.

Campos importantes:

- `id`
- `serviceId`
- `barbershopId`
- `userId`
- `date`
- `cancelled`
- `cancelledAt`
- `stripeChargeId`

Relacionamentos:

- cada reserva pertence a um usuário;
- cada reserva pertence a uma barbearia;
- cada reserva pertence a um serviço.

Regra importante:

```prisma
@@unique([barbershopId, date])
```

Essa regra impede que uma mesma barbearia tenha duas reservas no mesmo horário.

### User

Representa o usuário autenticado.

Campos importantes:

- `id`
- `name`
- `email`
- `emailVerified`
- `image`

Relacionamentos:

- um usuário pode ter várias reservas;
- um usuário pode ter várias sessões;
- um usuário pode ter várias contas de autenticação.

### Session, Account e Verification

Essas tabelas são usadas pela Better Auth.

Você normalmente não precisa mexer nelas ao criar funcionalidades de negócio. Elas existem para suportar login, sessão, contas sociais e verificação.

## 12. Integrações com APIs Externas

### Stripe

Usada para:

- criar checkout;
- receber confirmação via webhook;
- recuperar dados do pagamento;
- criar reembolso no cancelamento.

Arquivos principais:

```txt
app/_actions/create-booking-checkout-session.ts
app/api/stripe/webhook/route.ts
app/_actions/cancel-booking.ts
```

Variáveis necessárias:

```txt
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
```

Cuidados:

- nunca exponha `STRIPE_SECRET_KEY` no client;
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` pode ser usada no client;
- sempre valide webhook com `STRIPE_WEBHOOK_SECRET`;
- não crie reserva antes da confirmação do pagamento se o fluxo exigir pagamento.

### Google OAuth

Usado como provedor de login.

Arquivos principais:

```txt
lib/auth.ts
app/_components/sidebar-menu.tsx
```

Variáveis necessárias:

```txt
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

Cuidados:

- configurar corretamente as URLs de callback no Google Cloud Console;
- manter as credenciais fora do Git;
- conferir se `BETTER_AUTH_URL` aponta para o domínio correto em cada ambiente.

### PostgreSQL

Usado como banco principal.

Arquivo principal:

```txt
prisma/schema.prisma
```

Variável necessária:

```txt
DATABASE_URL
```

Cuidados:

- qualquer alteração no schema deve gerar migration;
- migrations devem ser revisadas antes de ir para produção;
- evite apagar dados em migrations sem estratégia de rollback ou backup.

## 13. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto.

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

Regra simples:

- variáveis com `NEXT_PUBLIC_` podem aparecer no navegador;
- variáveis sem `NEXT_PUBLIC_` devem ficar apenas no servidor.

## 14. Comandos Úteis

Instalar dependências:

```bash
npm install
```

Rodar em desenvolvimento:

```bash
npm run dev
```

Gerar Prisma Client:

```bash
npx prisma generate
```

Criar e aplicar migration em desenvolvimento:

```bash
npx prisma migrate dev
```

Popular o banco:

```bash
npx prisma db seed
```

Rodar lint:

```bash
npm run lint
```

Gerar build:

```bash
npm run build
```

Rodar produção local:

```bash
npm run start
```

Testar webhook local com Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 15. Como Adicionar uma Nova Funcionalidade

Antes de sair codando, responda:

- Essa funcionalidade roda no servidor, no cliente ou nos dois?
- Ela precisa de autenticação?
- Ela precisa alterar o banco?
- Ela depende de Stripe, Google ou outra API externa?
- Ela precisa revalidar alguma página depois de salvar dados?

### Exemplo: adicionar avaliação de barbearia

Possível caminho:

1. Criar model `Review` no `schema.prisma`.
2. Relacionar `Review` com `User` e `Barbershop`.
3. Gerar migration.
4. Criar uma Server Action para salvar avaliação.
5. Validar entrada com Zod.
6. Verificar se o usuário está logado.
7. Renderizar avaliações na página `app/barbershops/[id]/page.tsx`.
8. Criar componente client se houver formulário interativo.

### Exemplo: adicionar duração por serviço

Hoje o sistema assume que todo serviço dura 30 minutos.

Possível caminho:

1. Adicionar `durationInMinutes` em `BarbershopService`.
2. Ajustar seed para preencher a duração.
3. Criar migration.
4. Alterar `get-date-available-time-slots.ts` para considerar duração real.
5. Revisar regra de conflito no banco, porque apenas `barbershopId + date` pode não ser suficiente para serviços com duração variável.

## 16. Cuidados ao Mexer em Reservas

Reservas são o coração do sistema.

Antes de alterar qualquer fluxo de reserva, confira:

- se o usuário está autenticado;
- se o serviço existe;
- se o horário ainda está disponível;
- se a barbearia não possui reserva conflitante;
- se o pagamento foi confirmado;
- se o cancelamento não permite reserva passada;
- se o reembolso foi tratado corretamente;
- se a página `/bookings` precisa ser revalidada.

Ponto importante: como pagamentos e webhooks são assíncronos, nunca assuma que o checkout concluído no frontend significa reserva criada. A confirmação real vem da Stripe pelo webhook.

## 17. Cuidados com Datas e Horários

O projeto trabalha com horários em `America/Sao_Paulo` em alguns pontos de formatação.

Arquivos para observar:

```txt
app/_actions/get-date-available-time-slots.ts
app/_actions/create-booking-checkout-session.ts
app/_components/service-item.tsx
app/_components/booking-item.tsx
```

Cuidados:

- sempre teste datas no dia atual, amanhã e datas futuras;
- confira se o horário salvo no banco é o mesmo escolhido pelo usuário;
- evite comparar datas formatadas quando puder comparar objetos `Date`;
- cuidado com timezone ao criar ou exibir reservas.

## 18. Cuidados com Server Actions

As Server Actions ficam em:

```txt
app/_actions/
```

Boas práticas para novas actions:

- começar com `"use server"`;
- validar entrada com Zod;
- verificar sessão quando a action exigir usuário logado;
- retornar erros claros;
- evitar expor dados sensíveis;
- revalidar rotas afetadas quando necessário;
- manter regras críticas no servidor.

Exemplo de mentalidade correta:

```txt
O botão pode esconder uma ação no frontend, mas a segurança precisa estar no servidor.
```

## 19. Pontos de Melhoria Recomendados

Algumas melhorias naturais para evolução do projeto:

- Criar testes automatizados para Server Actions.
- Cobrir fluxo de webhook com testes de integração.
- Adicionar duração real por serviço.
- Criar painel administrativo para barbearias.
- Permitir cadastro e edição de serviços.
- Melhorar busca para considerar nome da barbearia, endereço e descrição.
- Criar controle de expediente por barbearia.
- Criar tela de sucesso e erro após checkout.
- Tratar idempotência no webhook da Stripe para evitar duplicidade em retentativas.
- Melhorar mensagens de erro padronizando português e acentuação.
- Ajustar metadados do `layout.tsx`, como idioma e descrição.

## 20. Checklist Para Pull Requests

Antes de abrir um PR, confira:

- A funcionalidade foi testada manualmente?
- O fluxo funciona logado e deslogado, quando fizer sentido?
- As variáveis de ambiente necessárias foram documentadas?
- Alguma migration foi criada e revisada?
- O código não expõe chave secreta no frontend?
- O lint passa?
- O fluxo de pagamento ou reserva não foi quebrado?
- O README ou este guia precisam ser atualizados?

## 21. Onde Começar Como Dev Júnior

Se você acabou de chegar no projeto, siga esta ordem:

1. Leia `README.md` para entender instalação e visão geral.
2. Leia `prisma/schema.prisma` para entender os dados.
3. Rode o projeto localmente.
4. Navegue pela home, busca, detalhes da barbearia e agendamentos.
5. Leia `app/_components/service-item.tsx` para entender a reserva.
6. Leia `app/_actions/create-booking-checkout-session.ts`.
7. Leia `app/api/stripe/webhook/route.ts`.
8. Leia `app/_actions/cancel-booking.ts`.
9. Só depois comece a implementar melhorias.

O melhor jeito de evoluir este projeto é fazer mudanças pequenas, testar o fluxo completo e sempre pensar no impacto em autenticação, pagamento e banco de dados.

