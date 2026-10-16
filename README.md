# RealCred+ · realcredmais.com.br

Site da RealCred+ (F. M dos Santos Araujo Ltda., CNPJ 35.473.133/0001-60), em Lorena, SP.
Site estático feito com Vite e publicado no Netlify a cada push na `main`.

## O que o site faz

- **Simulador na primeira tela:** calcula a parcela no navegador, sem pedir CPF, e abre o WhatsApp com a simulação escrita. Não depende de servidor.
- **Calculadora de portabilidade:** estima o saldo devedor e a economia com uma taxa nova.
- **Formulário de contato:** usa o Netlify Forms. As mensagens aparecem no painel do Netlify, em Forms.
- **Google Analytics:** opcional, só carrega depois do aceite de cookies.

## Rodar no computador

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # testa as contas do simulador
npm run build    # gera dist/
```

## Onde mudar cada coisa

| O quê | Arquivo |
|---|---|
| Taxas de referência, prazos e margens do simulador | `src/calc.js` (objeto `PRODUTOS`) |
| Telefone, endereço, horário, aviso legal | `partials/header.html` e `partials/footer.html` |
| Textos da página inicial | `index.html` |
| Visual (cores, fontes, espaçamentos) | `src/site.css` |
| Páginas de cada crédito, página de Lorena | `content/produtos.mjs` |
| Artigos novos (gerados) | `content/artigos.mjs` |
| Artigos escritos à mão | `artigos/*.html` (e listar em `ARTIGOS_ANTIGOS`, em `scripts/gerar.mjs`) |
| Fontes das regras e data da última conferência | `content/fontes.mjs` |
| Faixa do topo (aviso com data) | `partials/header.html` e `iniciarAviso` em `src/site.js` |
| Linha do tempo de 2026 | `index.html` (seção `changes`) |
| Redirecionamentos | `public/_redirects` |
| Cabeçalhos de segurança e cache | `netlify.toml` |

## Páginas geradas

`npm run build` roda `scripts/gerar.mjs` antes do Vite. Ele monta as 7 páginas de crédito, a página de Lorena, os artigos de `content/artigos.mjs`, o índice `/artigos/` e o `public/sitemap.xml`. Essas páginas não ficam no git; edite o conteúdo em `content/` e rode `npm run gerar` para ver o resultado.

Quando uma regra mudar: atualize o texto em `content/`, a fonte em `content/fontes.mjs` e a data `ATUALIZADO`.

## Avisar os buscadores

Depois de publicar, `npm run indexnow` avisa Bing e os outros buscadores do IndexNow que as URLs do sitemap mudaram. O Google lê o sitemap pelo Search Console.

## Ligar o Google Analytics

1. Crie uma propriedade GA4 e copie o ID (`G-XXXXXXX`).
2. No Netlify, abra Site configuration, depois Environment variables, e crie `VITE_GA_MEASUREMENT_ID` com esse ID.
3. Faça um novo deploy. O aviso de cookies passa a aparecer, e os eventos `clique_whatsapp`, `simulacao_calculada`, `simulacao_whatsapp`, `portabilidade_calculada` e `contato_enviado` começam a ser registrados.

## Receber o formulário por e-mail

Cada mensagem do formulário `contato` vira um e-mail com o visual do site para operacional@realcredmais.com.br. Quem envia é a função `netlify/functions/submission-created.mjs`, que o Netlify chama sozinho depois do filtro de spam, usando a conta do Google Workspace da RealCred+. O modelo do e-mail fica em `emails/lead.mjs`.

A função precisa da variável `GMAIL_APP_PASSWORD` no Netlify (senha de app de operacional@, marcada como secreta). Sem ela, a função não envia nada e só o aviso simples do Netlify chega (Forms, Form notifications).
