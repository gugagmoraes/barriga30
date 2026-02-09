const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🚀 Atualizando URLs dos vídeos de treino...');

  const updates = [
    { name: 'Iniciante 1: Core Básico', level: 'beginner', url: 'https://player.mediadelivery.net/embed/596490/6f95ded6-a3d2-4f96-808d-a745ae0afa2e' },
    { name: 'Iniciante 2: Queima Leve', level: 'beginner', url: 'https://player.mediadelivery.net/embed/596490/74dcf17d-7f36-41a3-adba-a2665b05fa45' },
    { name: 'Iniciante 3: Fortalecimento', level: 'beginner', url: 'https://player.mediadelivery.net/embed/596490/ef0039f1-df26-4574-bda3-bb4663751ccb' },
    { name: 'Intermediário 1: Hiit Abdominal', level: 'intermediate', url: 'https://player.mediadelivery.net/embed/596490/e302e40c-e48c-411d-b820-cfdfec351270' },
    { name: 'Intermediário 2: Queima Total', level: 'intermediate', url: 'https://player.mediadelivery.net/embed/596490/abad7ab5-0b68-4172-adb5-09e260367fbc' },
    { name: 'Intermediário 3: Core de Ferro', level: 'intermediate', url: 'https://player.mediadelivery.net/embed/596490/777ef8ed-3946-4a6e-a6f8-10476e4888af' },
    { name: 'Avançado 1: Six Pack Attack', level: 'advanced', url: 'https://player.mediadelivery.net/embed/596490/0535c9ae-80c5-4ad3-b326-deb7d82a1e18' },
    { name: 'Avançado 2: Derrete Gordura', level: 'advanced', url: 'https://player.mediadelivery.net/embed/596490/11c2e7cb-c5a7-4c87-a84f-4af64dfde8fc' },
    { name: 'Avançado 3: Desafio 30 Dias', level: 'advanced', url: 'https://player.mediadelivery.net/embed/596490/4e01329b-8b2e-41c3-8400-4f21374c6050' },
  ];

  for (const update of updates) {
    const { error } = await supabase
      .from('workouts')
      .update({ video_url: update.url })
      .eq('name', update.name)
      .eq('level', update.level);

    if (error) {
      console.error(`❌ Erro ao atualizar ${update.name} (${update.level}):`, error.message);
    } else {
      console.log(`✅ ${update.name} (${update.level}) atualizado com sucesso.`);
    }
  }

  console.log('🎉 Atualização concluída!');
}

runMigration();
