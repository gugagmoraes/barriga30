# 🚀 Barriga 30 - MVP Handoff Document

Este documento serve como guia de transição para o próximo desenvolvedor (Solo Coder) ou para a continuidade do projeto.

## ✅ Status do Projeto
O MVP (Produto Mínimo Viável) foi **concluído** com as seguintes funcionalidades funcionais:

1.  **Landing Page Otimizada**:
    *   Design inspirado no Noom (Coral/Verde/Bege).
    *   Seções de "Como Funciona", "Planos" e "Depoimentos".
    *   Integração direta com o fluxo de cadastro.

2.  **Autenticação (Supabase)**:
    *   Login e Registro (`/login`, `/register`).
    *   **Trigger de Banco de Dados**: Cria automaticamente o perfil do usuário na tabela `public.users` após o cadastro.

3.  **Pagamentos (Stripe)**:
    *   Configuração inicial em `src/lib/stripe/config.ts`.
    *   API de Checkout (`/api/stripe/checkout`) pronta para criar sessões.
    *   Webhook (`/api/stripe/webhook`) implementado para ativar assinaturas.
    *   *Nota: As chaves atuais no `.env.local` são placeholders e precisam ser substituídas pelas reais.*

4.  **Treinos**:
    *   Listagem de treinos por nível (Iniciante, Intermediário, Avançado).
    *   **Player de Vídeo**: Timer regressivo, transição de 10s "PREPARE-SE", navegação entre exercícios.
    *   Banco de dados populado com 9 treinos iniciais via migration.

5.  **Dieta & Lista de Compras**:
    *   Página de Dieta (`/dieta`) com cardápio modelo.
    *   Lista de Compras (`/lista-compras`) gerada a partir da dieta.

6.  **Gamificação Básica**:
    *   Dashboard com exibição de Streak e Pontos (atualmente mockados/estáticos, prontos para lógica dinâmica).

---

## 🛠️ Stack Tecnológica

*   **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS.
*   **Backend/DB**: Supabase (PostgreSQL, Auth).
*   **Pagamentos**: Stripe API.
*   **UI Components**: Shadcn/ui (Radix UI) + Lucide Icons.

---

## 📂 Estrutura de Pastas Importante

*   `src/app/(auth)`: Rotas de autenticação (Login/Register) e Server Actions.
*   `src/app/(app)`: Rotas protegidas da aplicação (Dashboard, Treinos, Dieta).
*   `src/components/workout/WorkoutPlayer.tsx`: Componente principal do player de vídeo.
*   `src/lib/supabase`: Clientes Supabase (Server e Client).
*   `supabase/migrations`: Arquivos SQL com o schema do banco e dados iniciais (Seeds).

---

## ⚠️ Ações Necessárias (Next Steps)

### 1. Configuração de Ambiente
O arquivo `.env.local` possui chaves de teste/placeholder para o Stripe. Para o lançamento real:
1.  Obtenha as chaves de API do **Stripe Dashboard**.
2.  Atualize `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

### 2. Conteúdo Real
*   **Vídeos**: Os treinos no banco de dados estão com URLs de exemplo (`https://www.youtube.com/watch?v=sample...`). Atualize a tabela `workouts` com os links reais dos vídeos (Vimeo/YouTube/Supabase Storage).

### 3. Integrações Futuras (Roadmap)
*   **Quiz de Onboarding**: O endpoint `/api/integrations/quiz-result` já existe. Falta construir o frontend do Quiz.
*   **Gamificação Dinâmica**: Conectar a pontuação do Dashboard à tabela `gamificacao` real.
*   **IA na Dieta**: Implementar personalização baseada em IA para os planos Plus/VIP.

---

## 📝 Comandos Úteis

*   **Rodar localmente**: `npm run dev`
*   **Build de produção**: `npm run build`
*   **Deploy**: O projeto está configurado para deploy na Vercel.

---

**Boa sorte na próxima fase! O código está limpo, modular e pronto para escalar.** 🚀
