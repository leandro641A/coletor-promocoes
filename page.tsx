import React, { useState } from 'react';

export default function ColetarPage() {
  const [isCollecting, setIsCollecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Estado para opções de coleta
  const [options, setOptions] = useState({
    maxStores: 10,
    includePointsPrograms: true,
    includeCashbackPrograms: true,
    includeBonusPromotions: true,
    includeProducts: false, // Sempre false para excluir produtos com cashback
  });
  
  // Função para iniciar coleta
  async function startCollection() {
    setIsCollecting(true);
    setProgress(0);
    setResult(null);
    setError(null);
    
    try {
      // Construir URL com parâmetros
      const params = new URLSearchParams({
        maxStores: options.maxStores.toString(),
        includePointsPrograms: options.includePointsPrograms.toString(),
        includeCashbackPrograms: options.includeCashbackPrograms.toString(),
        includeBonusPromotions: options.includeBonusPromotions.toString(),
        includeProducts: 'false', // Sempre false para excluir produtos com cashback
      });
      
      // Simular progresso (na versão real, isso seria atualizado por eventos do servidor)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 5;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 1000);
      
      // Fazer requisição para API
      const response = await fetch(`/api/coletar?${params}`);
      const data = await response.json();
      
      clearInterval(progressInterval);
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao coletar promoções');
      }
      
      setProgress(100);
      setResult(data);
      
      // Redirecionar para página de promoções após 2 segundos
      setTimeout(() => {
        window.location.href = '/promocoes';
      }, 2000);
    } catch (error) {
      console.error('Erro na coleta:', error);
      setError(error.message || 'Erro ao coletar promoções');
    } finally {
      setIsCollecting(false);
    }
  }
  
  // Função para atualizar opções
  function handleOptionChange(name, value) {
    setOptions(prev => ({
      ...prev,
      [name]: value
    }));
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Coletar Promoções</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Iniciar Nova Coleta</h2>
        
        <p className="mb-6">
          Esta ferramenta coletará automaticamente as promoções do site Comparemania, 
          verificará a validade de cada promoção e obterá os links diretos para as lojas.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-2">Opções de Coleta</h3>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2" 
                    checked={options.includePointsPrograms}
                    onChange={(e) => handleOptionChange('includePointsPrograms', e.target.checked)}
                  />
                  <span>Coletar promoções de pontos/milhas</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2" 
                    checked={options.includeCashbackPrograms}
                    onChange={(e) => handleOptionChange('includeCashbackPrograms', e.target.checked)}
                  />
                  <span>Coletar promoções de cashback</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2" 
                    checked={options.includeBonusPromotions}
                    onChange={(e) => handleOptionChange('includeBonusPromotions', e.target.checked)}
                  />
                  <span>Coletar promoções bonificadas</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center opacity-50">
                  <input 
                    type="checkbox" 
                    className="mr-2" 
                    disabled={true}
                    checked={false}
                  />
                  <span>Incluir produtos com cashback</span>
                </label>
                <p className="text-xs text-gray-500 ml-5">Desativado conforme solicitação</p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-2">Limites e Filtros</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Número máximo de lojas:</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded"
                  value={options.maxStores}
                  onChange={(e) => handleOptionChange('maxStores', parseInt(e.target.value))}
                >
                  <option value="10">10 lojas (mais rápido)</option>
                  <option value="20">20 lojas</option>
                  <option value="50">50 lojas</option>
                  <option value="0">Todas as lojas (mais demorado)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {isCollecting && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Coletando promoções... {Math.round(progress)}%
            </p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-700">
              Coleta concluída com sucesso! Encontradas {result.data.promotions.length} promoções regulares e {result.data.bonusPromotions.length} promoções bonificadas.
            </p>
            <p className="text-sm text-green-600 mt-1">
              Redirecionando para a página de promoções...
            </p>
          </div>
        )}
        
        <div className="flex justify-center">
          <button 
            className={`px-8 py-3 rounded-lg font-medium text-lg transition-colors ${
              isCollecting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            onClick={startCollection}
            disabled={isCollecting}
          >
            {isCollecting ? 'Coletando...' : 'Iniciar Coleta'}
          </button>
        </div>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <p className="text-yellow-800">
          <strong>Importante:</strong> A coleta de promoções pode levar alguns minutos, dependendo do número de lojas selecionadas.
          Durante este processo, a aplicação buscará os links diretos e verificará a validade de cada promoção.
        </p>
      </div>
    </div>
  );
}
