'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Play, ShieldCheck, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import RuixenCarouselWave, { RuixenCardProps } from '@/components/ui/ruixen-carousel-wave'
import { TestimonialsMarquee } from '@/components/ui/testimonials-columns-1'

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-100 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left font-bold text-gray-900 hover:bg-gray-50 transition"
      >
        <span className="text-base md:text-lg">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-[#FF4D4D]" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {isOpen && (
        <div className="p-5 pt-0 text-gray-600 leading-relaxed border-t border-gray-50 bg-gray-50/50 text-base">
          {answer}
        </div>
      )}
    </div>
  )
}

const CarouselPlaceholder = ({ title, subtitle, items, caption }: { title: string, subtitle?: string, items: string[], caption?: React.ReactNode }) => {
  // Use local images from public/images
  // We'll shuffle them or map them to the items
  const localImages = [
    '/images/07e6400b-2cdd-4d46-867b-42bb028171b4.jpg',
    '/images/0867ece7-dd4b-4a96-b167-087a99162de8.jpg',
    '/images/10be440b-b7e7-4296-b035-27ffc6c618e1.jpg',
    '/images/1216e8a8-447c-4a91-bf40-165493aa06c9.jpg',
    '/images/32ba134c-469a-4a16-9492-fe027e7f4148.jpg',
    '/images/512a8647-4ec9-4508-95e7-4fc73b4dace6.jpg',
    '/images/5bde57b0-141a-42ea-9927-8b1830a1d89a.jpg',
    '/images/6d3a8ba6-b04c-4ede-ab81-dfa86ca79002.jpg',
    '/images/6f849cbe-9ce2-428e-9fcb-75d29a8bf0e9.jpg',
    '/images/7e4da666-0f29-4a09-a7c4-a36a6d1dad06.jpg',
    '/images/912fc726-93fb-44aa-953e-bcdb4566c9b3.jpg',
    '/images/a9559678-01c8-4a49-a649-6e4d87f52a32.jpg',
    '/images/b00b1aae-ed78-46fb-ae73-2f8c9047c477.jpg',
    '/images/b42cc23a-f9bf-4fd9-a09d-aae35b310741.jpg',
    '/images/bec5ec23-1dbb-43f7-b7c7-60a71144f8c8.jpg',
    '/images/d646f0f6-47f4-44be-a9f9-2b1f534cfb36.jpg',
    '/images/d66cc231-a61a-41ed-bb9a-10ef68ba5da7.jpg',
    '/images/da37c6b9-f401-4dea-a4be-bb6a9e7bd9dd.jpg',
    '/images/edf50bb5-09af-438c-a571-b0cd8dbe6152.jpg'
  ]

  const mappedTestimonials = items.map((item, index) => ({
    text: item, // Using the copy text as caption
    image: localImages[index % localImages.length],
    name: 'Comentário Real',
    role: 'Canal Músculos e Corpo Definido'
  }))

  return (
    <TestimonialsMarquee 
      testimonials={mappedTestimonials}
      title={title}
      subtitle={subtitle}
      caption={caption}
    />
  )
}

