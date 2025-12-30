'use client'

import { useQuiz } from '@/context/QuizContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Flame, Utensils, Trophy, Star, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { finalizeQuiz } from '@/app/actions/quiz'

// Mapeamentos para texto legível
const BODY_PARTS_MAP: Record<string, string> = {
  belly: 'a barriga',
  legs: 'as pernas',
  arms: 'os braços',
  back: 'as costas',
  butt: 'o bumbum'
}

const DREAMS_MAP: Record<string, string> = {
  clothes: 'voltar a usar suas roupas favoritas',
  photos: 'não ter mais vergonha de fotos',
  mirror: 'se sentir bem ao se olhar no espelho',
  kids: 'ter fôlego para brincar com as crianças',
  energy: 'ter mais energia no dia a dia',
  health: 'ter exames saudáveis e sem medo',
  intimacy: 'se sentir confiante na intimidade'
}

const BARRIERS_MAP: Record<string, string> = {
  discipline: 'manter a constância',
  hard_diets: 'dietas restritivas demais',
  confusion: 'não saber por onde começar',
  messy_workout: 'falta de organização nos treinos',
  time: 'falta de tempo',
  motivation: 'falta de apoio e motivação',
  pain: 'dores e limitações físicas'
}

export default function SummaryPage() {
  const { state, setCurrentStep } = useQuiz()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    setCurrentStep(11)
    
    // Check User Session
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      // Se usuário já logado, processa automaticamente
      if (data.user) {
        setProcessing(true)
        // Usa o plano do estado se existir, senão default para basic
        // Mas idealmente o usuário já tem um plano se está logado, 
        // então aqui estamos apenas salvando os dados do quiz no perfil dele.
        finalizeQuiz(state.selectedPlan || 'basic', state)
          .then(() => {
            // O redirecionamento acontece no server action, 
            // mas caso falhe ou retorne, forçamos aqui
            // window.location.href = '/dashboard' 
          })
          .catch(err => {
            console.error(err)
            setProcessing(false)
          })
      } else {
        setLoading(false)
      }
    })
  }, [setCurrentStep, state]) // Added state dependency

  const handleCheckout = async (plan: 'basic' | 'plus' | 'vip') => {
    if (processing) return
    setProcessing(true)
    // Lógica para usuário anônimo (Venda)
    router.push(`/register?plan=${plan}`)
  }

  // Se estiver processando (usuário logado sendo redirecionado), mostra loading
  if (loading || (user && processing)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#FF6B6B] rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {user ? 'Salvando seu perfil e gerando treino...' : 'Calculando seu plano personalizado...'}
        </h2>
        <p className="text-gray-500 animate-pulse">
          {user ? 'Quase lá!' : 'Cruzando seus dados com nossa metodologia...'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col pb-24 animate-in fade-in duration-700">
      {/* Header Personalizado */}
      <div className="bg-[#2A9D8F] text-white p-8 rounded-b-[40px] shadow-xl mb-8 -mx-6 px-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Seu plano de 30 dias para {name}</h1>
        <p className="opacity-90 font-medium">100% Personalizado</p>
      </div>

      <div className="space-y-8">
        {/* DIAGNÓSTICO PERSONALIZADO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 text-gray-700 leading-relaxed">
          <p className="font-bold text-lg text-[#2A9D8F]">{name}, olha o que eu entendi de você:</p>
          
          <ul className="space-y-3 text-sm md:text-base">
            <li className="flex items-start gap-2">
              <span className="text-[#2A9D8F] font-bold mt-1">•</span>
              <span>Hoje você está com <strong>{weight} kg</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2A9D8F] font-bold mt-1">•</span>
              <span>Sua meta é chegar perto de <strong>{targetWeight} kg</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2A9D8F] font-bold mt-1">•</span>
              <span>Você se sente incomodada principalmente com <strong>{bodyPart}</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2A9D8F] font-bold mt-1">•</span>
              <span>Você tem <strong>{time} min/dia</strong>, {freq}x por semana</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2A9D8F] font-bold mt-1">•</span>
              <span>O que mais te emociona é: <strong>{mainDream}</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2A9D8F] font-bold mt-1">•</span>
              <span>Seu maior desafio até hoje foi: <strong>{mainBarrier}</strong></span>
            </li>
          </ul>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <p className="font-bold text-gray-800 mb-3">Com base nisso, o plano que eu vou te propor agora é:</p>
            <ul className="space-y-3 text-sm md:text-base">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#FF6B6B] shrink-0 mt-0.5" />
                <span>Um desafio de 30 dias focado em perder barriga</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#FF6B6B] shrink-0 mt-0.5" />
                <span>Treinos de {time} min em casa, em vídeo, guiados</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#FF6B6B] shrink-0 mt-0.5" />
                <span>Uma dieta limpa e simples, montada pra sua rotina</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#FF6B6B] shrink-0 mt-0.5" />
                <span>Gamificação pra te manter no jogo (pontos, ranking, evolução)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* DIFERENCIAL */}
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center space-y-3">
          <Star className="w-8 h-8 text-blue-600 mx-auto" />
          <h3 className="font-bold text-blue-900 text-lg">Por que esse plano é diferente?</h3>
          <p className="text-blue-800 text-sm leading-relaxed">
            A diferença é que agora não é um plano genérico de blog.<br/><br/>
            É um plano desenhado pro <strong>SEU corpo</strong>, <strong>SUA rotina</strong> e <strong>SEUS motivos</strong>.
          </p>
        </div>

        <p className="text-center font-bold text-gray-800 text-lg px-4">
          {user ? 'Finalize a configuração do seu plano:' : 'Você escolhe abaixo como quer viver esse plano:'}
        </p>

        {/* PLANOS DE VENDA */}
        <div className="space-y-6">
          
          {/* BASIC */}
          <div className={`border rounded-2xl p-6 space-y-4 relative bg-white shadow-sm transition-all ${state.selectedPlan === 'basic' ? 'ring-4 ring-[#FF6B6B] scale-[1.02]' : ''}`}>
            {state.selectedPlan === 'basic' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF6B6B] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Você escolheu este
              </div>
            )}
            <h3 className="font-bold text-lg text-gray-800">Plano Básico</h3>
            <div className="text-3xl font-bold text-gray-900">R$ 97,00<span className="text-sm font-normal text-gray-500">/ano</span></div>
            <p className="text-xs text-gray-500 font-medium -mt-2">(12x R$ 9,90)</p>
            <ul className="text-sm space-y-2 text-gray-600">
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Treinos básicos</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Gamificação</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Dieta simples</li>
            </ul>
            <button onClick={() => handleCheckout('basic')} disabled={processing} className="w-full py-3 rounded-xl border-2 border-[#FF6B6B] text-[#FF6B6B] font-bold hover:bg-[#FF6B6B] hover:text-white transition-colors">
              {processing ? 'Processando...' : user ? 'Confirmar Plano Básico' : 'Começar com o Básico'}
            </button>
          </div>

          {/* PLUS (DESTAK) */}
          <div className={`border-2 border-[#2A9D8F] rounded-2xl p-6 space-y-4 relative bg-teal-50 shadow-xl z-10 transition-all ${state.selectedPlan === 'plus' ? 'ring-4 ring-[#2A9D8F] scale-110' : 'scale-105'}`}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#2A9D8F] text-white px-6 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-md">
              {state.selectedPlan === 'plus' ? 'Sua Escolha' : 'Mais Escolhido'}
            </div>
            <h3 className="font-bold text-xl text-[#2A9D8F]">Plano Plus</h3>
            <div className="text-4xl font-bold text-gray-900">R$ 197,00<span className="text-sm font-normal text-gray-500">/ano</span></div>
            <p className="text-xs text-gray-500 font-medium -mt-2">(12x R$ 19,90)</p>
            
            <div className="py-2">
              <p className="text-sm font-bold text-teal-800 mb-2">Tudo do Básico, mais:</p>
              <ul className="text-sm space-y-3 text-gray-700 font-medium">
                <li className="flex gap-2 items-center"><CheckCircle2 className="w-5 h-5 text-[#2A9D8F]"/> <strong>Treinos intermediários</strong></li>
                <li className="flex gap-2 items-center"><CheckCircle2 className="w-5 h-5 text-[#2A9D8F]"/> Dieta IA</li>
                <li className="flex gap-2 items-center"><CheckCircle2 className="w-5 h-5 text-[#2A9D8F]"/> Checklist</li>
              </ul>
            </div>
            
            <button onClick={() => handleCheckout('plus')} disabled={processing} className="w-full py-4 rounded-xl bg-[#2A9D8F] text-white font-bold shadow-lg hover:bg-[#21867a] transition-transform active:scale-95 text-lg">
              {processing ? 'Processando...' : user ? 'Confirmar Plano Plus' : 'Quero o Plano Plus'}
            </button>
          </div>

          {/* VIP */}
          <div className={`border rounded-2xl p-6 space-y-4 relative bg-white shadow-sm transition-all ${state.selectedPlan === 'vip' ? 'ring-4 ring-purple-600 scale-[1.02]' : ''}`}>
            {state.selectedPlan === 'vip' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Você escolheu este
              </div>
            )}
            <h3 className="font-bold text-lg text-purple-600">Plano VIP</h3>
            <div className="text-3xl font-bold text-gray-900">R$ 397,00<span className="text-sm font-normal text-gray-500">/ano</span></div>
            <p className="text-xs text-gray-500 font-medium -mt-2">(12x R$ 39,90)</p>
            <ul className="text-sm space-y-2 text-gray-600">
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500"/> Tudo do Plus</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500"/> Treinos avançados</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500"/> Biblioteca premium</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500"/> Status VIP</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500"/> Desconto renovação</li>
            </ul>
            <button onClick={() => handleCheckout('vip')} disabled={processing} className="w-full py-3 rounded-xl border-2 border-purple-600 text-purple-600 font-bold hover:bg-purple-600 hover:text-white transition-colors">
              {processing ? 'Processando...' : user ? 'Aplicar para VIP' : 'Quero ser VIP'}
            </button>
          </div>
        </div>

        <div className="text-center pb-8 space-y-2">
          <div className="flex justify-center gap-4 text-gray-400">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-sm">Garantia de 7 dias ou seu dinheiro de volta</span>
          </div>
        </div>
      </div>
    </div>
  )
}
