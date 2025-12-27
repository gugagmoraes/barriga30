'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Check, Play, ShieldCheck, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-100 rounded-lg bg-white overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left font-bold text-gray-900 hover:bg-gray-50 transition"
      >
        <span>{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-gray-600 leading-relaxed border-t border-gray-100">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Header / Logo */}
      <header className="w-full py-4 px-6 flex justify-center bg-[#FF4D4D] shadow-md">
        <div className="flex items-center justify-center">
          <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">Barriga 30</span>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="py-12 px-4 md:py-20 md:px-6 bg-[#FDFBF7]">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-gray-900">
              Seque a barriga em 30 dias com treinos rápidos e sem dietas malucas — mesmo sem tempo, sem academia e sem sofrimento
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              Treinos de <span className="font-bold">15 a 30 minutos</span>, alimentação simples e um método inteligente que se adapta à sua rotina, ao seu corpo e até aos seus dias difíceis.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg inline-block">
              <p className="text-yellow-800 font-medium">
                👉 Não é sobre força de vontade. É sobre <span className="font-bold">método certo + constância possível</span>.
              </p>
            </div>

            {/* VSL Area */}
            <div className="mt-10 mb-8 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
              <div className="space-y-4">
                <p className="font-medium text-gray-900 text-lg">
                  Antes de te explicar tudo, assista ao vídeo abaixo para entender:
                </p>
                
                <ul className="text-left space-y-2 max-w-lg mx-auto text-gray-700 text-sm md:text-base">
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span>Por que <span className="font-bold">treinos curtos funcionam melhor</span> do que treinos longos</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span>O erro que faz a maioria das mulheres <span className="font-bold">não perder barriga</span>, mesmo se esforçando</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span>Como mulheres comuns estão <span className="font-bold">secando a barriga em casa</span>, sem academia</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span>Por que <span className="font-bold">dieta radical só atrasa</span> seus resultados</span>
                  </li>
                </ul>

                {/* Video Placeholder */}
                <div className="aspect-video w-full bg-gray-900 rounded-xl flex flex-col items-center justify-center text-white cursor-pointer hover:bg-gray-800 transition group mt-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition"></div>
                  <Play className="w-16 h-16 fill-white z-10" />
                  <p className="mt-4 font-bold z-10">👉 Clique para assistir agora</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
               <Link href="/register">
                <Button size="lg" className="w-full md:w-auto text-lg md:text-xl font-bold py-8 px-10 rounded-full shadow-xl bg-[#FF4D4D] hover:bg-[#ff3333] text-white transform hover:scale-105 transition-all animate-in fade-in slide-in-from-bottom-4 duration-1000 border-0">
                  QUERO SECAR MINHA BARRIGA EM 30 DIAS
                </Button>
               </Link>
            </div>
          </div>
        </section>

        {/* DEMONSTRATION / METHOD */}
        <section className="py-16 px-4 md:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Como funciona na prática
              </h2>
              <p className="text-lg text-gray-700">
                O Barriga 30 não é um treino genérico. <br className="hidden md:block"/>
                <span className="font-bold bg-yellow-100 px-1">É um aplicativo inteligente</span> que cria um <span className="font-bold bg-yellow-100 px-1">plano diário feito para você</span>.
              </p>
              <div className="mt-6 inline-block bg-blue-50 text-blue-800 px-4 py-2 rounded-full font-bold">
                🧠 Método 30D PersonalFit
              </div>
            </div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0">1</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Diagnóstico Smart</h3>
                  <p className="text-gray-700 mb-4 font-medium">Um raio-x do seu corpo e da sua rotina:</p>
                  <ul className="space-y-2 text-gray-600 mb-4 ml-4 list-disc">
                    <li>Seu nível (iniciante → avançada)</li>
                    <li>Tempo disponível por dia</li>
                    <li>Preferências alimentares</li>
                    <li>Dias delicados (TPM, baixa energia, doença)</li>
                    <li>Metas automáticas para os próximos 30 dias</li>
                  </ul>
                  <p className="text-blue-600 font-bold italic">👉 Aqui você para de seguir plano genérico.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0">2</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Plano 360 Personalizado</h3>
                  <ul className="space-y-2 text-gray-600 mb-4 ml-4 list-disc">
                    <li><span className="font-bold">Treinos de 10 a 30 minutos</span>, progressivos</li>
                    <li>Protocolos especiais (TPM, gripada, sem energia)</li>
                    <li>Dieta hipocalórica personalizada por IA</li>
                    <li>Cardápio simples com alimentos que você já come</li>
                    <li>Lista de trocas inteligentes</li>
                    <li>Cálculo exato de água por peso corporal</li>
                  </ul>
                  <p className="text-blue-600 font-bold italic">👉 O método se adapta a você — não o contrário.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0">3</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Rotina Blindada</h3>
                  <ul className="space-y-2 text-gray-600 mb-4 ml-4 list-disc">
                    <li>Checklist diário simples</li>
                    <li>Rotinas de 3 minutos</li>
                    <li>Protocolos de emergência para dias caóticos</li>
                  </ul>
                  <p className="text-blue-600 font-bold italic">👉 Mesmo nos dias ruins, você não sai do jogo.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0">4</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Crescimento com Gamificação</h3>
                  <ul className="space-y-2 text-gray-600 mb-4 ml-4 list-disc">
                    <li>Ranking estilo Duolingo</li>
                    <li>Pontuação por consistência</li>
                    <li>Medalhas e desafios</li>
                    <li>Frases motivacionais</li>
                  </ul>
                  <p className="text-blue-600 font-bold italic">👉 Seu cérebro quer continuar.</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0">5</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Medir, Postar e Evoluir</h3>
                  <ul className="space-y-2 text-gray-600 mb-4 ml-4 list-disc">
                    <li>Fotos comparativas</li>
                    <li>Gráficos de medidas e peso</li>
                    <li>Relatório final</li>
                    <li>Próximo desafio desbloqueado</li>
                  </ul>
                  <p className="text-blue-600 font-bold italic">👉 Você vê o progresso — e isso muda tudo.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TARGET AUDIENCE */}
        <section className="py-16 px-4 md:px-6 bg-gray-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10">
              Para quem é o Barriga 30
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-left">
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
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-3 border border-gray-100">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-800">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-xl font-bold text-gray-900">
              Se você leu isso e pensou <span className="text-blue-600">“sou eu”</span>, continue.
            </p>
          </div>
        </section>

        {/* DELIVERABLES */}
        <section className="py-16 px-4 md:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
              O que você recebe ao entrar
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                    <span className="text-2xl">🎓</span> Treinamentos Gravados
                  </h3>
                  <ul className="space-y-2 text-gray-600 ml-8 list-disc">
                    <li>Diagnóstico Smart</li>
                    <li>Treinos de 15 a 30 minutos</li>
                    <li>Dieta simples e personalizada via IA</li>
                    <li>Protocolos femininos</li>
                    <li>Gamificação e evolução</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                    <span className="text-2xl">🧩</span> Templates e Guias
                  </h3>
                  <ul className="space-y-2 text-gray-600 ml-8 list-disc">
                    <li>Cardápio reutilizável</li>
                    <li>Lista de trocas</li>
                    <li>Rotina semanal</li>
                    <li>Checklist diário</li>
                    <li>Guia “dia sem energia”</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                    <span className="text-2xl">⚙️</span> Ferramentas
                  </h3>
                  <ul className="space-y-2 text-gray-600 ml-8 list-disc">
                    <li>Dashboard de evolução</li>
                    <li>Gráficos automáticos</li>
                    <li>Relatório final</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                    <span className="text-2xl">🤝</span> Comunidade
                  </h3>
                  <ul className="space-y-2 text-gray-600 ml-8 list-disc">
                    <li>Grupo fechado de mulheres</li>
                    <li>Apoio diário</li>
                    <li>Motivação constante</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                    <span className="text-2xl">🏆</span> Desafios
                  </h3>
                  <ul className="space-y-2 text-gray-600 ml-8 list-disc">
                    <li>Missões semanais</li>
                    <li>Ranking</li>
                    <li>Medalhas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BONUS */}
        <section className="py-16 px-4 md:px-6 bg-yellow-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
              Bônus Exclusivos
            </h2>
            <div className="space-y-6">
              <Card className="border-yellow-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <span className="text-yellow-500 text-2xl">🎁</span>
                    Bônus 1 — Barriga Desinchada em 72h
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Reduz inchaço e estufamento nos primeiros dias.</p>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <span className="text-yellow-500 text-2xl">🎁</span>
                    Bônus 2 — Guia Anti-Sabotagem Feminina
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">TPM, ansiedade, compulsão noturna e dias difíceis.</p>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <span className="text-yellow-500 text-2xl">🎁</span>
                    Bônus 3 — Calendário Visual de 30 Dias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Disciplina automática e progresso visível.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* GUARANTEE & ACCESS */}
        <section className="py-16 px-4 md:px-6 bg-white">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
            {/* Guarantee */}
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 text-center md:text-left">
              <div className="mb-4 flex justify-center md:justify-start">
                <ShieldCheck className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Garantia</h2>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Garantia Incondicional de 7 Dias</h3>
              <p className="text-gray-600 mb-4">
                Entre, teste o método e veja como funciona.<br/>
                Se não gostar, devolvemos 100% do seu dinheiro.
              </p>
              <p className="font-bold text-green-700">👉 Sem perguntas. Risco zero.</p>
            </div>

            {/* Access */}
            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 text-center md:text-left">
              <div className="mb-4 flex justify-center md:justify-start">
                <Clock className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso</h2>
              <p className="text-xl font-bold text-gray-800 mb-2">
                Você recebe <span className="text-blue-700">12 MESES COMPLETOS</span> de acesso.
              </p>
              <p className="text-gray-600 mb-4">
                Os 30 dias são só a porta de entrada.
              </p>
              <p className="font-bold text-blue-700">👉 O ano inteiro é o que garante que a barriga não volte.</p>
            </div>
          </div>
        </section>

        {/* AUTHORITY */}
        <section className="py-20 px-4 md:px-6 bg-[#1a0b0b] text-white overflow-hidden relative">
          {/* Background decorative elements to mimic the shield/red theme */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#FF4D4D] rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#b32d2d] rounded-full blur-[80px]"></div>
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-12">
              
              {/* Left Side: Brand/Logo Representation */}
              <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                <div className="mb-6 relative">
                  <div className="w-40 h-40 md:w-48 md:h-48 relative rounded-full shadow-2xl border-4 border-[#F7F3ED] overflow-hidden bg-white">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img 
                       src="/images/logo-barriga30.png" 
                       alt="Logo Músculos e Corpo Definido" 
                       className="w-full h-full object-cover"
                     />
                  </div>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
                  <span className="text-[#FF4D4D]">MÚSCULOS E</span> <br/>
                  <span className="text-[#F7F3ED]">CORPO DEFINIDO</span>
                </h2>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    <span className="font-bold text-[#FF4D4D]">+6 Milhões</span> <span className="text-gray-300 text-sm">de inscritos</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    <span className="font-bold text-[#FF4D4D]">+1.5 Mil</span> <span className="text-gray-300 text-sm">vídeos gratuitos</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Text Content */}
              <div className="flex-1 space-y-6">
                <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-xl">
                  <h3 className="text-xl font-bold text-[#F7F3ED] mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#FF4D4D] rounded-full"></span>
                    Quem somos nós
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed mb-6">
                    O <strong className="text-white">canal Músculos e Corpo Definido</strong> ajuda mulheres desde 2016. São 6 milhões de inscritas, milhares de histórias reais e incontáveis comentários de transformação.
                  </p>

                  <div className="space-y-4 mb-8">
                    <h4 className="text-sm font-bold text-[#FF4D4D] uppercase tracking-wider">Já vimos:</h4>
                    <ul className="space-y-3">
                      {[
                        "Autoestima ser restaurada",
                        "Casamentos melhorarem",
                        "Mulheres voltarem a se sentir vivas"
                      ].map((item, i) => (
                        <li key={i} className="flex gap-3 items-start text-sm text-gray-300">
                          <Check className="w-5 h-5 text-[#FF4D4D] shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <p className="italic text-gray-400 text-sm">
                      "O Barriga 30 nasceu para corrigir uma injustiça:"
                    </p>
                    <p className="mt-4 font-bold text-[#F7F3ED]">
                      👉 Treino e dieta personalizados não deveriam ser caros nem inacessíveis.
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* OBJECTIONS / FAQ */}
        <section className="py-16 px-4 md:px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10">
              Perguntas Frequentes
            </h2>
            <div className="space-y-4">
              <FAQItem 
                question="O Barriga 30 realmente funciona para mim?"
                answer="Sim! O método já transformou a vida de mais de 2.000 alunas. Ele foi desenhado especificamente para mulheres que têm pouco tempo e precisam de um plano eficiente, combinando treinos de alta queima calórica com uma alimentação flexível."
              />
              <FAQItem 
                question="Treinos de 15 a 30 minutos dão resultado mesmo?"
                answer="Com certeza. A ciência já comprovou que a intensidade é mais importante que a duração. Nossos treinos Smart mantêm seu metabolismo acelerado por horas após o exercício, queimando gordura mesmo em repouso."
              />
              <FAQItem 
                question="Vou precisar passar fome ou cortar tudo o que gosto?"
                answer="De jeito nenhum. O pilar da nossa nutrição é a Constância Possível. Você terá um cardápio com alimentos simples, baratos e que você já tem em casa, além de uma lista de trocas para não enjoar."
              />
              <FAQItem 
                question="Não tenho tempo. Consigo acompanhar?"
                answer="O Barriga 30 foi feito para quem não tem tempo. Se você tem 15 minutos livres no seu dia, você consegue ter resultados. Você pode treinar na sala de casa, no quarto ou onde preferir."
              />
              <FAQItem 
                question="O que acontece depois dos 30 dias?"
                answer="Você continua evoluindo! Embora o desafio inicial seja de 30 dias para dar um choque no metabolismo, você recebe acesso completo por 12 meses (1 ano) para manter seus resultados e conquistar novos objetivos."
              />
              <FAQItem 
                question="Por que vale mais a pena que pagar uma academia?"
                answer="Na academia, você paga mensalidade e muitas vezes fica perdida sem saber o que fazer. Aqui, pelo valor de um único lanche por mês, você tem Personal, Nutricionista (via IA), Gamificação e um plano passo a passo na palma da mão."
              />
            </div>
          </div>
        </section>

        {/* PLANS */}
        <section className="py-16 px-4 md:px-6 bg-[#FDFBF7]" id="plans">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Escolha seu plano ideal
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* BASIC */}
              <Card className="border-gray-200 shadow-md hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-blue-600">🔹 BÁSICO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-extrabold text-gray-900">R$ 97 / ano</p>
                    <p className="text-sm text-gray-500">(12x R$ 9,90)</p>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-blue-500 shrink-0" /> Treinos básicos
                    </li>
                    <li className="flex gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-blue-500 shrink-0" /> Gamificação
                    </li>
                    <li className="flex gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-blue-500 shrink-0" /> Dieta simples
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/register?plan=basic" className="w-full">
                    <Button variant="outline" className="w-full font-bold">Escolher Básico</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* PLUS */}
              <Card className="border-blue-500 border-2 shadow-xl relative transform md:-translate-y-4">
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase">
                  Recomendado
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-blue-700">🔸 PLUS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-extrabold text-gray-900">R$ 197 / ano</p>
                    <p className="text-sm text-gray-500">(12x R$ 19,90)</p>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex gap-2 text-sm text-gray-700 font-bold">
                      <Check className="w-4 h-4 text-blue-500 shrink-0" /> Tudo do Básico
                    </li>
                    <li className="flex gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-blue-500 shrink-0" /> Treinos intermediários
                    </li>
                    <li className="flex gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-blue-500 shrink-0" /> Dieta personalizada por IA
                    </li>
                    <li className="flex gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-blue-500 shrink-0" /> Checklist de compras
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/register?plan=plus" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-white">Escolher Plus</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* VIP */}
              <Card className="border-red-200 shadow-md hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-red-600">🔥 VIP</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4 bg-red-50 rounded-lg">
                    <p className="text-3xl font-extrabold text-gray-900">R$ 397 / ano</p>
                    <p className="text-sm text-gray-500">(12x R$ 39,90)</p>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex gap-2 text-sm text-gray-700 font-bold">
                      <Check className="w-4 h-4 text-red-500 shrink-0" /> Tudo do Plus
                    </li>
                    <li className="flex gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-red-500 shrink-0" /> Treinos avançados
                    </li>
                    <li className="flex gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-red-500 shrink-0" /> Biblioteca premium
                    </li>
                    <li className="flex gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-red-500 shrink-0" /> Status VIP
                    </li>
                    <li className="flex gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-red-500 shrink-0" /> Desconto na renovação
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/register?plan=vip" className="w-full">
                    <Button variant="outline" className="w-full font-bold border-red-200 text-red-600 hover:bg-red-50">Escolher VIP</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 px-4 md:px-6 bg-[#FF4D4D] text-white text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="pt-4">
              <Link href="/register">
                <Button size="lg" className="w-full md:w-auto text-lg md:text-2xl font-bold py-8 px-12 rounded-full shadow-2xl bg-white text-[#FF4D4D] hover:bg-gray-100 transform hover:scale-105 transition-all">
                  QUERO SECAR MINHA BARRIGA EM 30 DIAS
                </Button>
              </Link>
            </div>
            <p className="text-xl font-medium opacity-90">
              👉 Comece hoje. Seu corpo agradece amanhã.
            </p>
          </div>
        </section>
      </main>

      {/* Footer minimal */}
      <footer className="py-8 bg-gray-50 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Barriga 30. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
