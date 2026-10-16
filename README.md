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
| Artigos | `artigos/*.html` (e incluir em `public/sitemap.xml`) |
| Redirecionamentos | `public/_redirects` |
| Cabeçalhos de segurança e cache | `netlify.toml` |

## Ligar o Google Analytics

1. Crie uma propriedade GA4 e copie o ID (`G-XXXXXXX`).
2. No Netlify, abra Site configuration, depois Environment variables, e crie `VITE_GA_MEASUREMENT_ID` com esse ID.
3. Faça um novo deploy. O aviso de cookies passa a aparecer, e os eventos `clique_whatsapp`, `simulacao_calculada`, `simulacao_whatsapp`, `portabilidade_calculada` e `contato_enviado` começam a ser registrados.

## Receber o formulário por e-mail

No Netlify, abra Forms, depois Form notifications, e adicione o e-mail que deve receber as mensagens do formulário `contato`.