import { PricingSection } from '@/components/landing/PricingSection'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* Header / Logo */}
      <header className="w-full py-4 px-4 flex justify-center bg-[#FF4D4D] shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-center gap-2">
          <span className="text-white text-xl md:text-2xl font-black tracking-wider uppercase">Barriga 30</span>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="pt-8 pb-12 px-4 md:py-20 md:px-6 bg-[#FDFBF7] flex flex-col items-center overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[500px] bg-gradient-to-b from-orange-50/50 to-transparent -z-10 rounded-b-[50%]"></div>

          <div className="max-w-4xl mx-auto text-center space-y-6 w-full relative z-10">
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-[1.15] text-gray-900 px-2 md:px-0 tracking-tight">
              Seque a barriga em <span className="text-[#FF4D4D]">30 dias</span> com treinos rápidos e sem dietas malucas — mesmo sem tempo, sem academia e sem sofrimento
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-2xl text-gray-700 leading-relaxed px-2 md:px-0 max-w-2xl mx-auto">
              Treinos de <span className="font-bold text-gray-900">15 a 30 minutos</span>, alimentação simples e um método inteligente que se adapta à sua rotina, ao seu corpo e até aos seus dias difíceis.
            </p>

            {/* Social Proof / Hook */}
            <div className="bg-white border border-yellow-200 p-3 md:p-5 rounded-xl shadow-sm inline-block mx-4 max-w-[90%] md:max-w-none">
              <p className="text-xs md:text-lg text-yellow-800 font-medium flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-center">
                 <span>👉 Não é sobre força de vontade.</span> 
                 <span>É sobre <span className="font-bold">método certo + constância possível</span>.</span>
              </p>
            </div>

            {/* VSL Area - Mobile Optimized */}
            <div className="mt-8 mb-8 p-1 bg-gradient-to-b from-gray-100 to-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl mx-auto">
              <div className="bg-white rounded-xl p-4 md:p-8 space-y-6">
                <div className="space-y-2 text-center">
                  <p className="font-bold text-gray-900 text-lg md:text-xl animate-pulse">
                    Antes de te explicar tudo, assista ao vídeo abaixo para entender:
                  </p>
                </div>

                {/* Video Embed */}
                <div className="aspect-video w-full bg-black rounded-lg md:rounded-xl overflow-hidden shadow-2xl">
                  <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                    <iframe 
                      src="https://player.mediadelivery.net/embed/586050/dbe465da-c11b-41d0-9b92-15ea856a65a3?autoplay=false&loop=false&muted=false&preload=false&responsive=true" 
                      loading="lazy" 
                      style={{ border: 0, position: 'absolute', top: 0, height: '100%', width: '100%' }} 
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" 
                      allowFullScreen={true}
                    ></iframe>
                  </div>
                </div>
                
                {/* Benefits List inside VSL box for context */}
                <ul className="text-left space-y-3 max-w-xl mx-auto text-gray-700 text-base md:text-lg pt-2">
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 bg-green-100 p-1 rounded-full shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span>Por que <span className="font-bold text-gray-900">treinos curtos funcionam melhor</span> do que treinos longos</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 bg-green-100 p-1 rounded-full shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span>O erro que faz a maioria das mulheres <span className="font-bold text-gray-900">não perder barriga</span>, mesmo se esforçando</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 bg-green-100 p-1 rounded-full shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span>Como mulheres comuns estão <span className="font-bold text-gray-900">secando a barriga em casa</span>, sem academia</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 bg-green-100 p-1 rounded-full shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span>Por que <span className="font-bold text-gray-900">dieta radical só atrasa</span> seus resultados</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2 px-2 w-full max-w-md mx-auto md:max-w-none">
               <Link href="#plans" className="block w-full">
                <Button className="w-full md:w-auto text-lg md:text-2xl font-black py-8 md:py-10 px-8 md:px-16 rounded-2xl shadow-[0_10px_40px_-10px_rgba(255,77,77,0.6)] bg-[#FF4D4D] hover:bg-[#ff3333] text-white transform hover:scale-[1.02] active:scale-95 transition-all duration-300 border-b-4 border-[#cc0000] whitespace-normal h-auto leading-tight uppercase tracking-wide">
                  QUERO SECAR MINHA BARRIGA EM 30 DIAS
                </Button>
               </Link>
            </div>

            {/* Frase Âncora 1 */}
            <div className="mt-8 text-center space-y-1 animate-fade-in-up">
              <p className="text-yellow-700 font-bold text-lg md:text-xl">💛 Chegou a hora de cuidar de você.</p>
              <p className="text-gray-600 font-medium text-base md:text-lg">✨ Porque você é imagem e semelhança de Deus.</p>
            </div>
          </div>
        </section>

        {/* DEMONSTRATION / METHOD */}
        <section className="py-12 px-4 md:py-20 md:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                DEMONSTRAÇÃO — COMO O BARRIGA 30 FUNCIONA NA PRÁTICA
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                O Barriga 30 não é um treino genérico. <br className="hidden md:block"/>
                <span className="font-bold bg-yellow-100 px-1">É um aplicativo inteligente</span> que cria um <span className="font-bold bg-yellow-100 px-1">plano diário feito para você</span>.
              </p>
              <div className="mt-6 inline-block bg-blue-50 text-blue-800 px-4 py-2 rounded-full font-bold text-base">
                🧠 Método 30D PersonalFit
              </div>
            </div>

            <div className="space-y-6 md:space-y-8 relative">
              {/* Connecting Line (Desktop only) */}
              <div className="hidden md:block absolute left-[23px] top-8 bottom-8 w-0.5 bg-gray-100 -z-10"></div>

              {/* Step 1 */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start bg-gray-50 md:bg-transparent p-6 md:p-0 rounded-2xl">
                <div className="bg-[#FF4D4D] text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 shadow-lg mx-auto md:mx-0">1</div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Diagnóstico Smart</h3>
                  <p className="text-gray-700 mb-4 font-medium text-base">Um raio-x do seu corpo e da sua rotina:</p>
                  <ul className="space-y-2 text-gray-600 mb-4 text-base md:text-lg inline-block text-left bg-white md:bg-transparent p-4 md:p-0 rounded-xl w-full">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Seu nível (iniciante → avançada)</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Tempo disponível por dia</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Preferências alimentares</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Dias delicados (TPM, baixa energia, doença)</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Metas automáticas para os próximos 30 dias</li>
                  </ul>
                  <p className="text-blue-600 font-bold italic text-sm md:text-base">👉 Aqui você para de seguir plano genérico.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start bg-gray-50 md:bg-transparent p-6 md:p-0 rounded-2xl">
                <div className="bg-[#FF4D4D] text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 shadow-lg mx-auto md:mx-0">2</div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Plano 360 Personalizado</h3>
                  <ul className="space-y-3 text-gray-600 mb-4 text-base md:text-lg inline-block text-left bg-white md:bg-transparent p-4 md:p-0 rounded-xl w-full">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D] mt-2.5 shrink-0"></div> 
                      <span className="leading-tight"><span className="font-bold">Treinos de 10 a 30 minutos</span>, progressivos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D] mt-2.5 shrink-0"></div> 
                      <span className="leading-tight">Protocolos especiais (TPM, gripada, sem energia)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D] mt-2.5 shrink-0"></div> 
                      <span className="leading-tight">Dieta hipocalórica personalizada por IA</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D] mt-2.5 shrink-0"></div> 
                      <span className="leading-tight">Cardápio simples com alimentos que você já come</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D] mt-2.5 shrink-0"></div> 
                      <span className="leading-tight">Lista de trocas inteligentes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D] mt-2.5 shrink-0"></div> 
                      <span className="leading-tight">Cálculo exato de água por peso corporal</span>
                    </li>
                  </ul>
                  <p className="text-blue-600 font-bold italic text-sm md:text-base">👉 O método se adapta a você — não o contrário.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start bg-gray-50 md:bg-transparent p-6 md:p-0 rounded-2xl">
                <div className="bg-[#FF4D4D] text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 shadow-lg mx-auto md:mx-0">3</div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Rotina Blindada</h3>
                  <ul className="space-y-2 text-gray-600 mb-4 text-base md:text-lg inline-block text-left bg-white md:bg-transparent p-4 md:p-0 rounded-xl w-full">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Checklist diário simples</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Rotinas de 3 minutos</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Protocolos de emergência para dias caóticos</li>
                  </ul>
                  <p className="text-blue-600 font-bold italic text-sm md:text-base">👉 Mesmo nos dias ruins, você não sai do jogo.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start bg-gray-50 md:bg-transparent p-6 md:p-0 rounded-2xl">
                <div className="bg-[#FF4D4D] text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 shadow-lg mx-auto md:mx-0">4</div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Crescimento com Gamificação</h3>
                  <ul className="space-y-2 text-gray-600 mb-4 text-base md:text-lg inline-block text-left bg-white md:bg-transparent p-4 md:p-0 rounded-xl w-full">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Ranking estilo Duolingo</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Pontuação por consistência</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Medalhas e desafios</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Frases motivacionais</li>
                  </ul>
                  <p className="text-blue-600 font-bold italic text-sm md:text-base">👉 Seu cérebro quer continuar.</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start bg-gray-50 md:bg-transparent p-6 md:p-0 rounded-2xl">
                <div className="bg-[#FF4D4D] text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 shadow-lg mx-auto md:mx-0">5</div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Medir, Postar e Evoluir</h3>
                  <ul className="space-y-2 text-gray-600 mb-4 text-base md:text-lg inline-block text-left bg-white md:bg-transparent p-4 md:p-0 rounded-xl w-full">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Fotos comparativas</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Gráficos de medidas e peso</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Relatório final</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div> Próximo desafio desbloqueado</li>
                  </ul>
                  <p className="text-blue-600 font-bold italic text-sm md:text-base">👉 Você vê o progresso — e isso muda tudo.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CAROUSEL 1 - RESULTS */}
        <section className="py-10 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                💬 O QUE MULHERES REAIS ESTÃO DIZENDO
              </h2>
              <p className="text-gray-600 mt-2">
                (comentários espontâneos do canal Músculos e Corpo Definido)
              </p>
            </div>
            


            <CarouselPlaceholder 
              title="Mulheres reais. Resultados reais. Sem academia." 
              items={[
                "Nunca consegui manter academia",
                "Sou mãe / trabalho o dia todo",
                "Treinos curtos funcionaram",
                "Resultado sem dieta maluca",
                "Finalmente consegui constância",
                "Mudança visível em pouco tempo"
              ]}
              caption={
                <>
                  <p className="text-gray-800 font-medium">
                    Esses comentários não são depoimentos pagos. <br/>
                    São mensagens reais, deixadas espontaneamente por mulheres comuns — mães, trabalhadoras, cansadas — que finalmente conseguiram constância e resultado.
                  </p>
                  <p className="font-bold text-lg text-gray-900">
                    Não foi força de vontade. Foi método possível.
                  </p>
                  <p className="text-[#FF4D4D] font-bold">
                    👉 Se elas conseguiram, você também consegue.
                  </p>
                </>
              }
            />
          </div>
        </section>

        {/* TARGET AUDIENCE - MOBILE GRID */}
        <section className="py-12 px-4 md:py-16 md:px-6 bg-[#111827] text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-8 md:mb-12">
              PARA QUEM É O BARRIGA 30
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {[
                "Mulheres sem tempo",
                "Mães sobrecarregadas",
                "Quem quer treinar em casa",
                "Quem odeia academia",
                "Quem já tentou de tudo",
                "Quem não quer dieta restritiva",
                "Quem precisa de um desafio curto para destravar",
                "Quem quer recuperar autoestima e confiança"
              ].map((item, i) => (
                <div key={i} className="bg-gray-800/50 p-4 md:p-5 rounded-xl border border-gray-700 flex items-center gap-4 hover:bg-gray-800 transition">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-[#FF4D4D]/20 flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 text-[#FF4D4D]" />
                  </div>
                  <span className="font-medium text-gray-200 text-base md:text-lg">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-lg md:text-xl font-bold">
              Se você leu isso e pensou <span className="text-[#FF4D4D]">“sou eu”</span>, continue.
            </p>
          </div>
        </section>

        {/* CAROUSEL 2 - EMOTIONAL */}
        <section className="py-10 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <CarouselPlaceholder 
              title="Não foi só a barriga que mudou."
              items={[
                "Autoestima baixa → orgulho",
                "Não acreditava mais em mim",
                "Voltei a usar roupas que não serviam",
                "Relatos emocionais (choro, gratidão)",
                "Mudança de energia",
                "Sinto-me viva novamente"
              ]}
              caption={
                <>
                  <p className="text-gray-700">
                    Muitas mulheres chegam aqui desacreditadas. <br/>
                    Não é só o corpo que dói — é a mente.
                  </p>
                  <p className="text-gray-700">
                    O que você vê nesses comentários é mais do que emagrecimento. <br/>
                    É resgate de autoestima, energia e confiança.
                  </p>
                  <p className="font-bold text-[#FF4D4D] text-lg">
                    👉 O corpo muda quando você para de se odiar e começa a se respeitar.
                  </p>
                </>
              }
            />
          </div>
        </section>

        {/* DELIVERABLES */}
        <section className="py-12 px-4 md:py-20 md:px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                O QUE VOCÊ RECEBE AO ENTRAR
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <Card className="border-none shadow-lg bg-gray-50 hover:-translate-y-1 transition duration-300">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <span className="text-2xl">🎓</span> Treinamentos Gravados
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  <ul className="space-y-2">
                    <li>Diagnóstico Smart</li>
                    <li>Treinos de 10 a 30 minutos</li>
                    <li>Dieta simples via IA</li>
                    <li>Protocolos femininos</li>
                    <li>Gamificação e evolução</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-gray-50 hover:-translate-y-1 transition duration-300">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <span className="text-2xl">🧩</span> Templates e Guias
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  <ul className="space-y-2">
                    <li>Cardápio reutilizável</li>
                    <li>Lista de trocas</li>
                    <li>Rotina semanal</li>
                    <li>Checklist diário</li>
                    <li>Guia “dia sem energia”</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-gray-50 hover:-translate-y-1 transition duration-300">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <span className="text-2xl">⚙️</span> Ferramentas
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  <ul className="space-y-2">
                    <li>Dashboard de evolução</li>
                    <li>Gráficos automáticos</li>
                    <li>Relatório final</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-gray-50 hover:-translate-y-1 transition duration-300">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <span className="text-2xl">🤝</span> Comunidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  <ul className="space-y-2">
                    <li>Grupo fechado de mulheres</li>
                    <li>Apoio diário</li>
                    <li>Motivação constante</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-gray-50 hover:-translate-y-1 transition duration-300">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <span className="text-2xl">🏆</span> Desafios
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  <ul className="space-y-2">
                    <li>Missões semanais</li>
                    <li>Ranking</li>
                    <li>Medalhas</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* BONUS SECTION */}
        <section className="py-12 px-4 md:py-16 md:px-6 bg-yellow-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-900 mb-8 md:mb-12">
              BÔNUS EXCLUSIVOS
            </h2>
            <div className="space-y-4 md:space-y-6">
              <Card className="border-yellow-200 bg-white">
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <span className="text-yellow-500 text-2xl">🎁</span>
                    Bônus 1 — Barriga Desinchada em 72h
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm md:text-base">Reduz inchaço e estufamento nos primeiros dias.</p>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-white">
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <span className="text-yellow-500 text-2xl">🎁</span>
                    Bônus 2 — Guia Anti-Sabotagem Feminina
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm md:text-base">TPM, ansiedade, compulsão noturna e dias difíceis.</p>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-white">
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <span className="text-yellow-500 text-2xl">🎁</span>
                    Bônus 3 — Calendário Visual de 30 Dias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm md:text-base">Disciplina automática e progresso visível.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CAROUSEL 3 - CONSISTENCY */}
        <section className="py-10 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                💬 MAIS HISTÓRIAS REAIS DE QUEM JÁ COMEÇOU
              </h2>
            </div>

            <CarouselPlaceholder 
              title="O problema nunca foi você."
              items={[
                "Nunca consegui seguir nada",
                "Sempre desistia",
                "Agora virou hábito",
                "Treino curto salvou",
                "Finalmente algo que consigo fazer",
                "A constância veio natural"
              ]}
              caption={
                <>
                  <p className="text-gray-700">
                    Se você já tentou de tudo e desistiu… <br/>
                    o problema nunca foi falta de força de vontade.
                  </p>
                  <p className="text-gray-700">
                    O problema sempre foi tentar seguir planos feitos para quem tem tempo, energia e motivação infinita.
                  </p>
                  <p className="font-bold text-[#FF4D4D] text-lg">
                    👉 O Barriga 30 funciona porque cabe na vida real.
                  </p>
                </>
              }
            />
            
            <div className="text-center max-w-2xl mx-auto mt-6 space-y-4">
              <p className="font-medium text-gray-900 italic mt-4 border-l-4 border-[#FF4D4D] pl-4 text-left md:text-center md:border-l-0 md:border-t-4 md:pt-4 inline-block w-full max-w-[90%] md:max-w-none mx-auto">
                "Treino bom é o treino que você consegue fazer. <br/>
                E método bom é o que você consegue manter."
              </p>
            </div>
          </div>
        </section>

        {/* GUARANTEE & ACCESS & AUTHORITY */}
        <section className="py-12 px-4 md:py-20 md:px-6 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto space-y-16">
            
            {/* Guarantee */}
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-3xl border border-green-100 text-center shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full mix-blend-multiply filter blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
              
              <div className="mb-6 flex justify-center relative z-10">
                <div className="bg-white p-4 rounded-2xl shadow-md">
                  <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
                </div>
              </div>
              
              <div className="relative z-10 space-y-4">
                <div className="text-sm md:text-base text-gray-600 italic">
                  <p>Talvez você tenha passado anos se colocando por último.</p>
                  <p>Cuidando de tudo e de todos — menos de você.</p>
                </div>

                <div className="font-bold text-gray-800 text-base md:text-lg">
                  <p className="text-yellow-700">Chegou a hora de cuidar de você.</p>
                  <p>Porque você é imagem e semelhança de Deus.</p>
                  <p className="text-sm font-normal text-gray-500 mt-1">E cuidar do seu corpo é honrar isso.</p>
                </div>

                <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 mb-3 md:mb-4 pt-4 border-t border-green-100">Garantia Incondicional de 7 Dias</h2>
                <p className="text-gray-600 mb-6 text-base md:text-lg leading-relaxed">
                  Entre, teste o método e veja como funciona.<br className="hidden md:block"/>
                  Se não gostar, devolvemos <span className="font-bold text-green-700 bg-green-100 px-1 rounded">100% do seu dinheiro</span>.
                </p>
                <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md border border-green-50 transform hover:scale-105 transition-transform duration-300">
                   <div className="bg-green-100 p-1.5 rounded-full">
                     <ShieldCheck className="w-5 h-5 text-green-600" />
                   </div>
                   <p className="font-bold text-green-800 text-sm md:text-base uppercase tracking-wide">Risco Zero • 100% Seguro</p>
                </div>
              </div>
            </div>

            {/* Access */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-3xl border border-blue-100 text-center shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>

              <div className="mb-6 flex justify-center relative z-10">
                <div className="bg-white p-4 rounded-2xl shadow-md">
                  <Clock className="w-10 h-10 md:w-12 md:h-12 text-blue-600" />
                </div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 mb-3 md:mb-4 tracking-tight">ACESSO IMEDIATO</h2>
                <p className="text-lg md:text-2xl font-bold text-gray-800 mb-2">
                  Você recebe <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">12 MESES COMPLETOS</span> de acesso.
                </p>
                <p className="text-gray-600 mb-6 text-base md:text-lg">
                  Os 30 dias são só a porta de entrada para sua transformação.
                </p>
                <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transform -rotate-1">
                  👉 O ano inteiro é o que garante que a barriga não volte.
                </div>
              </div>
            </div>

            {/* Authority */}
            <div className="bg-[#1a0b0b] text-white p-6 md:p-10 rounded-2xl md:rounded-3xl border border-white/10 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#FF4D4D] rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#b32d2d] rounded-full blur-[80px]"></div>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="mb-4 md:mb-6 relative">
                    <div className="w-32 h-32 md:w-48 md:h-48 relative rounded-full shadow-2xl border-4 border-[#F7F3ED] overflow-hidden bg-white">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img 
                         src="/images/mcd-logo.png" 
                         alt="Logo Músculos e Corpo Definido" 
                         className="w-full h-full object-cover"
                       />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl md:text-4xl font-extrabold mb-2 md:mb-3 tracking-tight">
                    <span className="text-[#FF4D4D]">MÚSCULOS E</span> <br/>
                    <span className="text-[#F7F3ED]">CORPO DEFINIDO</span>
                  </h2>
                  
                  <p className="text-gray-300 text-xs md:text-sm font-medium mb-4">
                    6,02 mi de inscritos • 1,5 mil vídeos
                  </p>
                </div>

                <div className="flex-1 space-y-6 w-full">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-[#F7F3ED] mb-3 md:mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 md:h-6 bg-[#FF4D4D] rounded-full"></span>
                      QUEM SOMOS NÓS
                    </h3>
                    
                    <p className="text-gray-300 leading-relaxed mb-6 text-sm md:text-base">
                      O <strong className="text-white">Músculos e Corpo Definido</strong> ajuda mulheres desde 2016. São mais de 6 milhões de inscritas, milhares de histórias reais e comentários que mudaram vidas.
                    </p>

                    <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                      <h4 className="text-xs md:text-sm font-bold text-[#FF4D4D] uppercase tracking-wider">Ao longo desses anos, vimos:</h4>
                      <ul className="space-y-2 md:space-y-3">
                        {[
                          "Autoestima ser restaurada",
                          "Mulheres voltarem a se respeitar",
                          "Corpos mais fortes e saudáveis",
                          "Famílias impactadas positivamente"
                        ].map((item, i) => (
                          <li key={i} className="flex gap-3 items-start text-xs md:text-sm text-gray-300">
                            <Check className="w-4 h-4 md:w-5 md:h-5 text-[#FF4D4D] shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-4 md:pt-6 border-t border-white/10">
                      <p className="italic text-gray-200 font-medium text-xs md:text-sm mb-2">
                        O Barriga 30 nasceu de uma missão muito clara:
                      </p>
                      <p className="text-[#F7F3ED] font-bold text-sm md:text-base mb-4">
                        Chegou a hora de cuidar de você — porque você é imagem e semelhança de Deus.
                      </p>
                      <p className="text-gray-400 text-xs md:text-sm">
                        Cuidar do corpo não é vaidade.<br/>
                        É respeito pela vida que você recebeu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* PLANS - MOBILE OPTIMIZED */}
        <PricingSection />

        {/* FAQ */}
        <section className="py-12 px-4 md:py-20 md:px-6 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto space-y-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
                OBJEÇÕES (RESUMO)
              </h2>
              <div className="space-y-4">
                <FAQItem 
                  question="Funciona mesmo?"
                  answer="Sim! O método já transformou a vida de milhares de alunas. Ele foi desenhado especificamente para mulheres que têm pouco tempo e precisam de um plano eficiente."
                />
                <FAQItem 
                  question="Treinos curtos dão resultado?"
                  answer="Com certeza. A ciência já comprovou que a intensidade é mais importante que a duração. Nossos treinos Smart mantêm seu metabolismo acelerado por horas."
                />
                <FAQItem 
                  question="Não precisa de dieta maluca?"
                  answer="De jeito nenhum. O pilar da nossa nutrição é a Constância Possível. Você terá um cardápio com alimentos simples que já tem em casa."
                />
                <FAQItem 
                  question="Cabe na rotina?"
                  answer="O Barriga 30 foi feito para quem não tem tempo. Se você tem 15 minutos livres no seu dia, você consegue ter resultados."
                />
                <FAQItem 
                  question="Não é só 30 dias?"
                  answer="Os 30 dias são para dar um choque no metabolismo, mas você recebe acesso completo por 12 meses (1 ano) para manter seus resultados."
                />
                <FAQItem 
                  question="Vale mais que academia?"
                  answer="Na academia, você paga mensalidade e muitas vezes fica perdida. Aqui, pelo valor de um lanche por mês, você tem Personal, Nutricionista e um plano completo."
                />
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER CTA */}
        <section className="py-12 px-4 bg-[#FF4D4D] text-white text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-2">
              <p className="text-white/90 text-lg md:text-xl font-medium">Você não precisa se odiar para mudar.</p>
              <p className="text-white font-bold text-xl md:text-2xl">Você precisa se respeitar.</p>
            </div>

            <div className="py-4">
              <p className="text-yellow-200 font-black text-2xl md:text-3xl uppercase tracking-tight">Chegou a hora de cuidar de você.</p>
              <p className="text-white/90 font-medium text-lg md:text-xl mt-1">Porque você é imagem e semelhança de Deus.</p>
            </div>

            <Link href="#plans" className="block mt-8">
               <Button className="bg-white text-[#FF4D4D] hover:bg-gray-100 font-bold px-10 py-8 rounded-full text-xl shadow-xl transform hover:scale-105 transition-all w-full md:w-auto">
                 QUERO SECAR MINHA BARRIGA EM 30 DIAS
               </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-gray-900 text-center text-gray-400 text-sm border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <span className="text-white text-xl font-black tracking-wider uppercase">Barriga 30</span>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/politica-privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
              <Link href="/termos-uso" className="hover:text-white transition-colors">Termos de Uso</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="mb-2">© {new Date().getFullYear()} Barriga 30. Todos os direitos reservados.</p>
            <p className="text-xs text-gray-600">Este site não faz parte do site do Facebook ou do Facebook Inc. Além disso, este site NÃO é endossado pelo Facebook de nenhuma maneira. FACEBOOK é uma marca comercial da FACEBOOK, Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
