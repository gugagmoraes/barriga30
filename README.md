# Barriga 30 - MVP

App de emagrecimento de 30 dias focado em treinos rápidos, dieta simples e gamificação. Construído como um PWA (Progressive Web App).

## 🚀 Funcionalidades

*   **Programa de 30 Dias**: Treinos diários de 30 minutos.
*   **Gamificação**: Sistema de streaks e pontos para manter a motivação.
*   **Dieta Simplificada**: Cardápios práticos e lista de compras automática.
*   **Níveis de Progressão**: Iniciante, Intermediário e Avançado.
*   **Assinaturas**: Integração com Stripe para planos Básico, Plus e VIP.

## 🛠️ Tecnologias

*   [Next.js 14](https://nextjs.org/) (App Router)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Supabase](https://supabase.com/) (Auth & Database)
*   [Stripe](https://stripe.com/) (Pagamentos)

## 📦 Como Rodar

1.  Instale as dependências:
    ```bash
    npm install
    ```

2.  Configure as variáveis de ambiente:
    Renomeie `.env.local.example` para `.env.local` e adicione suas chaves do Supabase e Stripe.

3.  Rode o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

4.  Acesse [http://localhost:3000](http://localhost:3000).

## 📱 PWA

O projeto está configurado como PWA. Em dispositivos móveis, você pode "Adicionar à Tela Inicial" para uma experiência de aplicativo nativo.

## 📄 Estrutura do Banco de Dados

O schema do banco de dados está localizado em `supabase/migrations`. Ele inclui tabelas para:
*   `users`: Perfis de usuário.
*   `workouts`: Treinos e exercícios.
*   `plans` & `subscriptions`: Gestão de assinaturas.
*   `gamificacao`: Pontos e streaks.

---

Desenvolvido com foco em execução e simplicidade.
