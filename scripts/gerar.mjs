// Gera as páginas de produto, a página de Lorena, os artigos novos, o índice de
// artigos e o sitemap a partir de content/. Roda antes do vite (npm run build).
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { PRODUTOS, LOCAL } from '../content/produtos.mjs';
import { ARTIGOS_NOVOS } from '../content/artigos.mjs';
import { FONTES, ATUALIZADO } from '../content/fontes.mjs';

const RAIZ = join(import.meta.dirname, '..');
const SITE = 'https://realcredmais.com.br';
const WA = '5512982827447';

// Artigos escritos à mão, que também entram no índice e no sitemap.
const ARTIGOS_ANTIGOS = [
  {
    slug: 'saque-aniversario-fgts-2026',
    titulo: 'Saque-aniversário do FGTS: o que muda em 1º de novembro de 2026',
    resumo: 'Antecipação cai de 5 para 3 anos em contratos novos. Veja quem é afetado.',
    capa: 'capa-fgts',
    data: '2026-10-16',
  },
  {
    slug: 'emprestimo-consignado-vs-credito-pessoal',
    titulo: 'Consignado ou crédito pessoal: qual escolher?',
    resumo: 'Taxas, prazos e riscos lado a lado para escolher sem pressa.',
    capa: 'capa-comparativo',
    data: '2026-10-16',
  },
  {
    slug: 'como-sair-das-dividas-2026',
    titulo: 'Como sair das dívidas em 2026',
    resumo: 'Um passo a passo para organizar as contas e reduzir os juros.',
    capa: 'capa-dividas',
    data: '2026-05-15',
  },
];

