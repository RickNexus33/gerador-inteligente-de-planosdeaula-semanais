import React, { useState } from 'react';
import { Search, X, BookOpen, Check, Copy } from 'lucide-react';

interface BnccHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSkill: (codeAndDesc: string) => void;
}

interface BnccSkill {
  code: string;
  component: string;
  year: string;
  description: string;
}

const BNCC_DATABASE: BnccSkill[] = [
  // Língua Portuguesa
  {
    code: 'EF15LP01',
    component: 'Língua Portuguesa',
    year: '1º ao 5º Ano',
    description: 'Identificar a função social de textos que circulam em campos da vida social dos quais participa cotidianamente.',
  },
  {
    code: 'EF15LP03',
    component: 'Língua Portuguesa',
    year: '1º ao 5º Ano',
    description: 'Localizar informações explícitas em textos de diferentes gêneros e extensões.',
  },
  {
    code: 'EF15LP04',
    component: 'Língua Portuguesa',
    year: '1º ao 5º Ano',
    description: 'Identificar o efeito de sentido produzido pelo uso de recursos expressivos gráfico-visuais em textos multissemióticos.',
  },
  {
    code: 'EF15LP05',
    component: 'Língua Portuguesa',
    year: '1º ao 5º Ano',
    description: 'Planejar, com a ajuda do professor, o texto que será produzido, considerando a situação comunicativa.',
  },
  {
    code: 'EF15LP06',
    component: 'Língua Portuguesa',
    year: '1º ao 5º Ano',
    description: 'Reler e revisar o texto produzido com a mediação do professor e a colaboração dos colegas.',
  },
  {
    code: 'EF35LP01',
    component: 'Língua Portuguesa',
    year: '3º ao 5º Ano',
    description: 'Ler e compreender textos com autonomia e fluência, silênciosa e oralmente.',
  },
  {
    code: 'EF35LP05',
    component: 'Língua Portuguesa',
    year: '3º ao 5º Ano',
    description: 'Inferir o sentido de palavras ou expressões desconhecidas em textos, com base no contexto da frase.',
  },
  {
    code: 'EF04LP01',
    component: 'Língua Portuguesa',
    year: '4º Ano',
    description: 'Grafar palavras utilizando regras de correspondência fonema-grafema regulares contextuais (R/RR, S/SS, Ç).',
  },
  {
    code: 'EF04LP05',
    component: 'Língua Portuguesa',
    year: '4º Ano',
    description: 'Identificar a função na leitura e usar na escrita pontuação (ponto final, de interrogação, exclamação, dois-pontos e travessão em diálogos).',
  },

  // Matemática
  {
    code: 'EF04MA01',
    component: 'Matemática',
    year: '4º Ano',
    description: 'Ler, escrever e ordenar números naturais até a ordem de centenas de milhar.',
  },
  {
    code: 'EF04MA03',
    component: 'Matemática',
    year: '4º Ano',
    description: 'Resolver e elaborar problemas com números naturais envolvendo adição e subtração.',
  },
  {
    code: 'EF04MA04',
    component: 'Matemática',
    year: '4º Ano',
    description: 'Utilizar as relações entre adição e subtração, bem como entre multiplicação e divisão, para ampliar as estratégias de cálculo.',
  },
  {
    code: 'EF04MA09',
    component: 'Matemática',
    year: '4º Ano',
    description: 'Reconhecer as frações unitárias mais usuais (1/2, 1/3, 1/4, 1/5, 1/10 e 1/100) como unidades de medida menores do que uma unidade.',
  },
  {
    code: 'EF04MA17',
    component: 'Matemática',
    year: '4º Ano',
    description: 'Associar prismas e pirâmides a suas planificações e analisar, nomear e comparar seus atributos (vértices, faces e arestas).',
  },
  {
    code: 'EF04MA22',
    component: 'Matemática',
    year: '4º Ano',
    description: 'Ler e registrar medidas e intervalos de tempo em horas, minutos e segundos em situações relacionadas ao seu cotidiano.',
  },
  {
    code: 'EF04MA27',
    component: 'Matemática',
    year: '4º Ano',
    description: 'Analisar dados apresentados em tabelas simples ou de dupla entrada e em gráficos de colunas ou pictóricos.',
  },

  // Ciências
  {
    code: 'EF04CI01',
    component: 'Ciências',
    year: '4º Ano',
    description: 'Identificar misturas na vida diária, com base em suas propriedades físicas observáveis, reconhecendo sua composição.',
  },
  {
    code: 'EF04CI04',
    component: 'Ciências',
    year: '4º Ano',
    description: 'Analisar e construir cadeias alimentares simples, reconhecendo a posição ocupada pelos seres vivos.',
  },
  {
    code: 'EF05CI02',
    component: 'Ciências',
    year: '5º Ano',
    description: 'Aplicar os conhecimentos sobre as mudanças de estado físico da água para explicar o ciclo hidrológico.',
  },

  // Geografia
  {
    code: 'EF04GE01',
    component: 'Geografia',
    year: '4º Ano',
    description: 'Selecionar, em diferentes fontes, informações sobre a formação cultural da população local e regional.',
  },
  {
    code: 'EF04GE09',
    component: 'Geografia',
    year: '4º Ano',
    description: 'Utilizar direções cardeais na localização de componentes físicos e humanos nas paisagens rurais e urbanas.',
  },
  {
    code: 'EF05GE08',
    component: 'Geografia',
    year: '5º Ano',
    description: 'Analisar a transformação das paisagens decorrente do desenvolvimento agropecuário e do processo de urbanização.',
  },

  // História
  {
    code: 'EF04HI01',
    component: 'História',
    year: '4º Ano',
    description: 'Reconhecer a história como resultado da ação do ser humano no tempo e no espaço, com base na identificação de mudanças e permanências.',
  },
  {
    code: 'EF04HI04',
    component: 'História',
    year: '4º Ano',
    description: 'Identificar as relações entre os indivíduos e a natureza e discutir o significado do nomadismo e da fixação das primeiras comunidades.',
  },
];

