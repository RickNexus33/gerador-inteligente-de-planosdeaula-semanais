import { WeeklyPlanState, DayPlan, InstitutionalHeader } from '../types';

export const emptyHeader: InstitutionalHeader = {
  escola: '',
  municipio: '',
  dre: '',
  docente: '',
  bimestre: '',
  turma: '',
  turno: '',
  componente_curricular: '',
};

export const createEmptyDays = (): DayPlan[] => [
  {
    id: 'segunda',
    data: '',
    dia_semana: 'Segunda-feira',
    objetos_conhecimento: '',
    habilidades_bncc: '',
    desenvolvimento: '',
    recursos: '',
  },
  {
    id: 'terca',
    data: '',
    dia_semana: 'Terça-feira',
    objetos_conhecimento: '',
    habilidades_bncc: '',
    desenvolvimento: '',
    recursos: '',
  },
  {
    id: 'quarta',
    data: '',
    dia_semana: 'Quarta-feira',
    objetos_conhecimento: '',
    habilidades_bncc: '',
    desenvolvimento: '',
    recursos: '',
  },
  {
    id: 'quinta',
    data: '',
    dia_semana: 'Quinta-feira',
    objetos_conhecimento: '',
    habilidades_bncc: '',
    desenvolvimento: '',
    recursos: '',
  },
  {
    id: 'sexta',
    data: '',
    dia_semana: 'Sexta-feira',
    objetos_conhecimento: '',
    habilidades_bncc: '',
    desenvolvimento: '',
    recursos: '',
  },
];

export const emptyWeeklyPlan: WeeklyPlanState = {
  cabecalho: { ...emptyHeader },
  dias: createEmptyDays(),
};

// Initial state for new users starts completely clean as requested
export const initialWeeklyPlan: WeeklyPlanState = emptyWeeklyPlan;