const TODOS_ARTIGOS = [
  ...ARTIGOS_NOVOS.map((a) => ({ slug: a.slug, titulo: a.titulo, resumo: a.resumo, capa: `capa-${a.slug}`, data: ATUALIZADO.iso })),
  ...ARTIGOS_ANTIGOS,
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const wa = (texto) => `https://wa.me/${WA}?text=${encodeURIComponent(texto)}`;
const compartilhar = (titulo, url) => `https://wa.me/?text=${encodeURIComponent(`${titulo} ${url}`)}`;
const jsonLd = (obj) => `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n    </script>`;

function head({ title, description, url, imagem, tipo = 'website', ld, script = '/src/site.js' }) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${url}" />
    <meta name="theme-color" content="#061626" />
    <meta property="og:type" content="${tipo}" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:site_name" content="RealCred+" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${SITE}/img/${imagem}.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32.png" />
    <link rel="apple-touch-icon" href="/img/apple-touch-icon.png" />
    ${jsonLd(ld)}
    <script type="module" src="${script}"></script>
  </head>`;
}

const breadcrumb = (itens) => ({
  '@type': 'BreadcrumbList',
  itemListElement: itens.map(([nome, url], i) => ({ '@type': 'ListItem', position: i + 1, name: nome, item: url })),
});

const empresa = { '@id': `${SITE}/#empresa`, '@type': ['FinancialService', 'LocalBusiness'], name: 'RealCred+' };

function migalhas(itens) {
  return `<nav class="crumbs" aria-label="Você está em"><ol>${itens
    .map(([nome, href], i) => (i < itens.length - 1 ? `<li><a href="${href}">${esc(nome)}</a></li>` : `<li aria-current="page">${esc(nome)}</li>`))
    .join('')}</ol></nav>`;
}

function regras(lista) {
  return `<dl class="rules">${lista
    .map(([rotulo, valor, fonte]) => {
      const link = fonte ? ` <a class="rules__src" href="${FONTES[fonte].url}" target="_blank" rel="noopener nofollow">fonte</a>` : '';
      return `<div class="rules__row"><dt>${esc(rotulo)}</dt><dd>${esc(valor)}${link}</dd></div>`;
    })
    .join('')}</dl>`;
}

function faq(lista) {
  return `<div class="faq">${lista.map(([p, r]) => `<details><summary>${esc(p)}</summary><p>${esc(r)}</p></details>`).join('')}</div>`;
}

function listaFontes(chaves) {
  if (!chaves.length) return '';
  return `<section class="sources" aria-labelledby="fontes-titulo"><h2 id="fontes-titulo">Fontes</h2><ol>${chaves
    .map((k) => `<li><a href="${FONTES[k].url}" target="_blank" rel="noopener nofollow">${esc(FONTES[k].nome)}</a></li>`)
    .join('')}</ol><p>Regras conferidas em ${ATUALIZADO.texto}. As condições finais dependem da análise de cada banco.</p></section>`;
}

const produtoPorSlug = Object.fromEntries(PRODUTOS.map((p) => [p.slug, p]));
const artigoPorSlug = Object.fromEntries(TODOS_ARTIGOS.map((a) => [a.slug, a]));

function cartoesRelacionados(produtos = [], artigos = []) {
  const itens = [
    ...produtos.map((s) => ({ href: `/${s}/`, titulo: produtoPorSlug[s].nome, texto: produtoPorSlug[s].lead.split('. ')[0] + '.' })),
    ...artigos.map((s) => ({ href: `/artigos/${s}.html`, titulo: artigoPorSlug[s].titulo, texto: artigoPorSlug[s].resumo })),
  ];
  if (!itens.length) return '';
  return `<section class="section section--tint" aria-labelledby="veja-titulo"><div class="wrap"><div class="section__head"><h2 id="veja-titulo">Veja também</h2></div><ul class="link-grid">${itens
    .map((i) => `<li><a href="${i.href}"><strong>${esc(i.titulo)}</strong><span>${esc(i.texto)}</span></a></li>`)
    .join('')}</ul></div></section>`;
}

function botaoCompartilhar(titulo, url, local) {
  return `<a class="btn btn--ghost btn--small share" href="${compartilhar(titulo, url)}" target="_blank" rel="noopener" data-wa="${local}">
              <svg class="icon" aria-hidden="true"><use href="#i-wa" /></svg> Mandar para alguém no WhatsApp
            </a>`;
}

function paginaProduto(p) {
  const url = `${SITE}/${p.slug}/`;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb([
        ['Início', `${SITE}/`],
        [p.nome, url],
      ]),
      {
        '@type': 'Service',
        name: p.nome,
        description: p.description,
        serviceType: p.nome,
        url,
        provider: empresa,
        areaServed: [{ '@type': 'City', name: 'Lorena' }, { '@type': 'AdministrativeArea', name: 'Vale do Paraíba' }],
      },
      {
        '@type': 'FAQPage',
        mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  };
  const lateral = p.calculadora ? '<!-- @portabilidade -->' : '<!-- @simulador -->';
  return `${head({ title: p.title, description: p.description, url, imagem: `og-${p.slug}`, ld, script: '/src/home.js' })}
  <body data-produto="${p.tipo || ''}">
    <!-- @header -->

    <main id="conteudo" tabindex="-1">
      <section class="hero hero--page" id="simular" aria-labelledby="pagina-titulo">
        <div class="wrap hero__grid">
          <div class="hero__copy">
            ${migalhas([
              ['Início', '/'],
              [p.nome, ''],
            ])}
            <h1 id="pagina-titulo">${esc(p.h1)}</h1>
            <p class="hero__lead">${esc(p.lead)}</p>
            <p class="hero__stamp">Regras conferidas em ${ATUALIZADO.texto}</p>
          </div>
          ${lateral}
        </div>
      </section>

      <section class="section" aria-labelledby="regras-titulo">
        <div class="wrap rules-layout">
          <div class="section__head">
            <h2 id="regras-titulo">Regras em vigor</h2>
            <p>O que vale hoje, com o link de onde tiramos cada informação.</p>
          </div>
          ${regras(p.regras)}
        </div>
      </section>

      <section class="section section--tint">
        <div class="wrap doc__inner prose">
          ${p.secoes.map((s) => `<h2>${esc(s.h2)}</h2>\n${s.html}`).join('\n')}
          <div class="share-row">${botaoCompartilhar(p.h1, url, `compartilhar-${p.slug}`)}</div>
        </div>
      </section>

      <section class="section" aria-labelledby="duvidas-titulo">
        <div class="wrap faq-layout">
          <div class="section__head">
            <h2 id="duvidas-titulo">Dúvidas sobre ${esc(p.nome.charAt(0).toLowerCase() + p.nome.slice(1))}</h2>
            <p>Não achou sua pergunta? Mande no WhatsApp.</p>
            <a class="btn btn--wa" href="${wa(`Olá! Tenho uma dúvida sobre ${p.nome}.`)}" target="_blank" rel="noopener" data-wa="duvida-${p.slug}">
              <svg class="icon" aria-hidden="true"><use href="#i-wa" /></svg> Perguntar no WhatsApp
            </a>
          </div>
          ${faq(p.faq)}
        </div>
      </section>

      ${cartoesRelacionados(p.relacionados, p.artigos)}

      <div class="wrap doc__inner">${listaFontes(p.fontes)}</div>
    </main>

    <!-- @footer -->
  </body>
</html>
`;
}

function paginaLocal() {
  const url = `${SITE}/${LOCAL.slug}/`;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb([
        ['Início', `${SITE}/`],
        ['Consignado em Lorena', url],
      ]),
    ],
  };
  const servicos = PRODUTOS.map(
    (p) => `<li><a href="/${p.slug}/"><strong>${esc(p.nome)}</strong><span>${esc(p.lead.split('. ')[0])}.</span></a></li>`
  ).join('');
  return `${head({ title: LOCAL.title, description: LOCAL.description, url, imagem: 'og-home', ld, script: '/src/home.js' })}
  <body data-produto="inss">
    <!-- @header -->

    <main id="conteudo" tabindex="-1">
      <section class="hero hero--page" id="simular" aria-labelledby="pagina-titulo">
        <div class="wrap hero__grid">
          <div class="hero__copy">
            ${migalhas([
              ['Início', '/'],
              ['Consignado em Lorena', ''],
            ])}
            <h1 id="pagina-titulo">${esc(LOCAL.h1)}</h1>
            <p class="hero__lead">${esc(LOCAL.lead)}</p>
            <p class="hero__stamp">R. Dr. José Machado Coelho de Castro, 238, Centro · seg. a sex., 9h às 18h</p>
          </div>
          <!-- @simulador -->
        </div>
      </section>

      <section class="section" aria-labelledby="loja-titulo">
        <div class="wrap visit">
          <div class="visit__copy">
            <h2 id="loja-titulo">Atendimento na loja, no Centro de Lorena</h2>
            <p>Traga RG, CPF e o extrato do INSS ou o contracheque. A gente consulta as condições nos bancos parceiros, explica cada proposta e ajuda a confirmar a contratação no aplicativo Meu INSS, quando for o caso.</p>
            <div class="visit__actions">
              <a class="btn btn--primary" href="https://www.google.com/maps/dir/?api=1&destination=R.+Dr.+Jos%C3%A9+Machado+Coelho+de+Castro,+238,+Lorena,+SP" target="_blank" rel="noopener">
                <svg class="icon" aria-hidden="true"><use href="#i-pin" /></svg> Como chegar
              </a>
              <a class="btn btn--ghost" href="https://www.google.com/maps/search/?api=1&query=RealCred%20Lorena" target="_blank" rel="noopener">
                <svg class="icon" aria-hidden="true"><use href="#i-star" /></svg> Ver avaliações no Google
              </a>
            </div>
          </div>
          <div class="visit__map">
            <iframe title="Mapa com a localização da RealCred+ em Lorena" src="https://www.google.com/maps?q=R.+Dr.+Jos%C3%A9+Machado+Coelho+de+Castro,+238,+Centro,+Lorena+-+SP&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </section>

      <section class="section section--tint" aria-labelledby="servicos-titulo">
        <div class="wrap">
          <div class="section__head"><h2 id="servicos-titulo">O que fazemos em Lorena</h2><p>Escolha o seu caso para ver as regras de 2026.</p></div>
          <ul class="link-grid">${servicos}</ul>
        </div>
      </section>

      <section class="section" aria-labelledby="duvidas-titulo">
        <div class="wrap faq-layout">
          <div class="section__head"><h2 id="duvidas-titulo">Dúvidas de quem é de Lorena e região</h2></div>
          ${faq([
            ['Atendem quem mora fora de Lorena?', 'Sim. Atendemos pelo WhatsApp quem mora nas cidades vizinhas e em qualquer lugar do Brasil, e a contratação do INSS é confirmada no aplicativo Meu INSS.'],
            ['Preciso marcar horário?', 'Não. A loja atende de segunda a sexta, das 9h às 18h. Se quiser, avise pelo WhatsApp que a gente já separa as informações.'],
            ['Vocês ajudam com o aplicativo Meu INSS?', 'Sim. Na loja, ajudamos a entrar no aplicativo e a fazer a confirmação com biometria facial, que é obrigatória desde maio de 2026.'],
          ])}
        </div>
      </section>
    </main>

    <!-- @footer -->
  </body>
</html>
`;
}

