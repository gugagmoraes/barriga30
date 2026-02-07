'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Check, Star, Trophy, Zap, Clock, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { CountdownTimer } from './CountdownTimer'
import { cn } from '@/lib/utils'

export const PricingSection = () => {
  return (
    <section className="py-12 px-4 md:py-24 md:px-6 bg-[#FDFBF7]" id="plans">
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
        <div className="relative mb-16 mx-auto max-w-4xl">
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
                <span className="text-yellow-300">1 ano por apenas R$99,90!</span>
              </h3>

              <p className="text-lg md:text-xl text-white/90 font-medium">
                O valor de uma vida saudável nunca foi tão acessível!
              </p>

              <div className="w-full max-w-md mx-auto my-4">
                <CountdownTimer />
              </div>

              <Link href="/checkout?plan=basic-offer" className="w-full md:w-auto">
                <Button className="w-full md:w-auto bg-yellow-400 text-red-900 hover:bg-yellow-300 hover:scale-105 transition-all font-black text-xl md:text-2xl py-8 px-10 rounded-xl shadow-xl border-b-4 border-yellow-600">
                  Garantir Meu Plano Essencial Agora!
                </Button>
              </Link>
              
              <p className="text-xs md:text-sm text-white/70 opacity-80">
                *Oferta válida por tempo limitado ou até esgotarem as vagas.
              </p>
            </div>
          </div>
        </div>

        {/* PLANS SELECTION */}
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
            Escolha o Plano Perfeito para Sua Jornada de Transformação!
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto items-start">
          
          {/* PLANO ESSENCIAL (BÁSICO) */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300 h-full relative group">
            <div className="p-6 md:p-8 flex-1">
              <h4 className="text-2xl font-black text-gray-800 mb-2">Barriga 30 <br/><span className="text-gray-500">Essencial</span></h4>
              
              <div className="flex flex-col mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">R$ 99,90</span>
                  <span className="text-gray-500 font-medium">/ano</span>
                </div>
                <p className="text-sm text-red-500 font-bold mt-1">Oferta Lançamento (era R$ 197)</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "1 Programa de Treino Fixo (ABC)",
                  "1 Dieta Personalizada (1x no início)",
                  "Trackers de Hidratação e Refeições",
                  "Gamificação Básica (XP, Níveis)",
                  "Central de Ajuda via Bot",
                  "Acesso de 1 ano à plataforma"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm md:text-base text-gray-700">
                    <div className="mt-0.5 bg-gray-100 p-1 rounded-full shrink-0">
                      <Check className="w-4 h-4 text-gray-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto">
              <Link href="/checkout?plan=basic-offer" className="block">
                <Button variant="outline" className="w-full py-6 text-lg font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400 transition-all rounded-xl">
                  Escolher Plano Essencial
                </Button>
              </Link>
            </div>
          </div>

          {/* PLANO EVOLUÇÃO (PLUS - RECOMENDADO) */}
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#FF4D4D] overflow-hidden flex flex-col transform md:-translate-y-4 z-10 h-full relative">
            <div className="absolute top-0 inset-x-0 h-2 bg-[#FF4D4D]"></div>
            
            <div className="bg-[#FF4D4D] text-white text-center text-sm font-bold py-2 uppercase tracking-wide flex items-center justify-center gap-2">
              <Star className="w-4 h-4 fill-current" /> MAIS POPULAR <Star className="w-4 h-4 fill-current" />
            </div>

            <div className="p-6 md:p-8 flex-1">
              <h4 className="text-2xl font-black text-gray-900 mb-2">Barriga 30 <br/><span className="text-[#FF4D4D]">Evolução</span></h4>
              
              <div className="flex flex-col mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-[#FF4D4D]">R$ 197</span>
                  <span className="text-gray-500 font-medium">/ano</span>
                </div>
                <p className="text-sm text-gray-400 font-medium mt-1 line-through">De R$ 297,00</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl mb-6 border border-orange-100">
                <p className="text-sm font-bold text-orange-800 mb-2">Por que este plano?</p>
                <p className="text-xs text-orange-700">A melhor relação custo-benefício para quem quer garantir resultados a longo prazo com progressão constante.</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="font-bold text-gray-900 flex gap-3 items-center">
                  <div className="bg-[#FF4D4D]/10 p-1 rounded-full shrink-0">
                    <Check className="w-4 h-4 text-[#FF4D4D]" />
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
                  <li key={i} className="flex gap-3 text-sm md:text-base text-gray-700">
                    <div className={cn("mt-0.5 p-1 rounded-full shrink-0", item.highlight ? "bg-[#FF4D4D]/20" : "bg-gray-100")}>
                      <Check className={cn("w-4 h-4", item.highlight ? "text-[#FF4D4D]" : "text-gray-600")} />
                    </div>
                    <span className={item.highlight ? "font-bold text-gray-900" : ""}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 bg-orange-50/50 mt-auto border-t border-orange-100">
              <Link href="/checkout?plan=evolution" className="block">
                <Button className="w-full py-8 text-xl font-black bg-[#FF4D4D] hover:bg-[#e63e3e] text-white shadow-xl shadow-orange-200 hover:shadow-orange-300 transition-all transform hover:scale-[1.02] rounded-xl border-b-4 border-[#cc0000]">
                  Escolher Plano Evolução
                </Button>
              </Link>
            </div>
          </div>

          {/* PLANO PREMIUM (VIP) */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300 h-full relative group">
            <div className="p-6 md:p-8 flex-1">
              <h4 className="text-2xl font-black text-gray-800 mb-2">Barriga 30 <br/><span className="text-purple-600">Premium</span></h4>
              
              <div className="flex flex-col mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">R$ 297</span>
                  <span className="text-gray-500 font-medium">/ano</span>
                </div>
                <p className="text-sm text-gray-400 font-medium mt-1 line-through">De R$ 497,00</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="font-bold text-gray-900 flex gap-3 items-center">
                   <div className="bg-purple-100 p-1 rounded-full shrink-0">
                    <Check className="w-4 h-4 text-purple-600" />
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
                  <li key={i} className="flex gap-3 text-sm md:text-base text-gray-700">
                    <div className="mt-0.5 bg-purple-50 p-1 rounded-full shrink-0">
                      <Check className="w-4 h-4 text-purple-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto">
              <Link href="/checkout?plan=premium" className="block">
                <Button variant="outline" className="w-full py-6 text-lg font-bold border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-900 hover:border-purple-300 transition-all rounded-xl">
                  Escolher Plano Premium
                </Button>
              </Link>
            </div>
          </div>

        </div>

        {/* SLOGAN FOOTER */}
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <div className="inline-block relative">
            <div className="absolute -inset-1 bg-yellow-200 rounded-lg transform -rotate-1"></div>
            <p className="relative bg-white px-6 py-4 rounded-lg border border-gray-200 text-lg md:text-xl font-bold text-gray-800 shadow-sm italic">
              "Treino bom é o treino que você consegue fazer. <br className="md:hidden"/>
              Dieta boa é aquela que você consegue seguir."
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
