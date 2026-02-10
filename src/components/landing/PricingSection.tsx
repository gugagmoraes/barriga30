'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Star, Zap } from 'lucide-react'
import { CountdownTimer } from './CountdownTimer'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Custom Modern Check Icon
const CheckIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={cn("w-5 h-5", className)}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const PricingSection = () => {
  const scrollToPlans = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const plansSection = document.getElementById('plans')
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="py-12 px-4 md:py-24 md:px-6 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION HEADER */}
        <div className="text-center mb-12 md:mb-16 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Barriga 30: A Sua Jornada de Transformação é <span className="text-[#FF4D4D]">SIMPLES</span>, <span className="text-[#FF4D4D]">PRAZEROSA</span> e <span className="text-[#FF4D4D]">RESULTADO</span>!
          </h2>
          <p className="text-lg md:text-2xl text-gray-600 font-medium">
            Treino que você consegue fazer, dieta que você consegue seguir. <br className="hidden md:block"/>
            Tudo na palma da sua mão!
          </p>
        </div>

        {/* EXCLUSIVE LAUNCH OFFER BLOCK */}
        <div className="relative mb-12 mx-auto max-w-4xl">
          {/* Decorative glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#FF4D4D] via-yellow-500 to-[#FF4D4D] rounded-3xl blur opacity-30 animate-pulse"></div>
          
          <div className="relative bg-gradient-to-br from-[#FF4D4D] to-[#d63030] rounded-2xl shadow-2xl p-6 md:p-10 text-white overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-48 h-48" />
            </div>

            <div className="flex flex-col items-center text-center relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-red-900 px-4 py-1.5 rounded-full font-black text-sm md:text-base uppercase tracking-wider shadow-lg transform -rotate-1">
                🔥 Oferta de Lançamento Exclusiva! 🔥
              </div>

              <h3 className="text-2xl md:text-4xl font-extrabold leading-tight">
                Os 100 primeiros a garantir o Plano Essencial recebem <br className="hidden md:block"/>
                <span className="block mt-2">
                   1 ano de <span className="opacity-70 line-through text-xl md:text-2xl font-normal mr-2">R$197,00</span>
                   <span className="text-yellow-300">por apenas R$99,90!</span>
                </span>
              </h3>

              <p className="text-lg md:text-xl text-white/90 font-medium bg-black/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                Você economiza 50%! O valor de uma vida saudável nunca foi tão acessível!
              </p>

              <div className="w-full max-w-md mx-auto my-4">
                <CountdownTimer />
              </div>

              <a
                href="#plans"
                onClick={scrollToPlans}
                className="w-full md:w-auto inline-flex items-center justify-center text-center whitespace-normal rounded-xl text-lg md:text-2xl font-black transition-all disabled:pointer-events-none disabled:opacity-50 bg-yellow-400 text-red-900 hover:bg-yellow-300 hover:scale-105 py-6 px-8 md:py-8 md:px-10 shadow-xl border-b-4 border-yellow-600 leading-tight"
              >
                Garantir Meu Plano Essencial Agora!
              </a>
              
              <p className="text-xs md:text-sm text-white/70 opacity-80">
                *Oferta válida por tempo limitado ou até esgotarem as vagas.
              </p>
            </div>
          </div>
        </div>

        {/* PHILOSOPHY SLOGAN */}
        <div className="mb-16 text-center max-w-4xl mx-auto px-4">
           <div className="bg-white border-l-4 border-[#FF4D4D] shadow-md rounded-r-xl p-6 md:p-8 text-left md:text-center">
              <h4 className="text-[#FF4D4D] font-bold uppercase tracking-widest text-sm mb-2">Nossa Filosofia</h4>
              <p className="text-lg md:text-xl text-gray-800 font-medium leading-relaxed">
                "Treino bom é o treino que você consegue fazer. Dieta boa é aquela que você consegue seguir. <br className="hidden md:block"/>
                Com <span className="font-bold text-gray-900">Barriga 30</span>, a sua transformação é simples, gamificada e ao seu alcance, tudo na sua tela!"
              </p>
           </div>
        </div>

        {/* PLANS SELECTION TITLE */}
        <div className="text-center mb-12" id="plans">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
            Escolha o Plano Perfeito para Sua Jornada de Transformação!
          </h3>
        </div>

        {/* PLANS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto items-start">
          
          {/* PLANO ESSENCIAL (BÁSICO) */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300 h-full relative group">
            <div className="p-6 md:p-8 flex-1">
              <h4 className="text-2xl font-black text-gray-800 mb-4">Barriga 30 <br/><span className="text-gray-500">Essencial</span></h4>
              
              <div className="flex flex-col mb-2">
                <p className="text-sm text-gray-400 font-medium mb-1">De <span className="line-through decoration-red-400">R$ 197,00</span> por</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">R$ 99,90</span>
                  <span className="text-gray-500 font-medium">/ano</span>
                </div>
                <p className="text-sm font-bold text-green-600 mt-2 bg-green-50 inline-block px-2 py-1 rounded w-fit">
                  ou 12x de R$ 8,33 <span className="font-normal text-gray-500 text-xs">(sem juros)</span>
                </p>
              </div>

              <div className="h-px bg-gray-100 my-6"></div>

              <ul className="space-y-4 mb-8">
                {[
                  "1 Programa de Treino Fixo (ABC)",
                  "1 Dieta Personalizada (1x no início)",
                  "Trackers de Hidratação e Refeições",
                  "Gamificação Básica (XP, Níveis)",
                  "Central de Ajuda via Bot",
                  "Acesso de 1 ano à plataforma"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm md:text-base text-gray-700 items-start">
                    <div className="mt-0.5 bg-gray-100 p-1.5 rounded-full shrink-0">
                      <CheckIcon className="w-3.5 h-3.5 text-gray-600" />
                    </div>
                    <span className="leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto">
              <Link
                href="/checkout/basic"
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-lg font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full py-6 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400'
                )}
              >
                Escolher Plano Essencial
              </Link>
            </div>
          </div>

          {/* PLANO EVOLUÇÃO (PLUS - RECOMENDADO) */}
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#FF4D4D] overflow-hidden flex flex-col transform md:-translate-y-4 z-10 h-full relative ring-4 ring-[#FF4D4D]/10">
            <div className="absolute top-0 inset-x-0 h-2 bg-[#FF4D4D]"></div>
            
            <div className="bg-[#FF4D4D] text-white text-center text-sm font-bold py-2 uppercase tracking-wide flex items-center justify-center gap-2 shadow-md">
              <Star className="w-4 h-4 fill-current" /> MAIS POPULAR <Star className="w-4 h-4 fill-current" />
            </div>

            <div className="p-6 md:p-8 flex-1">
              <h4 className="text-2xl font-black text-gray-900 mb-4">Barriga 30 <br/><span className="text-[#FF4D4D]">Evolução</span></h4>
              
              <div className="flex flex-col mb-2">
                <p className="text-sm text-gray-400 font-medium mb-1">De <span className="line-through decoration-red-400">R$ 297,00</span> por</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-[#FF4D4D]">R$ 197,00</span>
                  <span className="text-gray-500 font-medium">/ano</span>
                </div>
                 <p className="text-base font-bold text-green-700 mt-2 bg-green-50 inline-block px-3 py-1 rounded w-fit border border-green-100">
                  ou 12x de R$ 16,42 <span className="font-normal text-gray-600 text-xs">(sem juros)</span>
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl my-6 border border-orange-100">
                <p className="text-sm font-bold text-orange-800 mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-orange-800" /> Por que este plano?
                </p>
                <p className="text-xs text-orange-700 leading-relaxed">A melhor relação custo-benefício para quem quer garantir resultados a longo prazo com progressão constante.</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="font-bold text-gray-900 flex gap-3 items-center">
                  <div className="bg-[#FF4D4D]/10 p-1.5 rounded-full shrink-0">
                    <CheckIcon className="w-4 h-4 text-[#FF4D4D]" />
                  </div>
                  TUDO do Plano Essencial, MAIS:
                </li>
                {[
                  { text: "Programas de Treino Progressivos (Iniciante ao Avançado)", highlight: true },
                  { text: "Dietas Dinâmicas e Adaptativas (Evita estagnação)", highlight: true },
                  { text: "Gamificação Completa (Conquistas, Badges)", highlight: false },
                  { text: "Histórico Completo de Progresso", highlight: false },
                  { text: "Suporte Inteligente Acelerado", highlight: false },
                  { text: "Acesso de 1 ano à plataforma", highlight: false }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm md:text-base text-gray-700 items-start">
                    <div className={cn("mt-0.5 p-1.5 rounded-full shrink-0", item.highlight ? "bg-[#FF4D4D]/20" : "bg-gray-100")}>
                      <CheckIcon className={cn("w-3.5 h-3.5", item.highlight ? "text-[#FF4D4D]" : "text-gray-600")} />
                    </div>
                    <span className={cn("leading-tight", item.highlight ? "font-bold text-gray-900" : "")}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 bg-orange-50/50 mt-auto border-t border-orange-100">
              <Link
                href="/checkout/plus"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xl font-black transition-all w-full py-8 bg-[#FF4D4D] hover:bg-[#e63e3e] text-white shadow-xl shadow-orange-200 hover:shadow-orange-300 transform hover:scale-[1.02] border-b-4 border-[#cc0000]"
              >
                Escolher Plano Evolução
              </Link>
            </div>
          </div>

          {/* PLANO PREMIUM (VIP) */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300 h-full relative group">
            <div className="p-6 md:p-8 flex-1">
              <h4 className="text-2xl font-black text-gray-800 mb-4">Barriga 30 <br/><span className="text-purple-600">Premium</span></h4>
              
              <div className="flex flex-col mb-2">
                <p className="text-sm text-gray-400 font-medium mb-1">De <span className="line-through decoration-red-400">R$ 497,00</span> por</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">R$ 297,00</span>
                  <span className="text-gray-500 font-medium">/ano</span>
                </div>
                <p className="text-sm font-bold text-purple-600 mt-2 bg-purple-50 inline-block px-2 py-1 rounded w-fit">
                  ou 12x de R$ 24,75 <span className="font-normal text-gray-500 text-xs">(sem juros)</span>
                </p>
              </div>

              <div className="h-px bg-gray-100 my-6"></div>

              <ul className="space-y-4 mb-8">
                <li className="font-bold text-gray-900 flex gap-3 items-center">
                   <div className="bg-purple-100 p-1.5 rounded-full shrink-0">
                    <CheckIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  TUDO do Plano Evolução, MAIS:
                </li>
                {[
                  "Treinos Especiais para Dias Críticos (TPM, etc)",
                  "Biblioteca Exclusiva (Glúteos, Abdômen...)",
                  "Desconto de R$100 na Renovação",
                  "Acesso Antecipado a Novidades",
                  "Suporte Inteligente VIP",
                  "Acesso de 1 ano à plataforma"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm md:text-base text-gray-700 items-start">
                    <div className="mt-0.5 bg-purple-50 p-1.5 rounded-full shrink-0">
                      <CheckIcon className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <span className="leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto">
              <Link
                href="/checkout/vip"
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-lg font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full py-6 border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-900 hover:border-purple-300'
                )}
              >
                Escolher Plano Premium
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
