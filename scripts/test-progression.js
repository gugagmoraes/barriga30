
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://zuaivsrkvagjfjcjqwii.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1YWl2c3JrdmFnamZqY2pxd2lpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDcyMjczMiwiZXhwIjoyMDgwMjk4NzMyfQ.VVY-S14M6yO2RNYIbZivIpru-uMV-oqk3qyKXcRIwIY";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const TEST_USER_ID = '8721699d-c18a-4934-b025-e5b037ccc2ce';

async function runTests() {
    console.log('Iniciando Testes de Progressão e Planos...');

    // ==========================================
    // Cenário 1: Progressão de Nível - Usuário Básico
    // ==========================================
    console.log('\n--- Cenário 1: Usuário Básico (Iniciante) ---');
    
    console.log('Resetando usuário para Basic / Beginner...');
    const { error: resetError } = await supabase.from('users').update({ 
        workout_level: 'beginner', 
        plan_type: 'basic' 
    }).eq('id', TEST_USER_ID);
    if (resetError) console.error('Erro reset user:', resetError);

    await supabase.from('user_activity_log').delete().eq('user_id', TEST_USER_ID).eq('activity_type', 'workout_completed');
    await supabase.from('user_stats').update({ total_xp: 0 }).eq('user_id', TEST_USER_ID);

    console.log('Simulando 11 treinos (4A, 4B, 3C)...');
    const logs = [];
    const date = new Date().toISOString();
    for(let i=0; i<4; i++) logs.push({ user_id: TEST_USER_ID, activity_type: 'workout_completed', xp_earned: 50, metadata: { level: 'beginner', type: 'A', date } });
    for(let i=0; i<4; i++) logs.push({ user_id: TEST_USER_ID, activity_type: 'workout_completed', xp_earned: 50, metadata: { level: 'beginner', type: 'B', date } });
    for(let i=0; i<3; i++) logs.push({ user_id: TEST_USER_ID, activity_type: 'workout_completed', xp_earned: 50, metadata: { level: 'beginner', type: 'C', date } });
    
    const { error: insertError } = await supabase.from('user_activity_log').insert(logs);
    if (insertError) console.error('Erro ao inserir logs:', insertError);

    const { data: user1 } = await supabase.from('users').select('*').eq('id', TEST_USER_ID).single();
    console.log(`User Level: ${user1.workout_level} (Esperado: beginner)`);
    console.log(`User Plan: ${user1.plan_type} (Esperado: basic)`);
    
    // ==========================================
    // Cenário 2: Progressão de Nível - Usuário Plus
    // ==========================================
    console.log('\n--- Cenário 2: Usuário Plus (Iniciante -> Avançado) ---');

    console.log('Definindo usuário para Plus / Beginner...');
    await supabase.from('users').update({ 
        workout_level: 'beginner', 
        plan_type: 'plus' 
    }).eq('id', TEST_USER_ID);
    
    await supabase.from('user_activity_log').delete().eq('user_id', TEST_USER_ID).eq('activity_type', 'workout_completed');

    console.log('Simulando 12 treinos (4A, 4B, 4C)...');
    const logs2 = [];
    for(let i=0; i<4; i++) logs2.push({ user_id: TEST_USER_ID, activity_type: 'workout_completed', xp_earned: 50, metadata: { level: 'beginner', type: 'A', date } });
    for(let i=0; i<4; i++) logs2.push({ user_id: TEST_USER_ID, activity_type: 'workout_completed', xp_earned: 50, metadata: { level: 'beginner', type: 'B', date } });
    for(let i=0; i<4; i++) logs2.push({ user_id: TEST_USER_ID, activity_type: 'workout_completed', xp_earned: 50, metadata: { level: 'beginner', type: 'C', date } });
    
    await supabase.from('user_activity_log').insert(logs2);

    console.log('Simulando troca manual para Advanced...');
    await supabase.from('users').update({ workout_level: 'advanced' }).eq('id', TEST_USER_ID);

    const { data: user2 } = await supabase.from('users').select('*').eq('id', TEST_USER_ID).single();
    console.log(`User Level: ${user2.workout_level} (Esperado: advanced)`);

    // ==========================================
    // Cenário 3: Ganhos de XP
    // ==========================================
    console.log('\n--- Cenário 3: Ganhos de XP ---');
    
    console.log('Resetando XP e Logs...');
    await supabase.from('user_stats').update({ total_xp: 0 }).eq('user_id', TEST_USER_ID);
    await supabase.from('user_activity_log').delete().eq('user_id', TEST_USER_ID).eq('activity_type', 'workout_completed');

    console.log('Inserindo 5 treinos...');
    const logs3 = [];
    for(let i=0; i<5; i++) logs3.push({ user_id: TEST_USER_ID, activity_type: 'workout_completed', xp_earned: 50, metadata: { date } });
    
    await supabase.from('user_activity_log').insert(logs3);

    console.log('Aguardando processamento do trigger (2s)...');
    await new Promise(r => setTimeout(r, 2000));

    const { data: stats } = await supabase.from('user_stats').select('total_xp').eq('user_id', TEST_USER_ID).single();
    console.log(`Total XP: ${stats?.total_xp} (Esperado: 250)`);

    console.log('\nTestes Concluídos.');
}

runTests().catch(console.error);