export const BnccHelperModal: React.FC<BnccHelperModalProps> = ({
  isOpen,
  onClose,
  onSelectSkill,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<string>('Todos');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const components = ['Todos', 'Língua Portuguesa', 'Matemática', 'Ciências', 'Geografia', 'História'];

  const filteredSkills = BNCC_DATABASE.filter((skill) => {
    const matchesComponent =
      selectedComponent === 'Todos' || skill.component === selectedComponent;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      skill.code.toLowerCase().includes(term) ||
      skill.description.toLowerCase().includes(term) ||
      skill.component.toLowerCase().includes(term);
    return matchesComponent && matchesSearch;
  });

  const handleCopy = (skill: BnccSkill) => {
    const text = `${skill.code}: ${skill.description}`;
    navigator.clipboard.writeText(text);
    setCopiedCode(skill.code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleInsert = (skill: BnccSkill) => {
    const text = `${skill.code}: ${skill.description}`;
    onSelectSkill(text);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold">Banco de Habilidades BNCC — Ensino Fundamental</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por código (ex: EF15LP03, EF04MA01) ou palavra-chave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {components.map((comp) => (
              <button
                key={comp}
                onClick={() => setSelectedComponent(comp)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  selectedComponent === comp
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
          {filteredSkills.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              Nenhuma habilidade encontrada para os critérios informados.
            </div>
          ) : (
            filteredSkills.map((skill) => (
              <div
                key={skill.code}
                className="py-3 hover:bg-slate-50 rounded-lg px-3 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {skill.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{skill.component}</span>
                    <span className="text-xs text-slate-400">• {skill.year}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{skill.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(skill)}
                    className="p-1.5 text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-md transition-colors flex items-center gap-1"
                    title="Copiar texto"
                  >
                    {copiedCode === skill.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleInsert(skill)}
                    className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
                  >
                    Inserir no Plano
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Base Nacional Comum Curricular (BNCC / MEC)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
