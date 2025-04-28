import axios from 'axios';
import cheerio from 'cheerio';
import puppeteer from 'puppeteer';

// Classe principal para coletar promoções do Comparemania
export class ComparemaniaScraper {
  constructor(options = {}) {
    this.options = {
      maxStores: options.maxStores || 10,
      includeProducts: false, // Sempre false para excluir produtos com cashback
      includePointsPrograms: options.includePointsPrograms !== false,
      includeCashbackPrograms: options.includeCashbackPrograms !== false,
      includeBonusPromotions: options.includeBonusPromotions !== false,
      maxRetries: options.maxRetries || 3,
      timeout: options.timeout || 30000,
      ...options
    };
    
    this.baseUrl = 'https://www.comparemania.com.br';
    this.results = {
      promotions: [],
      bonusPromotions: [],
      timestamp: new Date().toISOString()
    };
  }

  // Método principal para iniciar a coleta
  async collectPromotions() {
    console.log('Iniciando coleta de promoções do Comparemania...');
    
    try {
      // Coletar lojas parceiras
      const partners = await this.getPartners();
      console.log(`Encontradas ${partners.length} lojas parceiras.`);
      
      // Limitar número de lojas se necessário
      const storesToProcess = this.options.maxStores 
        ? partners.slice(0, this.options.maxStores) 
        : partners;
      
      // Coletar promoções para cada loja
      for (let i = 0; i < storesToProcess.length; i++) {
        const partner = storesToProcess[i];
        console.log(`[${i+1}/${storesToProcess.length}] Processando ${partner.name}`);
        
        try {
          const promotions = await this.getStorePromotions(partner);
          
          // Filtrar produtos com cashback (sempre excluídos)
          const filteredPromotions = promotions.filter(promo => !promo.isProduct);
          
          if (filteredPromotions.length > 0) {
            this.results.promotions.push(...filteredPromotions);
            console.log(`Encontradas ${filteredPromotions.length} promoções válidas para ${partner.name}.`);
          } else {
            console.log(`Nenhuma promoção válida encontrada para ${partner.name}.`);
          }
        } catch (error) {
          console.error(`Erro ao processar ${partner.name}: ${error.message}`);
        }
      }
      
      // Coletar promoções bonificadas se habilitado
      if (this.options.includeBonusPromotions) {
        console.log('Coletando promoções bonificadas...');
        const bonusPromotions = await this.getBonusPromotions();
        this.results.bonusPromotions = bonusPromotions;
        console.log(`Encontradas ${bonusPromotions.length} promoções bonificadas.`);
      }
      
      return this.results;
    } catch (error) {
      console.error(`Erro durante a coleta: ${error.message}`);
      throw error;
    }
  }

  // Obter lista de lojas parceiras
  async getPartners() {
    try {
      const response = await axios.get(`${this.baseUrl}`);
      const $ = cheerio.load(response.data);
      
      const partners = [];
      
      // Encontrar links de lojas na página inicial
      $('a').each((i, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        
        // Verificar se é um link de loja (cashback ou pontos)
        if (href && (href.includes('cashback-') || href.includes('pontos-'))) {
          const name = text || href.split('-').pop();
          
          // Evitar duplicatas
          if (name && !partners.some(p => p.name === name)) {
            partners.push({
              name,
              url: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
              type: href.includes('cashback-') ? 'cashback' : 'points'
            });
          }
        }
      });
      
      return partners;
    } catch (error) {
      console.error(`Erro ao obter parceiros: ${error.message}`);
      return [];
    }
  }

  // Obter promoções de uma loja específica
  async getStorePromotions(partner) {
    try {
      const response = await axios.get(partner.url);
      const $ = cheerio.load(response.data);
      
      const promotions = [];
      
      // Extrair informações de promoções de pontos/milhas
      if (this.options.includePointsPrograms) {
        $('.pontos-milhas').each((i, element) => {
          const programName = $(element).find('.programa-nome').text().trim();
          const pointsValue = $(element).find('.pontos-valor').text().trim();
          
          if (programName && pointsValue) {
            promotions.push({
              store: partner.name,
              program: programName,
              value: pointsValue,
              type: 'points',
              isProduct: false, // Não é um produto com cashback
              url: partner.url,
              directUrl: null, // Será preenchido posteriormente
              validUntil: null // Será preenchido posteriormente
            });
          }
        });
      }
      
      // Extrair informações de promoções de cashback
      if (this.options.includeCashbackPrograms) {
        $('.cashback').each((i, element) => {
          const programName = $(element).find('.programa-nome').text().trim();
          const cashbackValue = $(element).find('.cashback-valor').text().trim();
          
          if (programName && cashbackValue) {
            promotions.push({
              store: partner.name,
              program: programName,
              value: cashbackValue,
              type: 'cashback',
              isProduct: false, // Não é um produto com cashback
              url: partner.url,
              directUrl: null, // Será preenchido posteriormente
              validUntil: null // Será preenchido posteriormente
            });
          }
        });
      }
      
      // Para cada promoção, obter o link direto e a data de validade
      for (const promotion of promotions) {
        await this.getDirectLinkAndValidity(promotion);
      }
      
      return promotions;
    } catch (error) {
      console.error(`Erro ao obter promoções para ${partner.name}: ${error.message}`);
      return [];
    }
  }

