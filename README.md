# Coletor de Promoções Comparemania

Uma aplicação web para coletar automaticamente promoções do site comparemania.com.br, verificar sua validade e obter links diretos para as lojas.

## Características

- Coleta promoções de pontos/milhas, cashback e promoções bonificadas
- Verifica a validade das promoções automaticamente
- Obtém links diretos para as lojas (não apenas do Comparemania)
- Exclui produtos com cashback, focando apenas nas promoções
- Gera relatórios formatados para fácil compartilhamento em grupos
- Pode ser hospedada em seu próprio servidor ou em plataformas de baixo custo

## Tecnologias Utilizadas

- Next.js 14 (Framework React)
- Tailwind CSS (Estilização)
- Puppeteer (Web Scraping)
- Cheerio (Parsing HTML)
- Axios (Requisições HTTP)

## Estrutura do Projeto

```
comparemania-web/
├── public/                  # Arquivos estáticos
├── src/
│   ├── app/                 # Páginas da aplicação
│   │   ├── api/             # Rotas de API
│   │   │   └── coletar/     # API para coleta de promoções
│   │   ├── coletar/         # Página para iniciar coleta
│   │   ├── configuracoes/   # Página de configurações
│   │   ├── promocoes/       # Página de visualização de promoções
│   │   └── sobre/           # Página sobre a ferramenta
│   ├── components/          # Componentes reutilizáveis
│   ├── hooks/               # Hooks personalizados
│   └── lib/                 # Bibliotecas e utilitários
│       └── scraper.js       # Lógica de coleta de promoções
├── DEPLOYMENT.md            # Guia de implantação
└── README.md                # Este arquivo
```

## Instalação e Execução Local

### Pré-requisitos

- Node.js 18.x ou superior
- NPM 8.x ou superior (ou PNPM 8.x)

### Instalação

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/comparemania-web.git
   cd comparemania-web
   ```

2. Instale as dependências:
   ```
   npm install
   # ou
   pnpm install
   ```

3. Execute o servidor de desenvolvimento:
   ```
   npm run dev
   # ou
   pnpm dev
   ```

4. Acesse a aplicação em `http://localhost:3000`

## Uso

### Coletar Promoções

1. Acesse a página "Coletar"
2. Configure as opções de coleta:
   - Selecione os tipos de promoções a coletar
   - Defina o número máximo de lojas
3. Clique em "Iniciar Coleta"
4. Aguarde a conclusão da coleta
5. Você será redirecionado para a página de promoções

### Visualizar Promoções

1. Acesse a página "Promoções"
2. Veja todas as promoções coletadas, organizadas por tipo
3. As promoções são categorizadas por status de validade:
   - Válidas (verde)
   - Prestes a expirar (laranja)
   - Expiradas (vermelho)
4. Clique em "Copiar Formatado" para obter o texto formatado para compartilhamento

### Configurações

Acesse a página "Configurações" para personalizar:
- Intervalo de atualização automática
- Formato de exibição de datas
- Texto de cabeçalho e rodapé para compartilhamento

## Implantação

Para instruções detalhadas de implantação em diferentes ambientes, consulte o arquivo [DEPLOYMENT.md](DEPLOYMENT.md).

Opções de hospedagem:
- Vercel (recomendado para uso pessoal - gratuito)
- Netlify (alternativa gratuita)
- Cloudflare Pages (gratuito com bom desempenho global)
- Seu próprio servidor (VPS ou servidor dedicado)

## Limitações

- A coleta de promoções depende da estrutura atual do site comparemania.com.br
- Algumas promoções podem não ter informações completas de validade
- O processo de coleta pode levar alguns minutos, dependendo do número de lojas

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Licença

Este projeto é licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
