import { createClient } from '@/lib/supabase/server'
import { AddWeightDialog } from './add-weight-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, TrendingDown, Activity } from 'lucide-react'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Carregando...</div>

  // Fetch Data
  const { data: weightRecords } = await supabase
    .from('weight_records')
    .select('*')
    .eq('user_id', user.id)
    .order('recorded_at', { ascending: false })

  const { data: workoutLogs } = await supabase
    .from('workout_logs')
    .select('*, workouts(name, level, type)')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })

  const currentWeight = weightRecords?.[0]?.weight || '-'
  const startWeight = weightRecords?.[weightRecords.length - 1]?.weight || currentWeight
  const diff = typeof currentWeight === 'number' && typeof startWeight === 'number' ? (currentWeight - startWeight).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Meu Progresso</h1>
        <AddWeightDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peso Atual</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{currentWeight} kg</div>
                <p className="text-xs text-muted-foreground">
                    {Number(diff) <= 0 ? (
                        <span className="text-green-500 flex items-center">
                             {diff} kg desde o início
                        </span>
                    ) : (
                        <span className="text-red-500">
                            +{diff} kg desde o início
                        </span>
                    )}
                </p>
            </CardContent>
        </Card>
        
        {/* Placeholder for future measurements */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Treinos Realizados</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{workoutLogs?.length || 0}</div>
            </CardContent>
        </Card>
      </div>

      {/* History Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight History */}
        <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingDown className="h-5 w-5" /> Histórico de Peso
            </h2>
            <div className="bg-white rounded-lg border divide-y">
                {weightRecords?.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">Nenhum registro ainda.</div>
                )}
                {weightRecords?.map((record: any) => (
                    <div key={record.id} className="p-4 flex justify-between items-center">
                        <span className="font-medium">{record.weight} kg</span>
                        <span className="text-sm text-gray-500">
                            {new Date(record.recorded_at).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        {/* Workout History */}
        <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Histórico de Treinos
            </h2>
            <div className="bg-white rounded-lg border divide-y max-h-[400px] overflow-y-auto">
                {workoutLogs?.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">Nenhum treino realizado ainda.</div>
                )}
                {workoutLogs?.map((log: any) => (
                    <div key={log.id} className="p-4">
                        <div className="flex justify-between">
                            <span className="font-bold text-gray-800">{log.workouts?.name || 'Treino'}</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Concluído</span>
                        </div>
                        <div className="flex justify-between mt-1 text-sm text-gray-500">
                            <span>
                                {log.workouts?.type && `Treino ${log.workouts.type}`} • {log.workouts?.level}
                            </span>
                            <span>
                                {new Date(log.completed_at).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}
