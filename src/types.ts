export type DocumentOrientation = 'portrait' | 'landscape';
export type FontFamily = 'Arial' | 'Times New Roman' | 'Calibri';
export type FontSize = '9pt' | '10pt' | '11pt' | '12pt';
export type MarginOption = 'minimal' | 'narrow' | 'normal';

export interface DocumentSettings {
  orientation: DocumentOrientation;
  fontFamily: FontFamily;
  fontSize: FontSize;
  margin: MarginOption;
  zoom: number;
}

export interface InstitutionalHeader {
  escola: string;
  municipio: string;
  dre: string;
  docente: string;
  bimestre: string;
  turma: string;
  turno: string;
  componente_curricular: string;
}

export interface DayPlan {
  id: string;
  data: string;
  dia_semana: string;
  objetos_conhecimento: string;
  habilidades_bncc: string;
  desenvolvimento: string;
  recursos: string;
}

export interface WeeklyPlanState {
  cabecalho: InstitutionalHeader;
  dias: DayPlan[];
}

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  base64: string;
}

export interface PlanHistoryItem {
  id: string;
  title: string;
  savedAt: string;
  plan: WeeklyPlanState;
}
