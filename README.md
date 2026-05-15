# RealCred+ - Sistema de Simulação de Empréstimo

Sistema de simulação de empréstimo consignado com integração de envio de e-mails.

## 🚀 Começando

### Pré-requisitos

- Node.js 20 ou superior
- npm (geralmente vem com o Node.js)
- Conta de e-mail para envio (recomendado Gmail)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/realcredmais.git
   cd realcredmais
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   - Faça uma cópia do arquivo `.env.example` para `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edite o arquivo `.env` com suas configurações

4. **Configuração do Gmail (recomendado)**
   - Acesse [Conta do Google](https://myaccount.google.com/)
   - Vá em "Segurança"
   - Crie uma Senha de App para uso SMTP
   - Use o e-mail e a senha gerada no arquivo `.env`

### Executando o Projeto

1. **Modo Desenvolvimento**
   ```bash
   # Inicia o servidor de desenvolvimento
   npm run dev
   
   # Em outro terminal, inicie o frontend
   npm run frontend:dev
   ```

2. **Modo Produção**
   ```bash
   # Construa o frontend
   npm run frontend:build
   
   # Inicie o servidor
   npm start
   ```

3. **Acesse a aplicação**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3002

## 🔧 Variáveis de Ambiente

| Variável              | Descrição                                      | Exemplo                     |
|-----------------------|----------------------------------------------|-----------------------------|
| `PORT`               | Porta do servidor                            | `3002`                      |
| `NODE_ENV`           | Ambiente de execução                         | `development` ou `production`|
| `EMAIL_SERVICE`      | Serviço de e-mail (ex: gmail)                | `gmail`                     |
| `EMAIL_USER`         | E-mail do remetente                          | `seu-email@gmail.com`       |
| `EMAIL_PASS`         | Senha do e-mail ou senha de app              | `sua-senha`                |
| `EMAIL_FROM`         | Nome e e-mail que aparecerá no remetente     | `RealCred+ <contato@realcredmais.com.br>` |
| `EMAIL_TO`           | E-mail que receberá os formulários           | `contato@realcredmais.com.br`|
| `LEAD_RECEIVER`      | E-mail que receberá leads de simulação       | `leads@realcredmais.com.br`  |
| `CONTACT_RECEIVER`   | E-mail que receberá mensagens de contato     | `contato@realcredmais.com.br`|
| `RATE_LIMIT_WINDOW_MS`| Janela de tempo para limite de taxa (ms)    | `900000` (15 minutos)       |
| `RATE_LIMIT_MAX`     | Número máximo de requisições por janela      | `100`                       |
| `ALLOWED_ORIGINS`    | URLs permitidas para CORS (separadas por vírgula) | `http://localhost:3000,https://realcredmais.com.br` |
| `OPENAI_API_KEY`     | Chave da OpenAI usada para o ChatGPT (guarde em segredo!) | `sk-xxxxxxxxxxxxxxxx` |
| `OPENAI_MODEL`       | Modelo a ser usado para chat completions     | `gpt-3.5-turbo` |
| `ADMIN_USER`         | Usuário do painel `/admin/chat-metrics`      | `admin` |
| `ADMIN_PASS`         | Senha do painel `/admin/chat-metrics`        | `senha-forte` |
| `VITE_GA_MEASUREMENT_ID` | ID opcional do Google Analytics 4        | `<seu-id-ga4>` |

### Instruções para habilitar o ChatGPT no chatbot
1. Gere sua chave na OpenAI (ou use uma chave Always Free se aplicável) e adicione em `.env` como `OPENAI_API_KEY`.
2. Reinicie o servidor (`npm start` ou `npm run dev`).
3. O chatbot usará o endpoint `/api/chat` para enviar mensagens ao OpenAI de forma segura (a chave não fica exposta no navegador).

> Segurança: Nunca exponha sua chave `OPENAI_API_KEY` no frontend — sempre mantenha no servidor (.env) e evite commitar o `.env` no controle de versão.


## 📦 Estrutura do Projeto

```
realcredmais/
├── assets/           # Imagens e arquivos fonte
├── artigos/          # Artigos publicados pelo build
├── functions/        # Função Netlify que reutiliza o Express
├── js/               # Scripts auxiliares servidos estaticamente
├── public/           # Arquivos estáticos não gerados
├── scripts/          # Scripts de build/manutenção
├── server.js         # Ponto de entrada do servidor
├── scripts.js        # Código principal do frontend
├── styles.css        # Estilos principais
├── package.json      # Dependências e scripts
└── .env.example      # Exemplo de variáveis de ambiente
```

## 🛠️ Comandos Úteis

- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run frontend:dev` - Inicia o Vite em modo desenvolvimento
- `npm run dev:all` - Inicia servidor e frontend juntos
- `npm run build` - Constrói o frontend para produção
- `npm start` - Inicia o servidor em produção
- `npm run deploy` - Executa o build de produção; o deploy é feito pela configuração do Netlify em `netlify.toml`

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✉️ Contato

Para mais informações, entre em contato pelo e-mail: contato@realcredmais.com.br