function paginaArtigo(a) {
  const url = `${SITE}/artigos/${a.slug}.html`;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: a.titulo,
        description: a.description,
        image: `${SITE}/img/capa-${a.slug}.jpg`,
        datePublished: ATUALIZADO.iso,
        dateModified: ATUALIZADO.iso,
        inLanguage: 'pt-BR',
        mainEntityOfPage: url,
        author: { '@type': 'Organization', name: 'RealCred+', url: `${SITE}/` },
        publisher: { '@id': `${SITE}/#empresa`, '@type': 'Organization', name: 'RealCred+', logo: { '@type': 'ImageObject', url: `${SITE}/img/icon-512.png` } },
      },
      breadcrumb([
        ['Início', `${SITE}/`],
        ['Artigos', `${SITE}/artigos/`],
        [a.titulo, url],
      ]),
    ],
  };
  return `${head({ title: a.title, description: a.description, url, imagem: `capa-${a.slug}`, tipo: 'article', ld })}
  <body>
    <!-- @header -->

    <main id="conteudo" tabindex="-1" class="doc">
      <div class="wrap doc__inner">
        ${migalhas([
          ['Início', '/'],
          ['Artigos', '/artigos/'],
          [a.titulo, ''],
        ])}
        <article>
          <h1>${esc(a.titulo)}</h1>
          <p class="doc__meta">Atualizado em ${ATUALIZADO.texto} · ${a.leitura}</p>
          <div class="prose">
${a.corpo}
          </div>
          <div class="share-row">${botaoCompartilhar(a.titulo, url, `compartilhar-${a.slug}`)}</div>
        </article>
        ${listaFontes(a.fontes)}
        <aside class="doc-cta" aria-labelledby="cta-titulo">
          <h2 id="cta-titulo">Quer ver os números do seu caso?</h2>
          <p>Simule sem informar CPF ou mande sua dúvida no WhatsApp. A primeira conversa não tem custo.</p>
          <div class="doc-cta__actions">
            <a class="btn btn--primary" href="/#simular">Simular agora</a>
            <a class="btn btn--wa" href="${wa('Olá! Li um artigo no site da RealCred+ e tenho uma dúvida.')}" target="_blank" rel="noopener" data-wa="artigo-${a.slug}">
              <svg class="icon" aria-hidden="true"><use href="#i-wa" /></svg> Perguntar no WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </main>

    <!-- @footer -->
  </body>
</html>
`;
}

