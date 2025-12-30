import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <Link href="/">
          <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all gap-2 text-gray-600">
            <ArrowLeft className="w-4 h-4" /> Voltar para o início
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Termos de Uso</h1>
        
        <div className="prose prose-gray max-w-none text-gray-600 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mt-6">1. Termos</h2>
          <p>
            Ao acessar ao site Barriga 30, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-6">2. Uso de Licença</h2>
          <p>
            É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Barriga 30 , apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>modificar ou copiar os materiais;</li>
            <li>usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial);</li>
            <li>tentar descompilar ou fazer engenharia reversa de qualquer software contido no site Barriga 30;</li>
            <li>remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou</li>
            <li>transferir os materiais para outra pessoa ou 'espelhe' os materiais em qualquer outro servidor.</li>
          </ul>
          
          <h2 className="text-xl font-bold text-gray-900 mt-6">3. Isenção de responsabilidade</h2>
          <p>
            Os materiais no site da Barriga 30 são fornecidos 'como estão'. Barriga 30 não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
          </p>
          <p className="italic bg-yellow-50 p-4 rounded-lg border border-yellow-100 mt-4">
            <strong>Aviso Legal de Saúde:</strong> Os resultados podem variar de pessoa para pessoa e dependem da dedicação de cada indivíduo. Consulte sempre um médico antes de iniciar qualquer programa de exercícios ou dieta.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-6">4. Limitações</h2>
          <p>
            Em nenhum caso o Barriga 30 ou seus fornecedores serão responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em Barriga 30, mesmo que Barriga 30 ou um representante autorizado da Barriga 30 tenha sido notificado oralmente ou por escrito da possibilidade de tais danos.
          </p>
        </div>
      </div>
    </div>
  )
}
