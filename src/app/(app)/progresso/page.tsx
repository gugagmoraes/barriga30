import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Scale, Calendar } from 'lucide-react'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch weight records
  const { data: weightRecords } = await supabase
    .from('weight_records')
    .select('*')
    .eq('user_id', user?.id)
    .order('recorded_at', { ascending: false })
    .limit(5)

  // Fetch photos
  const { data: photos } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', user?.id)
    .order('taken_at', { ascending: false })
    .limit(4)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Meu Progresso</h1>

      {/* Weight Section */}
      <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                  <Scale className="h-5 w-5 mr-2 text-primary" />
                  Peso
              </CardTitle>
              <Button size="sm" variant="outline">Registrar Peso</Button>
          </CardHeader>
          <CardContent>
              {weightRecords && weightRecords.length > 0 ? (
                  <div className="space-y-2">
                      {weightRecords.map((record) => (
                          <div key={record.id} className="flex justify-between border-b pb-2 last:border-0">
                              <span className="text-gray-600">{new Date(record.recorded_at).toLocaleDateString()}</span>
                              <span className="font-bold">{record.weight} kg</span>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-4 text-gray-500">
                      Nenhum registro ainda.
                  </div>
              )}
          </CardContent>
      </Card>

      {/* Photos Section */}
      <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-primary" />
                  Fotos
              </CardTitle>
              <Button size="sm" variant="outline">Upload</Button>
          </CardHeader>
          <CardContent>
              {photos && photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                      {photos.map((photo) => (
                          <div key={photo.id} className="aspect-square bg-gray-100 rounded overflow-hidden relative">
                              {/* Use Next.js Image or simple img tag. For Supabase Storage signed URL, we usually need client side fetching or server signing. */}
                              {/* For MVP, assuming public or handled url */}
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                  Foto
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-4 text-gray-500">
                      Nenhuma foto ainda.
                  </div>
              )}
          </CardContent>
      </Card>

      {/* Workout History */}
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Histórico de Treinos
              </CardTitle>
          </CardHeader>
          <CardContent>
               <div className="text-center py-4 text-gray-500">
                   Calendário em breve.
               </div>
          </CardContent>
      </Card>
    </div>
  )
}