function indiceArtigos() {
  const url = `${SITE}/artigos/`;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb([
        ['Início', `${SITE}/`],
        ['Artigos', url],
      ]),
      {
        '@type': 'Blog',
        name: 'Artigos da RealCred+',
        url,
        blogPost: TODOS_ARTIGOS.map((a) => ({ '@type': 'BlogPosting', headline: a.titulo, url: `${SITE}/artigos/${a.slug}.html`, dateModified: a.data })),
      },
    ],
  };
  const cards = TODOS_ARTIGOS.map(
    (a) => `<a class="article-card" href="/artigos/${a.slug}.html">
              <picture><source srcset="/img/${a.capa}-800.webp" type="image/webp" /><img src="/img/${a.capa}.jpg" alt="" width="800" height="420" loading="lazy" /></picture>
              <h2>${esc(a.titulo)}</h2>
              <p>${esc(a.resumo)}</p>
            </a>`
  ).join('\n            ');
  return `${head({
    title: 'Artigos sobre consignado, FGTS e crédito em 2026 | RealCred+',
    description: 'Guias atualizados sobre consignado INSS, margem consignável, Crédito do Trabalhador, FGTS, portabilidade e como evitar golpes.',
    url,
    imagem: 'og-home',
    ld,
  })}
  <body>
    <!-- @header -->

    <main id="conteudo" tabindex="-1" class="doc">
      <div class="wrap">
        ${migalhas([
          ['Início', '/'],
          ['Artigos', ''],
        ])}
        <div class="section__head">
          <h1>Artigos</h1>
          <p>Guias curtos sobre as dúvidas que mais aparecem na loja, com as regras de 2026 e os links das fontes.</p>
        </div>
        <div class="articles articles--index">
            ${cards}
        </div>
      </div>
    </main>

    <!-- @footer -->
  </body>
</html>
`;
}

function sitemap() {
  const urls = [
    [`${SITE}/`, ATUALIZADO.iso],
    ...PRODUTOS.map((p) => [`${SITE}/${p.slug}/`, ATUALIZADO.iso]),
    [`${SITE}/${LOCAL.slug}/`, ATUALIZADO.iso],
    [`${SITE}/artigos/`, ATUALIZADO.iso],
    ...TODOS_ARTIGOS.map((a) => [`${SITE}/artigos/${a.slug}.html`, a.data]),
    [`${SITE}/privacy-policy.html`, '2026-10-16'],
    [`${SITE}/terms-of-use.html`, '2026-10-16'],
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, d]) => `  <url><loc>${u}</loc><lastmod>${d}</lastmod></url>`).join('\n')}
</urlset>
`;
}

async function gravar(caminho, conteudo) {
  const destino = join(RAIZ, caminho);
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, conteudo, 'utf8');
}

for (const p of PRODUTOS) await gravar(`${p.slug}/index.html`, paginaProduto(p));
await gravar(`${LOCAL.slug}/index.html`, paginaLocal());
for (const a of ARTIGOS_NOVOS) await gravar(`artigos/${a.slug}.html`, paginaArtigo(a));
await gravar('artigos/index.html', indiceArtigos());
await gravar('public/sitemap.xml', sitemap());

export const PAGINAS_GERADAS = [
  ...PRODUTOS.map((p) => `${p.slug}/index.html`),
  `${LOCAL.slug}/index.html`,
  ...ARTIGOS_NOVOS.map((a) => `artigos/${a.slug}.html`),
  'artigos/index.html',
];
console.log(`gerar: ${PAGINAS_GERADAS.length} páginas e sitemap`);
