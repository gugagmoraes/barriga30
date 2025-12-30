import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <Link href="/">
          <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all gap-2 text-gray-600">
            <ArrowLeft className="w-4 h-4" /> Voltar para o início
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-gray max-w-none text-gray-600 space-y-6">
          <p>
            A sua privacidade é importante para nós. É política do Barriga 30 respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site Barriga 30, e outros sites que possuímos e operamos.
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-6">1. Informações que coletamos</h2>
          <p>
            Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-6">2. Uso de dados</h2>
          <p>
            Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-6">3. Compartilhamento de dados</h2>
          <p>
            Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-6">4. Cookies</h2>
          <p>
            O nosso site usa cookies para melhorar a experiência do usuário. Ao continuar a usar nosso site, você concorda com o uso de cookies. Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-6">5. Compromisso do Usuário</h2>
          <p>
            O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o Barriga 30 oferece no site e com caráter enunciativo, mas não limitativo:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Não se envolver em atividades que sejam ilegais ou contrárias à boa fé a à ordem pública;</li>
            <li>Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, ou casas de apostas legais (ex.: Moosh), jogos de sorte e azar, qualquer tipo de pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos;</li>
            <li>Não causar danos aos sistemas físicos (hardwares) e lógicos (softwares) do Barriga 30, de seus fornecedores ou terceiros.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
