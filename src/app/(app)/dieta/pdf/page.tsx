import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PrintButton from './print-button'

export default async function DietPdfPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: snapshot } = await supabase
    .from('diet_snapshots')
    .select('*, snapshot_meals(*, snapshot_items(*))')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!snapshot) return <div>Nenhuma dieta encontrada.</div>

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()

  return (
    <div className="max-w-[210mm] mx-auto bg-white p-8 min-h-screen text-black print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
            <h1 className="text-3xl font-bold mb-2">Plano Alimentar Personalizado</h1>
            <p className="text-gray-600">MVP Barriga 30</p>
        </div>
        <div className="text-right">
            <p className="font-semibold">{profile?.name || 'Usuário'}</p>
            <p className="text-sm text-gray-500">Meta Diária: {snapshot.daily_calories} kcal</p>
            <p className="text-sm text-gray-500">Água: {snapshot.macros.water_target_ml}ml ({snapshot.macros.bottles_count}x garrafas)</p>
        </div>
      </div>

      <div className="mb-6 no-print">
         <PrintButton />
      </div>

      {/* Meals */}
      <div className="space-y-8">
        {snapshot.snapshot_meals
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((meal: any) => (
            <div key={meal.id} className="border rounded-lg p-4 break-inside-avoid">
                <div className="flex justify-between items-center mb-3 border-b pb-2">
                    <h2 className="text-xl font-bold">{meal.name}</h2>
                    <div className="text-right">
                         <span className="text-sm text-gray-500 mr-3">{meal.time_of_day?.slice(0, 5)}</span>
                         <span className="text-sm font-semibold">
                            {meal.snapshot_items.reduce((acc: number, i: any) => acc + (i.calories || 0), 0)} kcal
                             <span className="ml-2 text-xs font-normal text-gray-500">
                                (P: {meal.snapshot_items.reduce((acc: number, i: any) => acc + (i.protein || 0), 0).toFixed(0)}g / 
                                 C: {meal.snapshot_items.reduce((acc: number, i: any) => acc + (i.carbs || 0), 0).toFixed(0)}g / 
                                 G: {meal.snapshot_items.reduce((acc: number, i: any) => acc + (i.fat || 0), 0).toFixed(0)}g)
                             </span>
                         </span>
                    </div>
                </div>
                
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500">
                            <th className="pb-2">Alimento</th>
                            <th className="pb-2 text-right">Quantidade</th>
                            <th className="pb-2 text-right">Kcal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meal.snapshot_items.map((item: any) => (
                            <tr key={item.id} className="border-t border-gray-100">
                                <td className="py-2">{item.name}</td>
                                <td className="py-2 text-right font-medium">{item.quantity}</td>
                                <td className="py-2 text-right text-gray-500">{item.calories}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t text-center text-xs text-gray-400">
        Gerado automaticamente por MVP Barriga 30. Consulte sempre um nutricionista.
      </div>

      <style>{`
        @media print {
            .no-print { display: none; }
            body { background: white; }
        }
      `}</style>
    </div>
  )
}
