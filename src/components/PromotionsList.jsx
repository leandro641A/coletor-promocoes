import React from 'react';
import { useValidityChecker, formatValidityDate, getValidityColor, getValidityMessage } from '@/hooks/useValidityChecker';

// Componente para exibir promoções com verificação de validade
export default function PromotionsList({ promotions = [], bonusPromotions = [], dateFormat = 'dd/mm/yyyy' }) {
  const { validatedPromotions, loading } = useValidityChecker(promotions);
  const { validatedPromotions: validatedBonusPromotions } = useValidityChecker(bonusPromotions);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (validatedPromotions.length === 0 && validatedBonusPromotions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhuma promoção encontrada. Tente iniciar uma nova coleta.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {validatedPromotions.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Promoções de Pontos e Cashback</h3>
          <div className="space-y-6">
            {validatedPromotions.map((promotion, index) => (
              <PromotionCard key={index} promotion={promotion} dateFormat={dateFormat} />
            ))}
          </div>
        </div>
      )}
      
      {validatedBonusPromotions.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Promoções Bonificadas</h3>
          <div className="space-y-6">
            {validatedBonusPromotions.map((promotion, index) => (
              <BonusPromotionCard key={index} promotion={promotion} dateFormat={dateFormat} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para exibir um cartão de promoção regular
function PromotionCard({ promotion, dateFormat }) {
  const validityColor = getValidityColor(promotion.validityStatus);
  const validityMessage = getValidityMessage(promotion.validityStatus);
  
  return (
    <div className={`border-l-4 pl-4 py-3 ${promotion.validityStatus === 'expired' ? 'border-gray-300 bg-gray-50' : 'border-blue-500'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-lg font-bold">{promotion.store}</h4>
        
        <div className={`text-sm ${validityColor} flex items-center mt-1 sm:mt-0`}>
          {promotion.validityStatus === 'expiring' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {promotion.validUntil ? (
            <>
              <span className="mr-1">{validityMessage}:</span>
              <span>{formatValidityDate(promotion.validUntil, dateFormat)}</span>
            </>
          ) : (
            <span>{validityMessage}</span>
          )}
        </div>
      </div>
      
      <div className="space-y-1 my-2">
        <div className="flex items-center">
          <span className="text-gray-600 mr-2">👉</span>
          <span className="font-medium">{promotion.program}:</span>
          <span className="ml-2 text-blue-600 font-medium">{promotion.value}</span>
        </div>
      </div>
      
      {promotion.directUrl && (
        <div className="mt-2">
          <a 
            href={promotion.directUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`text-blue-500 hover:underline flex items-center ${promotion.validityStatus === 'expired' ? 'opacity-50' : ''}`}
          >
            Ver na loja
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
      
      {promotion.validityStatus === 'expired' && (
        <div className="mt-2 text-xs text-red-500">
          Esta promoção já expirou e está sendo exibida apenas para referência.
        </div>
      )}
    </div>
  );
}

// Componente para exibir um cartão de promoção bonificada
function BonusPromotionCard({ promotion, dateFormat }) {
  const validityColor = getValidityColor(promotion.validityStatus);
  const validityMessage = getValidityMessage(promotion.validityStatus);
  
  return (
    <div className={`border-l-4 pl-4 py-3 ${promotion.validityStatus === 'expired' ? 'border-gray-300 bg-gray-50' : 'border-green-500'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-lg font-bold">
          {promotion.fromProgram && promotion.toProgram ? (
            <>
              {promotion.fromProgram} → {promotion.toProgram}
            </>
          ) : (
            promotion.title
          )}
        </h4>
        
        <div className={`text-sm ${validityColor} flex items-center mt-1 sm:mt-0`}>
          {promotion.validityStatus === 'expiring' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {promotion.validUntil ? (
            <>
              <span className="mr-1">{validityMessage}:</span>
              <span>{formatValidityDate(promotion.validUntil, dateFormat)}</span>
            </>
          ) : (
            <span>{validityMessage}</span>
          )}
        </div>
      </div>
      
      {promotion.bonusValue && (
        <div className="space-y-1 my-2">
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">🎁</span>
            <span className="font-medium">Bônus:</span>
            <span className="ml-2 text-green-600 font-medium">{promotion.bonusValue}</span>
          </div>
        </div>
      )}
      
      {promotion.validityStatus === 'expired' && (
        <div className="mt-2 text-xs text-red-500">
          Esta promoção já expirou e está sendo exibida apenas para referência.
        </div>
      )}
    </div>
  );
}
