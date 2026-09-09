export interface BiblicalVerse {
  id: string;
  reference: string;
  book: string;
  chapterVerse: string;
  text: string;
  theme:
    | 'Planejamento'
    | 'Generosidade'
    | 'Mordomia'
    | 'Contentamento'
    | 'Diligência e Trabalho'
    | 'Integridade e Dívidas'
    | 'Provisão Divina';
  financialPrinciple: string;
}

export const BIBLICAL_FINANCIAL_VERSES: BiblicalVerse[] = [
  {
    id: 'v-prov-21-5',
    reference: 'Provérbios 21:5',
    book: 'Provérbios',
    chapterVerse: '21:5',
    text: 'Os planos bem elaborados do homem diligente conduzem à fartura, mas a pressa e a precipitação levam à pobreza.',
    theme: 'Planejamento',
    financialPrinciple: 'O planejamento financeiro contínuo e a diligência orçamentária evitam crises e garantem sustentabilidade.',
  },
  {
    id: 'v-prov-3-9-10',
    reference: 'Provérbios 3:9-10',
    book: 'Provérbios',
    chapterVerse: '3:9-10',
    text: 'Honra ao Senhor com os teus bens e com as primícias de toda a tua renda; e se encherão os teus celeiros abundantemente, e trasbordarão de vinho os teus lagares.',
    theme: 'Generosidade',
    financialPrinciple: 'Priorizar o Reino de Deus na gestão de recursos é a base espiritual para a prosperidade com propósito.',
  },
  {
    id: 'v-lucas-14-28',
    reference: 'Lucas 14:28',
    book: 'Lucas',
    chapterVerse: '14:28',
    text: 'Pois qual de vós, pretendendo construir uma torre, não se assenta primeiro para calcular a despesa e verificar se tem com que a concluir?',
    theme: 'Planejamento',
    financialPrinciple: 'Orçamento prévio e fluxo de caixa projetado são mandamentos de prudência para qualquer projeto ou ministério.',
  },
  {
    id: 'v-prov-27-23-24',
    reference: 'Provérbios 27:23-24',
    book: 'Provérbios',
    chapterVerse: '27:23-24',
    text: 'Procura conhecer o estado das tuas ovelhas e cuida com diligência dos teus rebanhos; porque as riquezas não duram para sempre.',
    theme: 'Mordomia',
    financialPrinciple: 'Conhecer detalhadamente as contas, extratos e patrimônio é dever de todo bom gestor e tesoureiro.',
  },
  {
    id: 'v-2cor-9-6-7',
    reference: '2 Coríntios 9:6-7',
    book: '2 Coríntios',
    chapterVerse: '9:6-7',
    text: 'Aquele que semeia pouco, pouco também ceifará; e o que semeia com fartura, com abundância também ceifará. Cada um contribua segundo tiver proposto no coração, não com tristeza ou por necessidade; porque Deus ama a quem dá com alegria.',
    theme: 'Generosidade',
    financialPrinciple: 'A generosidade desinteressada e planejada atrai a graça multiplicadora de Deus.',
  },
  {
    id: 'v-malaquias-3-10',
    reference: 'Malaquias 3:10',
    book: 'Malaquias',
    chapterVerse: '3:10',
    text: 'Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa; e provai-me nisto, diz o Senhor dos Exércitos, se não vos abrir as janelas do céu e não derramar sobre vós bênção sem medida.',
    theme: 'Mordomia',
    financialPrinciple: 'Fidelidade nas contribuições institucionais e eclesiásticas sustenta a missão e abre portas de bênçãos.',
  },
  {
    id: 'v-1tim-6-6-8',
    reference: '1 Timóteo 6:6-8',
    book: '1 Timóteo',
    chapterVerse: '6:6-8',
    text: 'De fato, grande fonte de lucro é a piedade com o contentamento. Porque nada temos trazido para o mundo, nem coisa alguma podemos levar dele. Tendo sustento e com que nos vestir, estejamos com isso satisfeitos.',
    theme: 'Contentamento',
    financialPrinciple: 'Viver dentro das próprias possibilidades e cultivar a gratidão traz verdadeira paz financeira.',
  },
  {
    id: 'v-romanos-13-8',
    reference: 'Romanos 13:8',
    book: 'Romanos',
    chapterVerse: '13:8',
    text: 'A ninguém fiqueis devendo coisa alguma, a não ser o amor recíproco; pois quem ama o próximo tem cumprido a lei.',
    theme: 'Integridade e Dívidas',
    financialPrinciple: 'Honrar compromissos no prazo e evitar o endividamento protege o testemunho e a credibilidade institucional.',
  },
  {
    id: 'v-filipenses-4-19',
    reference: 'Filipenses 4:19',
    book: 'Filipenses',
    chapterVerse: '4:19',
    text: 'E o meu Deus, segundo a sua riqueza em glória, há de suprir, em Cristo Jesus, cada uma de vossas necessidades.',
    theme: 'Provisão Divina',
    financialPrinciple: 'Após fazermos nossa parte com diligência e honestidade, descansamos na provisão soberana do Pai.',
  },
  {
    id: 'v-prov-13-11',
    reference: 'Provérbios 13:11',
    book: 'Provérbios',
    chapterVerse: '13:11',
    text: 'A riqueza obtida com facilidade logo desaparece, mas quem ajunta aos poucos, com trabalho diligente, a faz crescer.',
    theme: 'Diligência e Trabalho',
    financialPrinciple: 'O crescimento patrimonial sólido é fruto da constância, disciplina e trabalho diário.',
  },
  {
    id: 'v-eclesiastes-11-2',
    reference: 'Eclesiastes 11:2',
    book: 'Eclesiastes',
    chapterVerse: '11:2',
    text: 'Reparte com sete e ainda até com oito, porque não sabes que mal haverá sobre a terra.',
    theme: 'Planejamento',
    financialPrinciple: 'Diversificar fontes de receita e manter fundos de reserva e contingência protege contra tempos difíceis.',
  },
  {
    id: 'v-prov-22-7',
    reference: 'Provérbios 22:7',
    book: 'Provérbios',
    chapterVerse: '22:7',
    text: 'O rico domina sobre os pobres, e quem toma emprestado torna-se servo daquele que empresta.',
    theme: 'Integridade e Dívidas',
    financialPrinciple: 'A liberdade financeira e a autonomia missionária exigem rejeitar a escravidão das dívidas com juros altos.',
  },
  {
    id: 'v-salmos-37-21',
    reference: 'Salmos 37:21',
    book: 'Salmos',
    chapterVerse: '37:21',
    text: 'O ímpio pede emprestado e não devolve; o justo, porém, é misericordioso e generoso em dar.',
    theme: 'Integridade e Dívidas',
    financialPrinciple: 'A pontualidade e a retidão no pagamento a credores refletem a integridade do justo.',
  },
  {
    id: 'v-mateus-6-33',
    reference: 'Mateus 6:33',
    book: 'Mateus',
    chapterVerse: '6:33',
    text: 'Buscai, pois, em primeiro lugar, o seu reino e a sua justiça, e todas estas coisas vos serão acrescentadas.',
    theme: 'Provisão Divina',
    financialPrinciple: 'Alinhar as finanças com os propósitos do Reino atrai a direção e o cuidado do Senhor.',
  },
  {
    id: 'v-prov-16-3',
    reference: 'Provérbios 16:3',
    book: 'Provérbios',
    chapterVerse: '16:3',
    text: 'Confia ao Senhor as tuas obras, e os teus planos serão bem-sucedidos.',
    theme: 'Planejamento',
    financialPrinciple: 'Submeter o planejamento orçamentário e as metas financeiras à oração traz clareza e bom êxito.',
  },
  {
    id: 'v-hebreus-13-5',
    reference: 'Hebreus 13:5',
    book: 'Hebreus',
    chapterVerse: '13:5',
    text: 'Seja a vossa vida sem avareza; contentai-vos com as coisas que tendes; porque ele mesmo disse: De maneira alguma te deixarei, nunca jamais te abandonarei.',
    theme: 'Contentamento',
    financialPrinciple: 'O dinheiro é ferramenta, não senhor; a segurança do crente está na presença fiel de Deus.',
  },
];

export const getRandomFinancialVerse = (): BiblicalVerse => {
  const index = Math.floor(Math.random() * BIBLICAL_FINANCIAL_VERSES.length);
  return BIBLICAL_FINANCIAL_VERSES[index];
};

export const getVerseOfTheDay = (): BiblicalVerse => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % BIBLICAL_FINANCIAL_VERSES.length;
  return BIBLICAL_FINANCIAL_VERSES[index];
};
