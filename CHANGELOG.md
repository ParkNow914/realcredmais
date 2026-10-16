# Changelog

## 2.0.0 · 16/10/2026

- O simulador agora calcula no navegador, sem CPF nem e-mail, e envia a simulação pelo WhatsApp. O simulador antigo dependia de uma função do Netlify que quebrava ao iniciar e mostrava erro para todo visitante.
- Contato pelo Netlify Forms, no lugar da rota `/api/contact`, que respondia 404.
- Chat com IA, servidor Express e função do Netlify removidos (não estavam configurados em produção e expunham a chave da OpenAI a abuso).
- Domínio corrigido para realcredmais.com.br no canonical, sitemap, robots, Open Graph e dados estruturados.
- Removidos os depoimentos de modelo, as avaliações inventadas nos dados estruturados e as promessas sem comprovação.
- Novo visual, mais leve e legível, com fontes próprias. O JavaScript da página inicial caiu de 69 KB (sem contar a API do Google Maps e o Font Awesome, que saíram) para 10 KB.
- Aviso contra golpe, razão social e texto de intermediação no rodapé.
- Página 404 real, fim do redirecionamento de tudo para a home e limpeza do service worker antigo.
- Google Analytics só depois do aceite de cookies.
- Dependências reduzidas a ferramentas de build: 0 vulnerabilidades no `npm audit`.

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-05-15

### Adicionado
- Modalidade Crédito do Trabalhador CLT na página inicial, simulador, FAQ e comparadores.
- Redirecionamentos 301 para os artigos atualizados de 2026.

### Alterado
- Artigos, sitemap, termos legais e textos de SEO atualizados para maio de 2026.
- Regras do Saque Aniversário FGTS revisadas conforme limites vigentes de antecipação.
- Conteúdo de taxas ajustado para diferenciar tetos do INSS de referências variáveis por instituição, perfil e CET.

## [1.1.0] - 2025-07-17

### Adicionado
- Configuração inicial do projeto
- Formulário de simulação de empréstimo
- Integração com Nodemailer para envio de e-mails
- Validação de formulário no cliente e servidor
- Configuração de CORS e segurança
- Documentação inicial do projeto
- Configuração de ferramentas de qualidade de código (ESLint, Prettier, Husky)

### Alterado
- Melhorias na estrutura de pastas
- Atualização das dependências
- Melhorias na documentação

### Corrigido
- Problemas de validação de formulário
- Configurações de CORS
- Problemas de segurança

## [1.0.0] - 2025-07-01

### Adicionado
- Versão inicial do projeto
