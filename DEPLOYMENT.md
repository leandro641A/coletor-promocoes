# Guia de Implantação - Coletor de Promoções Comparemania

Este documento contém instruções detalhadas para implantar a aplicação web Coletor de Promoções Comparemania em diferentes ambientes.

## Requisitos

- Node.js 18.x ou superior
- NPM 8.x ou superior (ou PNPM 8.x)
- Git (opcional, para clonar o repositório)

## Opções de Implantação

### 1. Vercel (Recomendado para uso pessoal - Gratuito)

A Vercel é a maneira mais simples de implantar esta aplicação Next.js:

1. Crie uma conta em [vercel.com](https://vercel.com)
2. Instale a CLI da Vercel:
   ```
   npm install -g vercel
   ```
3. No diretório do projeto, execute:
   ```
   vercel login
   vercel
   ```
4. Siga as instruções na tela para concluir a implantação

Para atualizações futuras, basta executar `vercel` novamente no diretório do projeto.

### 2. Netlify (Alternativa gratuita)

1. Crie uma conta em [netlify.com](https://netlify.com)
2. Instale a CLI da Netlify:
   ```
   npm install -g netlify-cli
   ```
3. No diretório do projeto, execute:
   ```
   netlify login
   netlify deploy
   ```
4. Siga as instruções na tela para concluir a implantação

### 3. Cloudflare Pages (Gratuito com bom desempenho global)

1. Crie uma conta em [cloudflare.com](https://cloudflare.com)
2. Acesse o painel do Cloudflare Pages
3. Clique em "Create a project"
4. Conecte sua conta do GitHub ou faça upload do código
5. Configure as opções de build:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: `.next`

### 4. Seu próprio servidor (VPS ou servidor dedicado)

#### Preparação do servidor

1. Instale Node.js e NPM:
   ```
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. Instale o PM2 para gerenciar o processo:
   ```
   npm install -g pm2
   ```

3. Clone o repositório ou faça upload dos arquivos para o servidor

#### Implantação

1. Navegue até o diretório do projeto:
   ```
   cd /caminho/para/comparemania-web
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Construa a aplicação:
   ```
   npm run build
   ```

4. Inicie a aplicação com PM2:
   ```
   pm2 start npm --name "comparemania" -- start
   ```

5. Configure o PM2 para iniciar automaticamente após reinicialização:
   ```
   pm2 startup
   pm2 save
   ```

#### Configuração do Nginx (opcional, para proxy reverso)

1. Instale o Nginx:
   ```
   sudo apt-get install nginx
   ```

2. Crie um arquivo de configuração para o site:
   ```
   sudo nano /etc/nginx/sites-available/comparemania
   ```

3. Adicione a seguinte configuração:
   ```
   server {
       listen 80;
       server_name seu-dominio.com www.seu-dominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Ative a configuração:
   ```
   sudo ln -s /etc/nginx/sites-available/comparemania /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. Configure HTTPS com Certbot:
   ```
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
   ```

## Configurações Adicionais

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
# Configurações gerais
NEXT_PUBLIC_SITE_NAME=Coletor de Promoções Comparemania
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com

# Configurações do scraper
SCRAPER_TIMEOUT=60000
SCRAPER_MAX_RETRIES=3
```

### Configuração de CORS (se necessário)

Se você estiver acessando a API de um domínio diferente, adicione a seguinte configuração ao arquivo `next.config.js`:

```js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};
```

## Solução de Problemas

### Erro: "Puppeteer não consegue iniciar o navegador"

Em alguns ambientes, o Puppeteer pode precisar de dependências adicionais:

```
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

### Erro: "EACCES: permission denied"

Se encontrar erros de permissão:

```
sudo chown -R $(whoami) /caminho/para/comparemania-web
```

## Atualizações

Para atualizar a aplicação:

1. Obtenha o código mais recente (via git pull ou upload)
2. Instale as dependências:
   ```
   npm install
   ```
3. Reconstrua a aplicação:
   ```
   npm run build
   ```
4. Reinicie o serviço:
   ```
   pm2 restart comparemania
   ```

## Suporte

Se encontrar problemas durante a implantação, verifique:

1. Logs da aplicação:
   ```
   pm2 logs comparemania
   ```
2. Logs do Nginx:
   ```
   sudo tail -f /var/log/nginx/error.log
   ```
