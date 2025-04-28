import { useState, useEffect } from 'react';

// Hook personalizado para verificar a validade das promoções
export function useValidityChecker(promotions = []) {
  const [validatedPromotions, setValidatedPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!promotions || promotions.length === 0) {
      setValidatedPromotions([]);
      setLoading(false);
      return;
    }
    
    async function validatePromotions() {
      setLoading(true);
      
      try {
        // Processar cada promoção para verificar e categorizar sua validade
        const validated = promotions.map(promo => {
          const validityStatus = getValidityStatus(promo.validUntil);
          return {
            ...promo,
            validityStatus
          };
        });
        
        // Ordenar promoções: válidas primeiro, depois prestes a expirar, depois expiradas
        const sorted = [...validated].sort((a, b) => {
          const statusOrder = { valid: 0, expiring: 1, expired: 2, unknown: 3 };
          return statusOrder[a.validityStatus] - statusOrder[b.validityStatus];
        });
        
        setValidatedPromotions(sorted);
      } catch (error) {
        console.error('Erro ao validar promoções:', error);
      } finally {
        setLoading(false);
      }
    }
    
    validatePromotions();
  }, [promotions]);
  
  return { validatedPromotions, loading };
}

// Função para determinar o status de validade de uma promoção
export function getValidityStatus(validUntilStr) {
  if (!validUntilStr) return 'unknown';
  
  try {
    const validUntil = new Date(validUntilStr);
    const now = new Date();
    
    // Verificar se a data é válida
    if (isNaN(validUntil.getTime())) return 'unknown';
    
    // Promoção já expirou
    if (validUntil < now) return 'expired';
    
    // Promoção expira em menos de 3 dias
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    if (validUntil <= threeDaysFromNow) return 'expiring';
    
    // Promoção válida
    return 'valid';
  } catch (error) {
    console.error('Erro ao verificar validade:', error);
    return 'unknown';
  }
}

// Função para formatar a data de validade
export function formatValidityDate(validUntilStr, format = 'dd/mm/yyyy') {
  if (!validUntilStr) return 'Data não informada';
  
  try {
    const validUntil = new Date(validUntilStr);
    
    // Verificar se a data é válida
    if (isNaN(validUntil.getTime())) return 'Data inválida';
    
    const day = validUntil.getDate().toString().padStart(2, '0');
    const month = (validUntil.getMonth() + 1).toString().padStart(2, '0');
    const year = validUntil.getFullYear();
    
    switch (format) {
      case 'dd/mm/yyyy':
        return `${day}/${month}/${year}`;
      case 'dd/mm':
        return `${day}/${month}`;
      case 'text':
        const months = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return `${day} de ${months[validUntil.getMonth()]} de ${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
}

// Função para obter mensagem de status de validade
export function getValidityMessage(status) {
  switch (status) {
    case 'valid':
      return 'Promoção válida';
    case 'expiring':
      return 'Expira em breve';
    case 'expired':
      return 'Promoção expirada';
    case 'unknown':
    default:
      return 'Validade desconhecida';
  }
}

// Função para obter cor de status de validade
export function getValidityColor(status) {
  switch (status) {
    case 'valid':
      return 'text-green-600';
    case 'expiring':
      return 'text-orange-500';
    case 'expired':
      return 'text-red-600';
    case 'unknown':
    default:
      return 'text-gray-500';
  }
}
