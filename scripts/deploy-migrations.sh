#!/bin/bash

# Se as variáveis de ambiente necessárias estiverem presentes, tenta aplicar migrations
if [ -n "$SUPABASE_ACCESS_TOKEN" ] && [ -n "$SUPABASE_PROJECT_REF" ]; then
  echo "🚀 Iniciando deploy de migrations do Supabase..."
  
  # Login não interativo
  npx supabase login --token "$SUPABASE_ACCESS_TOKEN"
  
  # Link com o projeto
  npx supabase link --project-ref "$SUPABASE_PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"
  
  # Aplica migrations (push envia para o remote)
  # Usamos --linked para garantir que vai para o projeto linkado acima
  # O uso de db push é seguro em CI/CD para aplicar migrations pendentes
  echo "📦 Aplicando migrations..."
  npx supabase db push --linked
  
  echo "✅ Migrations aplicadas com sucesso!"
else
  echo "⚠️ Variáveis SUPABASE_ACCESS_TOKEN ou SUPABASE_PROJECT_REF não encontradas."
  echo "ℹ️ Pulando deploy automático de migrations."
fi
