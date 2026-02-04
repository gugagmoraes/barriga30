'use client';

import { useState } from 'react';
import { askGemini } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAIPage() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!prompt) return;
    
    setLoading(true);
    setResponse('');
    
    try {
      const result = await askGemini(prompt);
      if (result.success && result.data) {
        setResponse(result.data);
      } else {
        setResponse('Erro ao obter resposta.');
      }
    } catch (error) {
      console.error(error);
      setResponse('Erro na requisição.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-[#1E6B7B]">
            Teste de Integração Gemini AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Digite seu prompt:</label>
            <textarea
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-[#1E6B7B] outline-none min-h-[100px]"
              placeholder="Ex: Crie uma dieta de 1500kcal..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleAsk} 
            disabled={loading || !prompt}
            className="w-full bg-[#FE5846] hover:bg-[#e04f3f] text-white font-bold py-6 text-lg rounded-xl"
          >
            {loading ? 'Gerando...' : 'Perguntar para IA'}
          </Button>

          {response && (
            <div className="mt-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Resposta da IA:</h3>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {response}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
