import { useState } from 'react';
import { runScraper } from '@/lib/scraper';

// API route para coletar promoções
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Obter parâmetros da requisição
  const maxStores = parseInt(searchParams.get('maxStores') || '10', 10);
  const includePointsPrograms = searchParams.get('includePointsPrograms') !== 'false';
  const includeCashbackPrograms = searchParams.get('includeCashbackPrograms') !== 'false';
  const includeBonusPromotions = searchParams.get('includeBonusPromotions') !== 'false';
  
  try {
    // Configurar opções do scraper
    const options = {
      maxStores,
      includeProducts: false, // Sempre false para excluir produtos com cashback
      includePointsPrograms,
      includeCashbackPrograms,
      includeBonusPromotions,
      timeout: 60000, // 60 segundos de timeout
    };
    
    // Executar o scraper
    const result = await runScraper(options);
    
    // Retornar resultados
    return Response.json({
      success: true,
      data: result.results,
      formattedText: result.formattedText,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro na API de coleta:', error);
    
    // Retornar erro
    return Response.json({
      success: false,
      error: error.message || 'Erro ao coletar promoções',
    }, { status: 500 });
  }
}
