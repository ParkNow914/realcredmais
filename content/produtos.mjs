// Páginas de produto. Cada uma vira /<slug>/index.html pelo scripts/gerar.mjs.
// Regras conferidas em 16/10/2026; as fontes estão em content/fontes.mjs.

export const PRODUTOS = [
  {
    slug: 'consignado-inss',
    tipo: 'inss',
    nome: 'Consignado INSS',
    title: 'Consignado INSS em até 108 parcelas | Simule sem CPF | RealCred+ Lorena',
    description:
      'Empréstimo consignado para aposentados e pensionistas do INSS: juros de até 1,85% ao mês, até 108 parcelas e margem de 35% do benefício. Simule sem CPF e fale com a loja de Lorena.',
    h1: 'Consignado INSS para aposentados e pensionistas',
    lead: 'Juros com teto de 1,85% ao mês, até 108 parcelas e desconto direto no benefício. Veja a parcela agora e, se fizer sentido, a gente continua pelo WhatsApp ou na loja em Lorena.',
    regras: [
      ['Juros', 'Até 1,85% ao mês no empréstimo (teto definido pelo INSS e mantido pelo STF em 2026)', 'stfTeto'],
      ['Prazo', 'Até 108 parcelas desde maio de 2026 (antes eram 96)', 'in204'],
      ['Margem', '35% do benefício para empréstimos. A margem total voltou a 45% em setembro de 2026, com 5% para cada cartão.', 'margem45'],
      ['Cartões', 'Novas contratações de cartão consignado e cartão benefício estão suspensas desde maio de 2026', 'tcuCartoes'],
      ['Confirmação', 'Toda contratação precisa ser confirmada por você com biometria facial no Meu INSS, em até 5 dias', 'biometria'],
      ['Carência', 'Pode ter carência de até 90 dias para a primeira parcela, conforme o banco. Os juros correm nesse período.', 'in204'],
    ],
    secoes: [
      {
        h2: 'O que mudou em 2026',
        html: `<p>Este ano trouxe as maiores mudanças no consignado do INSS desde 2022:</p>
<ul>
<li><strong>108 parcelas.</strong> A Instrução Normativa PRES/INSS nº 204/2026 aumentou o prazo máximo de 96 para 108 meses. Com mais parcelas, o valor de cada uma cai, e no refinanciamento sobra mais dinheiro para você.</li>
<li><strong>Biometria obrigatória.</strong> Pela Lei 15.327/2026, a proposta aparece no Meu INSS como pendente e só vale depois que você confirma com reconhecimento facial. Contratar por telefone ou por procuração ficou proibido.</li>
<li><strong>Margem de volta a 45%.</strong> A Medida Provisória 1.355 tinha reduzido a margem para 40%, mas perdeu a validade em 31 de agosto. Desde 2 de setembro o INSS mostra a margem recalculada.</li>
<li><strong>Cartões suspensos.</strong> O Acórdão 1.094/2026 do TCU suspendeu novas contratações de cartão consignado (RMC) e cartão benefício (RCC). O empréstimo pessoal consignado continua liberado.</li>
</ul>`,
      },
      {
        h2: 'Quanto você pode pegar',
        html: `<p>A parcela de todos os seus empréstimos consignados juntos pode chegar a 35% do valor líquido do benefício. Quem recebe R$ 2.000,00, por exemplo, pode comprometer até R$ 700,00 por mês com empréstimos.</p>
<p>O valor liberado depende da margem que ainda está livre, da taxa do banco e do número de parcelas. Com R$ 300,00 de margem, a 1,85% ao mês em 108 parcelas, dá para liberar perto de R$ 14.000,00 (em 96 parcelas seriam cerca de R$ 13.400,00). Use o simulador desta página para fazer a conta com os seus números.</p>`,
      },
      {
        h2: 'Contrato novo, refinanciamento ou portabilidade',
        html: `<ul>
<li><strong>Contrato novo:</strong> usa a margem livre do benefício.</li>
<li><strong>Refinanciamento:</strong> renegocia um contrato que você já tem e pode liberar um valor extra, o chamado troco.</li>
<li><strong>Portabilidade:</strong> leva a dívida para um banco com taxa menor. Veja a <a href="/portabilidade-de-consignado/">página de portabilidade</a>.</li>
</ul>
<p>Na loja, comparamos as três opções antes de você decidir.</p>`,
      },
    ],
    faq: [
      ['Quem pode contratar o consignado do INSS?', 'Aposentados e pensionistas do INSS com margem livre no benefício. Alguns benefícios assistenciais e situações específicas têm restrições; conferimos o seu caso pelo extrato do INSS.'],
      ['Preciso ir até a loja?', 'Não é obrigatório. Dá para fazer tudo pelo WhatsApp, e você confirma a contratação com a biometria facial no aplicativo Meu INSS. Se preferir, atendemos na loja do Centro de Lorena, e a gente ajuda com o aplicativo.'],
      ['Quanto tempo leva para o dinheiro cair?', 'Depois da confirmação no Meu INSS e da aprovação do banco, costuma levar poucos dias úteis. O prazo exato depende do banco.'],
      ['Posso ter carência para começar a pagar?', 'Desde maio de 2026, os bancos podem oferecer carência de até 90 dias. Os juros continuam correndo nesse período, então a dívida total fica maior. Mostramos as duas opções lado a lado.'],
    ],
    fontes: ['in204', 'biometria', 'margem45', 'tcuCartoes', 'stfTeto'],
    relacionados: ['portabilidade-de-consignado', 'credito-pessoal', 'antecipacao-saque-aniversario-fgts'],
    artigos: ['consignado-inss-2026-o-que-mudou', 'golpes-no-consignado'],
  },
  {
    slug: 'consignado-servidor-publico',
    tipo: 'servidor',
    nome: 'Consignado para servidor público',
    title: 'Consignado para servidor público federal, estadual e municipal | RealCred+ Lorena',
    description:
      'Consignado para servidores públicos: federais (SIAPE) em até 120 parcelas e margem de 45%; estaduais e municipais conforme o convênio. Simule sem CPF na RealCred+ em Lorena.',
    h1: 'Consignado para servidor público',
    lead: 'Para servidores federais, estaduais e municipais. A parcela sai direto da folha, com juros menores que os do crédito pessoal. Simule agora e fale com a gente pelo WhatsApp.',
    regras: [
      ['Prazo (federal)', 'Até 120 parcelas para servidores do Executivo federal (SIAPE), pelo Decreto 12.957/2026', 'siape120'],
      ['Margem (federal)', '45% da remuneração: 35% para empréstimos e 10% para cartões, após o fim da MP 1.355', 'siapeMargem'],
      ['Estaduais e municipais', 'Prazo, margem e taxa seguem o convênio de cada órgão', null],
      ['Juros', 'Conforme convênio, órgão pagador e banco. Compare sempre o CET.', null],
      ['Documentos', 'RG, CPF e o último contracheque', null],
    ],
    secoes: [
      {
        h2: 'Como funciona para cada tipo de servidor',
        html: `<p><strong>Federal (SIAPE):</strong> em maio de 2026 o prazo máximo subiu de 96 para 120 parcelas. A margem total voltou a 45% com o fim da Medida Provisória 1.355, em 31 de agosto.</p>
<p><strong>Estadual (como o Governo de São Paulo) e municipal:</strong> cada órgão tem seu próprio convênio com os bancos, com regras de margem, prazo e taxa. Conferimos o convênio do seu órgão antes de simular a proposta final.</p>`,
      },
      {
        h2: 'Contrato novo, refinanciamento e portabilidade',
        html: `<p>Você pode pegar um contrato novo com a margem livre, refinanciar um contrato antigo para liberar um valor extra ou trazer a dívida para um banco com taxa menor. Com 120 parcelas no federal, o refinanciamento costuma liberar mais dinheiro com uma parcela parecida.</p>`,
      },
    ],
    faq: [
      ['Servidor comissionado ou temporário pode contratar?', 'Depende do convênio do órgão. Muitos aceitam só servidores efetivos; alguns aceitam comissionados com regras diferentes.'],
      ['A margem do meu contracheque está certa?', 'A margem consignável aparece no contracheque ou no portal do órgão (no federal, pelo SouGov.br). Se tiver dúvida, mande uma foto do contracheque pelo WhatsApp e a gente confere.'],
      ['Aposentados e pensionistas do serviço público podem contratar?', 'Sim, em geral pelo mesmo convênio do órgão de origem.'],
    ],
    fontes: ['siape120', 'siapeMargem'],
    relacionados: ['portabilidade-de-consignado', 'consignado-militar', 'credito-pessoal'],
    artigos: ['margem-consignavel-2026'],
  },
  {
    slug: 'consignado-militar',
    tipo: 'militar',
    nome: 'Consignado para militares',
    title: 'Consignado para militares do Exército, Marinha e Aeronáutica | RealCred+ Lorena',
    description:
      'Empréstimo consignado para militares da ativa, da reserva e pensionistas das Forças Armadas, com desconto em folha. Simule sem CPF e fale com a RealCred+ em Lorena.',
    h1: 'Consignado para militares',
    lead: 'Para militares da ativa, da reserva e pensionistas do Exército, da Marinha e da Aeronáutica. A parcela sai direto do contracheque. Simule e confira a sua margem com a gente.',
    regras: [
      ['Quem pode', 'Militares da ativa, da reserva, reformados e pensionistas, conforme o convênio de cada Força', null],
      ['Margem', 'Calculada pela regra de cada Força. No Exército, parte de 70% da remuneração, menos os descontos obrigatórios e outros já autorizados', 'militarEb'],
      ['Mínimo garantido', 'A lei garante que o militar receba pelo menos uma parte mínima da remuneração depois dos descontos', null],
      ['Temporários', 'No Exército, consignações acompanham o contrato, renovado a cada 12 meses, até 8 anos', 'militarEb'],
      ['Documentos', 'RG, CPF e contracheque', null],
    ],
    secoes: [
      {
        h2: 'Como a margem do militar é calculada',
        html: `<p>A margem das Forças Armadas é diferente da do INSS. No Exército, por exemplo, o sistema de consignações parte de 70% da remuneração e desconta os descontos obrigatórios e as consignações já existentes. O resultado pode até ficar negativo quando há muitos descontos obrigatórios.</p>
<p>Por isso a gente confere o seu contracheque antes de fazer a proposta. O simulador desta página usa uma taxa de referência; a taxa real depende do convênio e do banco.</p>`,
      },
    ],
    faq: [
      ['Militar temporário pode fazer consignado?', 'Pode, com regras próprias. No Exército, as consignações de temporários ficam bloqueadas nos últimos 4 meses do oitavo ano de contrato.'],
      ['Pensionista de militar pode contratar?', 'Sim, pelo convênio da Força de origem.'],
    ],
    fontes: ['militarEb'],
    relacionados: ['consignado-servidor-publico', 'portabilidade-de-consignado', 'credito-pessoal'],
    artigos: ['margem-consignavel-2026'],
  },
  {
    slug: 'credito-do-trabalhador',
    tipo: 'clt',
    nome: 'Crédito do Trabalhador (consignado CLT)',
    title: 'Crédito do Trabalhador: consignado CLT com garantia do FGTS | RealCred+ Lorena',
    description:
      'Consignado para quem tem carteira assinada: desconto em folha, margem de 35% e, com garantia do FGTS, juros de até 1,99% ao mês. Simule sem CPF na RealCred+ em Lorena.',
    h1: 'Crédito do Trabalhador, o consignado de quem tem carteira assinada',
    lead: 'Para empregados com carteira assinada, domésticos, rurais e empregados de MEI. A parcela sai da folha e, se você der o FGTS como garantia, os juros têm teto de 1,99% ao mês.',
    regras: [
      ['Base legal', 'Lei 15.179/2025 (programa Crédito do Trabalhador)', null],
      ['Margem', 'Até 35% do salário, somando todos os consignados', null],
      ['Com garantia do FGTS', 'Juros de até 1,99% ao mês, pela Portaria MTE 1.115/2026', 'cltGarantia'],
      ['O que pode ser garantia', 'Até 10% do saldo do FGTS (para quem está no saque-rescisão), até 100% da multa rescisória e até 35% das verbas rescisórias', 'cltPortaria'],
      ['Portabilidade', 'Permitida desde junho de 2025', null],
      ['Documentos', 'RG, CPF, dados do vínculo e autorização de consulta', null],
    ],
    secoes: [
      {
        h2: 'Garantia do FGTS: juros mais baixos',
        html: `<p>Desde junho de 2026, você pode oferecer parte do FGTS e das verbas rescisórias como garantia do empréstimo. Em troca, o banco fica limitado a juros de 1,99% ao mês. Sem garantia, as taxas do programa costumam ficar bem acima disso.</p>
<p>A garantia só é usada se você sair da empresa e ainda houver saldo devedor. A ordem é: até 10% do saldo do FGTS e, se faltar, até 100% da multa rescisória.</p>`,
      },
      {
        h2: 'Para que serve',
        html: `<p>O uso mais comum é trocar dívidas caras, como cartão de crédito e cheque especial, por uma parcela fixa com juros menores. Antes de contratar, a gente monta com você a conta de quanto sai cada opção.</p>`,
      },
    ],
    faq: [
      ['Preciso pedir autorização para a empresa?', 'Não. A contratação é feita pelo app Carteira de Trabalho Digital ou pelo banco, e a empresa só faz o desconto em folha.'],
      ['E se eu for demitido?', 'O desconto para na folha e o saldo pode ser coberto pelas garantias que você deu, na ordem prevista. O que sobrar continua como dívida com o banco.'],
      ['Tenho saque-aniversário. Posso dar o FGTS como garantia?', 'A garantia de até 10% do saldo do FGTS vale para quem está no saque-rescisão. A multa rescisória e as verbas rescisórias podem ser usadas nos dois casos, conforme as regras do programa.'],
    ],
    fontes: ['cltGarantia', 'cltPortaria'],
    relacionados: ['antecipacao-saque-aniversario-fgts', 'credito-pessoal', 'portabilidade-de-consignado'],
    artigos: ['credito-do-trabalhador-garantia-fgts'],
  },
  {
    slug: 'antecipacao-saque-aniversario-fgts',
    tipo: 'fgts',
    nome: 'Antecipação do saque-aniversário do FGTS',
    title: 'Antecipação do saque-aniversário FGTS: 5 anos até 31/10/2026 | RealCred+',
    description:
      'Antecipe o saque-aniversário do FGTS sem parcelas mensais. Até 31/10/2026 dá para antecipar até 5 anos; a partir de 01/11/2026, até 3. Simule com o seu saldo.',
    h1: 'Antecipação do saque-aniversário do FGTS',
    lead: 'Receba hoje o valor de saques anuais futuros, sem parcela no mês. Até 31 de outubro de 2026 dá para antecipar até 5 anos. A partir de 1º de novembro, o limite cai para 3.',
    regras: [
      ['Quantos anos', 'Até 5 saques anuais em contratos feitos até 31/10/2026; até 3 a partir de 01/11/2026', 'fgts1130'],
      ['Valor por saque', 'De R$ 100 a R$ 500 em cada ano antecipado', 'fgts1130'],
      ['Carência', 'É preciso ter aderido ao saque-aniversário há pelo menos 90 dias', 'fgtsRegras'],
      ['Frequência', 'Uma operação por ano', 'fgtsRegras'],
      ['Parcelas', 'Nenhuma. O banco recebe direto do FGTS no mês do seu aniversário.', null],
      ['Contratos antigos', 'Quem já antecipou 5 anos continua com o contrato como está', 'fgts1130'],
    ],
    secoes: [
      {
        h2: 'O que muda em 1º de novembro de 2026',
        html: `<p>A Resolução nº 1.130 do Conselho Curador do FGTS reduziu a antecipação de 5 para 3 anos para contratos novos a partir de 1º de novembro de 2026. Na prática, o valor máximo por operação cai de R$ 2.500,00 para R$ 1.500,00. Quem contratar até 31 de outubro ainda pode antecipar até 5 anos.</p>`,
      },
      {
        h2: 'Quando vale a pena',
        html: `<p>A antecipação faz sentido para quitar uma dívida mais cara, como o rotativo do cartão. O ponto de atenção: com o saque-aniversário, se você for demitido sem justa causa, recebe a multa de 40%, mas não o saldo inteiro do FGTS. Avalie isso antes de aderir.</p>`,
      },
    ],
    faq: [
      ['Como sei meu saldo do FGTS?', 'No aplicativo FGTS da Caixa. Lá também dá para aderir ao saque-aniversário e autorizar o banco a consultar o saldo.'],
      ['Posso voltar para o saque-rescisão?', 'Pode pedir a volta, mas ela só vale a partir do 25º mês depois do pedido, e não pode haver antecipação ativa.'],
      ['Tem consulta ao SPC ou Serasa?', 'Os bancos podem consultar, mas como a garantia é o próprio FGTS, a análise costuma ser mais simples que a de um empréstimo comum.'],
    ],
    fontes: ['fgts1130', 'fgtsRegras'],
    relacionados: ['credito-do-trabalhador', 'credito-pessoal', 'consignado-inss'],
    artigos: ['saque-aniversario-fgts-2026'],
  },
  {
    slug: 'portabilidade-de-consignado',
    tipo: null,
    calculadora: true,
    nome: 'Portabilidade de consignado',
    title: 'Portabilidade de consignado: traga seu empréstimo e pague menos | RealCred+',
    description:
      'Leve seu consignado do INSS, de servidor ou militar para um banco com taxa menor, sem tarifa. Calcule a economia e peça uma proposta à RealCred+ em Lorena.',
    h1: 'Portabilidade de consignado',
    lead: 'Se outro banco oferece uma taxa menor, você pode levar a sua dívida para lá sem pagar tarifa. Calcule abaixo quanto a parcela pode cair.',
    regras: [
      ['Custo', 'A portabilidade é um direito e não tem tarifa', 'portabilidade'],
      ['Prazo do banco atual', 'Até 5 dias úteis para informar o saldo devedor ou fazer uma contraproposta', 'portabilidade'],
      ['Parcelas', 'O novo contrato não pode ter mais parcelas que as que faltam, salvo se você concordar', 'portabilidade'],
      ['INSS', 'Com o prazo de 108 parcelas, a portabilidade com refinanciamento pode liberar um valor extra', 'in204'],
    ],
    secoes: [
      {
        h2: 'Portabilidade pura ou com troco',
        html: `<p><strong>Portabilidade pura:</strong> você leva a dívida para um banco com taxa menor e a parcela cai.</p>
<p><strong>Portabilidade com refinanciamento:</strong> junto com a troca de banco, você renegocia o prazo e recebe um valor extra (o troco), mantendo uma parcela parecida. A gente simula as duas e mostra a diferença no total pago.</p>`,
      },
      {
        h2: 'O que levar',
        html: `<p>O extrato do empréstimo ou o extrato do INSS (Meu INSS), com o número do contrato, o valor da parcela e quantas faltam. Se for servidor ou militar, o contracheque.</p>`,
      },
    ],
    faq: [
      ['O banco atual pode impedir a portabilidade?', 'Não. Ele pode fazer uma contraproposta para você ficar, mas a decisão é sua.'],
      ['Quanto tempo demora?', 'Costuma levar de alguns dias a duas semanas, dependendo da resposta do banco atual.'],
    ],
    fontes: ['portabilidade', 'in204'],
    relacionados: ['consignado-inss', 'consignado-servidor-publico', 'consignado-militar'],
    artigos: ['portabilidade-de-consignado-passo-a-passo'],
  },
  {
    slug: 'credito-pessoal',
    tipo: 'pessoal',
    nome: 'Crédito pessoal',
    title: 'Crédito pessoal em Lorena: compare o CET antes de contratar | RealCred+',
    description:
      'Crédito pessoal de R$ 500 a R$ 100.000 em até 60 parcelas, com análise em vários bancos. Veja quando o consignado sai mais barato e simule sem CPF.',
    h1: 'Crédito pessoal',
    lead: 'Para quem não tem consignado disponível. Buscamos a proposta em mais de um banco e mostramos o Custo Efetivo Total antes de você decidir.',
    regras: [
      ['Valor', 'De R$ 500 a R$ 100.000', null],
      ['Prazo', 'Até 60 parcelas', null],
      ['Juros', 'Variam por banco, perfil e garantia. Não existe teto geral como no consignado.', null],
      ['Documentos', 'RG, CPF, comprovante de residência e de renda', null],
    ],
    secoes: [
      {
        h2: 'Antes de contratar, veja se tem consignado',
        html: `<p>Se você é aposentado, servidor, militar ou tem carteira assinada, o consignado quase sempre sai bem mais barato que o crédito pessoal, porque a parcela é descontada direto da renda. Vale conferir primeiro o <a href="/consignado-inss/">consignado INSS</a>, o <a href="/consignado-servidor-publico/">de servidor</a> ou o <a href="/credito-do-trabalhador/">Crédito do Trabalhador</a>.</p>`,
      },
      {
        h2: 'Compare pelo CET',
        html: `<p>O Custo Efetivo Total soma juros, tarifas, seguros e impostos. Duas propostas com a mesma taxa podem ter CET bem diferentes. Pedimos o CET de cada banco por escrito antes de você assinar.</p>`,
      },
    ],
    faq: [
      ['Negativado pode pegar crédito pessoal?', 'É mais difícil, e as taxas sobem. Nesses casos, o consignado ou a antecipação do FGTS costumam ser alternativas melhores.'],
    ],
    fontes: [],
    relacionados: ['consignado-inss', 'credito-do-trabalhador', 'antecipacao-saque-aniversario-fgts'],
    artigos: ['emprestimo-consignado-vs-credito-pessoal', 'como-sair-das-dividas-2026'],
  },
];

export const LOCAL = {
  slug: 'emprestimo-consignado-lorena',
  title: 'Empréstimo consignado em Lorena, SP | Loja no Centro | RealCred+',
  description:
    'Empréstimo consignado em Lorena e região: INSS, servidores, militares, Crédito do Trabalhador e FGTS. Loja na R. Dr. José Machado Coelho de Castro, 238, no Centro. Atendimento na loja e pelo WhatsApp.',
  h1: 'Empréstimo consignado em Lorena',
  lead: 'A RealCred+ atende no Centro de Lorena desde 2019. Aposentados, servidores, militares e trabalhadores de Lorena e das cidades vizinhas são atendidos na loja ou pelo WhatsApp.',
};