  // Obter promoções bonificadas
  async getBonusPromotions() {
    try {
      const response = await axios.get(`${this.baseUrl}/promocoes-bonificadas`);
      const $ = cheerio.load(response.data);
      
      const bonusPromotions = [];
      
      // Extrair informações de promoções bonificadas
      $('.promocao-bonificada').each((i, element) => {
        const title = $(element).find('.promocao-titulo').text().trim();
        const validUntil = $(element).find('.promocao-validade').text().trim();
        
        if (title) {
          // Extrair informações da promoção do título
          const promotion = this.parsePromotionTitle(title);
          
          bonusPromotions.push({
            ...promotion,
            validUntil: this.parseValidityDate(validUntil),
            type: 'bonus',
            isProduct: false
          });
        }
      });
      
      return bonusPromotions;
    } catch (error) {
      console.error(`Erro ao obter promoções bonificadas: ${error.message}`);
      return [];
    }
  }

  // Obter link direto e validade de uma promoção
  async getDirectLinkAndValidity(promotion) {
    // Iniciar navegador headless para seguir os redirecionamentos
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(this.options.timeout);
      
      // Navegar para a página da promoção
      await page.goto(promotion.url);
      
      // Procurar e clicar no botão "Ir para loja" ou similar
      const goToStoreButton = await page.$('a:contains("Ir para"), a:contains("Ir para o site"), a:contains("Ir para loja")');
      
      if (goToStoreButton) {
        // Obter URL antes de clicar
        const navigationPromise = page.waitForNavigation();
        await goToStoreButton.click();
        await navigationPromise;
        
        // Obter URL final após redirecionamentos
        promotion.directUrl = page.url();
        
        // Procurar informações de validade na página
        const content = await page.content();
        promotion.validUntil = this.extractValidityDate(content);
      }
    } catch (error) {
      console.error(`Erro ao obter link direto para ${promotion.store}: ${error.message}`);
    } finally {
      await browser.close();
    }
    
    return promotion;
  }

  // Extrair data de validade de um texto
  extractValidityDate(content) {
    // Padrões comuns de datas de validade
    const patterns = [
      /válido até (\d{2}\/\d{2}\/\d{4})/i,
      /validade: (\d{2}\/\d{2}\/\d{4})/i,
      /expira em (\d{2}\/\d{2}\/\d{4})/i,
      /válido até (\d{2}\/\d{2})/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return this.parseValidityDate(match[1]);
      }
    }
    
    return null;
  }

  // Converter string de data para formato padrão
  parseValidityDate(dateStr) {
    if (!dateStr) return null;
    
    // Tentar diferentes formatos de data
    const formats = [
      { regex: /(\d{2})\/(\d{2})\/(\d{4})/, format: (d) => `${d[3]}-${d[2]}-${d[1]}` }, // DD/MM/YYYY
      { regex: /(\d{2})\/(\d{2})/, format: (d) => { 
        const year = new Date().getFullYear();
        return `${year}-${d[2]}-${d[1]}`; 
      }} // DD/MM (ano atual)
    ];
    
    for (const format of formats) {
      const match = dateStr.match(format.regex);
      if (match) {
        return format.format(match);
      }
    }
    
    return null;
  }

  // Extrair informações de promoção do título
  parsePromotionTitle(title) {
    // Exemplo: "Trasfira seus pontos na promoção: Itaú e LATAM Pass e ganhe até 40% de bônus"
    const fromProgram = title.match(/promoção: ([^e]+) e/i);
    const toProgram = title.match(/e ([^e]+) e ganhe/i);
    const bonusValue = title.match(/ganhe até (\d+)% de bônus/i);
    
    return {
      title,
      fromProgram: fromProgram ? fromProgram[1].trim() : null,
      toProgram: toProgram ? toProgram[1].trim() : null,
      bonusValue: bonusValue ? bonusValue[1] + '%' : null
    };
  }

  // Formatar resultados para compartilhamento
  formatResults(format = 'text') {
    const today = new Date().toLocaleDateString('pt-BR');
    let output = '';
    
    if (format === 'text') {
      output += `PROMOÇÕES DO DIA ATUALIZADAS (${today}):\n\n`;
      
      // Promoções regulares
      if (this.results.promotions.length > 0) {
        output += `PROMOÇÕES DE PONTOS E CASHBACK:\n\n`;
        
        for (const promo of this.results.promotions) {
          output += `👉 ${promo.store}: ${promo.value} (${promo.program})\n`;
          
          if (promo.validUntil) {
            const validDate = new Date(promo.validUntil).toLocaleDateString('pt-BR');
            output += `   Válido até: ${validDate}\n`;
          }
          
          if (promo.directUrl) {
            output += `   Link: ${promo.directUrl}\n`;
          }
          
          output += '\n';
        }
      }
      
      // Promoções bonificadas
      if (this.results.bonusPromotions.length > 0) {
        output += `PROMOÇÕES BONIFICADAS:\n\n`;
        
        for (const promo of this.results.bonusPromotions) {
          output += `👉 ${promo.title}\n`;
          
          if (promo.validUntil) {
            const validDate = new Date(promo.validUntil).toLocaleDateString('pt-BR');
            output += `   Válido até: ${validDate}\n`;
          }
          
          output += '\n';
        }
      }
      
      output += `Consulte o regulamento, produtos elegíveis e demais condições de cada um dos parceiros.`;
    } else if (format === 'html') {
      // Implementar formatação HTML se necessário
    }
    
    return output;
  }
}

// Função auxiliar para executar o scraper
export async function runScraper(options = {}) {
  const scraper = new ComparemaniaScraper(options);
  await scraper.collectPromotions();
  
  return {
    results: scraper.results,
    formattedText: scraper.formatResults('text'),
    formattedHtml: scraper.formatResults('html')
  };
}
