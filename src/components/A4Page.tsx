import React, { useRef } from 'react';
import {
  DayPlan,
  InstitutionalHeader,
  DocumentSettings,
} from '../types';
import { Sparkles, BookOpen, PlusCircle } from 'lucide-react';

interface A4PageProps {
  pageIndex: number;
  day: DayPlan;
  cabecalho: InstitutionalHeader;
  settings: DocumentSettings;
  onUpdateHeader: (field: keyof InstitutionalHeader, value: string) => void;
  onUpdateDay: (dayId: string, field: keyof DayPlan, value: string) => void;
  onOpenBnccHelper: (dayId: string) => void;
}

export const A4Page: React.FC<A4PageProps> = ({
  pageIndex,
  day,
  cabecalho,
  settings,
  onUpdateHeader,
  onUpdateDay,
  onOpenBnccHelper,
}) => {
  const isFirstPage = pageIndex === 0;

  // Compute margin padding style
  const marginStyles: Record<string, string> = {
    minimal: '8mm',
    narrow: '12.7mm',
    normal: '25mm',
  };
  const paddingValue = marginStyles[settings.margin] || '12.7mm';

  // Font family class
  const fontClasses: Record<string, string> = {
    Arial: 'font-arial',
    'Times New Roman': 'font-times',
    Calibri: 'font-calibri',
  };
  const fontClass = fontClasses[settings.fontFamily] || 'font-arial';

  // Font size style
  const fontSizeStyle = { fontSize: settings.fontSize };

  return (
    <div
      id={`a4-page-${pageIndex + 1}`}
      className={`a4-sheet ${settings.orientation} ${fontClass} relative border border-slate-300 print:border-none`}
      style={{
        padding: paddingValue,
        ...fontSizeStyle,
      }}
    >
      {/* Visual Page Tag for Screen Mode */}
      <div className="absolute top-2 right-3 text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-100/90 px-2 py-0.5 rounded no-print flex items-center gap-1">
        <span>Folha {pageIndex + 1} de 5</span>
        <span>•</span>
        <span className="text-indigo-600">{day.dia_semana}</span>
      </div>

      {/* 1. INSTITUTIONAL HEADER (EXCLUSIVELY ON FOLHA 1 - SEGUNDA-FEIRA) */}
      {isFirstPage && (
        <div className="mb-3 shrink-0">
          {/* Institutional Grid Table */}
          <div className="border-2 border-slate-900 bg-white text-slate-900 divide-y-2 divide-slate-900 text-[9pt] leading-tight">
            {/* Row 1: Escola + Município */}
            <div className="grid grid-cols-12 divide-x-2 divide-slate-900">
              <div className="col-span-8 p-1.5 bg-slate-50/50 flex items-baseline gap-1.5">
                <span className="font-bold text-slate-950 uppercase tracking-tight shrink-0">
                  ESCOLA:
                </span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateHeader('escola', e.currentTarget.textContent || '')}
                  className="flex-1 font-semibold outline-none px-1 rounded hover:bg-amber-50 focus:bg-amber-100/60"
                >
                  {cabecalho.escola}
                </span>
              </div>
              <div className="col-span-4 p-1.5 bg-slate-50/50 flex items-baseline gap-1.5">
                <span className="font-bold text-slate-950 uppercase tracking-tight shrink-0">
                  MUNICÍPIO:
                </span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateHeader('municipio', e.currentTarget.textContent || '')}
                  className="flex-1 font-semibold outline-none px-1 rounded hover:bg-amber-50 focus:bg-amber-100/60"
                >
                  {cabecalho.municipio}
                </span>
              </div>
            </div>

            {/* Row 2: DRE + Docente */}
            <div className="grid grid-cols-12 divide-x-2 divide-slate-900">
              <div className="col-span-6 p-1.5 flex items-baseline gap-1.5">
                <span className="font-bold text-slate-950 uppercase tracking-tight shrink-0">
                  DRE / NÚCLEO:
                </span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateHeader('dre', e.currentTarget.textContent || '')}
                  className="flex-1 outline-none px-1 rounded hover:bg-amber-50 focus:bg-amber-100/60"
                >
                  {cabecalho.dre}
                </span>
              </div>
              <div className="col-span-6 p-1.5 flex items-baseline gap-1.5">
                <span className="font-bold text-slate-950 uppercase tracking-tight shrink-0">
                  DOCENTE:
                </span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateHeader('docente', e.currentTarget.textContent || '')}
                  className="flex-1 font-semibold outline-none px-1 rounded hover:bg-amber-50 focus:bg-amber-100/60"
                >
                  {cabecalho.docente}
                </span>
              </div>
            </div>

            {/* Row 3: Bimestre + Turma + Turno */}
            <div className="grid grid-cols-12 divide-x-2 divide-slate-900">
              <div className="col-span-4 p-1.5 flex items-baseline gap-1.5">
                <span className="font-bold text-slate-950 uppercase tracking-tight shrink-0">
                  BIMESTRE:
                </span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateHeader('bimestre', e.currentTarget.textContent || '')}
                  className="flex-1 outline-none px-1 rounded hover:bg-amber-50 focus:bg-amber-100/60"
                >
                  {cabecalho.bimestre}
                </span>
              </div>
              <div className="col-span-4 p-1.5 flex items-baseline gap-1.5">
                <span className="font-bold text-slate-950 uppercase tracking-tight shrink-0">
                  TURMA:
                </span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateHeader('turma', e.currentTarget.textContent || '')}
                  className="flex-1 outline-none px-1 rounded hover:bg-amber-50 focus:bg-amber-100/60"
                >
                  {cabecalho.turma}
                </span>
              </div>
              <div className="col-span-4 p-1.5 flex items-baseline gap-1.5">
                <span className="font-bold text-slate-950 uppercase tracking-tight shrink-0">
                  TURNO:
                </span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateHeader('turno', e.currentTarget.textContent || '')}
                  className="flex-1 outline-none px-1 rounded hover:bg-amber-50 focus:bg-amber-100/60"
                >
                  {cabecalho.turno}
                </span>
              </div>
            </div>

            {/* Row 4: Componente Curricular */}
            <div className="p-1.5 flex items-baseline gap-1.5">
              <span className="font-bold text-slate-950 uppercase tracking-tight shrink-0">
                COMPONENTE CURRICULAR:
              </span>
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateHeader('componente_curricular', e.currentTarget.textContent || '')}
                className="flex-1 font-semibold outline-none px-1 rounded hover:bg-amber-50 focus:bg-amber-100/60"
              >
                {cabecalho.componente_curricular}
              </span>
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center mt-2.5 mb-2 border-b-2 border-slate-900 pb-1">
            <h1 className="text-[13pt] font-extrabold uppercase tracking-wide text-slate-950">
              PLANEJAMENTO SEMANAL DE AULAS
            </h1>
          </div>
        </div>
      )}

      {/* Mini top indicator on sheets 2 to 5 for professional context */}
      {!isFirstPage && (
        <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-300 text-[8pt] text-slate-500 uppercase tracking-wider shrink-0">
          <div className="font-semibold text-slate-700">
            {cabecalho.escola || 'ESCOLA MUNICIPAL'} • {cabecalho.turma || ''}
          </div>
          <div>PLANEJAMENTO SEMANAL — CONTINUAÇÃO</div>
        </div>
      )}

      {/* 2. DAY PLANNING TABLE (1 ROW FILLING THE SHEET HEIGHT) */}
      <div className="flex-1 flex flex-col border-2 border-slate-900 overflow-hidden bg-white">
        {/* Table Column Headers */}
        <div className="grid grid-cols-12 bg-slate-900 text-white font-bold text-[9pt] divide-x divide-slate-700 text-center tracking-tight shrink-0">
          <div className="col-span-2 py-2 px-1 flex items-center justify-center">
            DATA / DIA
          </div>
          <div className="col-span-3 py-2 px-1 flex items-center justify-center">
            OBJETOS DO CONHECIMENTO
          </div>
          <div className="col-span-2 py-2 px-1 flex items-center justify-center">
            HABILIDADES BNCC
          </div>
          <div className="col-span-3 py-2 px-1 flex items-center justify-center">
            DESENVOLVIMENTO / ATIVIDADES
          </div>
          <div className="col-span-2 py-2 px-1 flex items-center justify-center">
            RECURSOS
          </div>
        </div>

        {/* Table Content Row - Stretches vertically to fill the page */}
        <div className="grid grid-cols-12 divide-x-2 divide-slate-900 flex-1 text-slate-900">
          {/* Col 1: Data e Dia */}
          <div className="col-span-2 p-2 bg-slate-50/70 flex flex-col items-center justify-center text-center space-y-1">
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateDay(day.id, 'dia_semana', e.currentTarget.textContent || '')}
              className="font-extrabold uppercase text-[10.5pt] tracking-tight text-slate-950 outline-none px-1 rounded hover:bg-amber-100"
            >
              {day.dia_semana}
            </span>
            <div className="flex items-center gap-1 text-[9.5pt] text-slate-700 font-medium">
              <span>Data:</span>
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateDay(day.id, 'data', e.currentTarget.textContent || '')}
                className="font-semibold outline-none px-1 rounded hover:bg-amber-100"
              >
                {day.data || '___/___/______'}
              </span>
            </div>
          </div>

          {/* Col 2: Objetos do Conhecimento */}
          <div className="col-span-3 p-2.5 flex flex-col justify-start relative group">
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                onUpdateDay(day.id, 'objetos_conhecimento', e.currentTarget.innerText || '')
              }
              className="flex-1 whitespace-pre-wrap leading-relaxed outline-none overflow-y-auto"
            >
              {day.objetos_conhecimento}
            </div>
          </div>

          {/* Col 3: Habilidades BNCC */}
          <div className="col-span-2 p-2.5 flex flex-col justify-start relative group bg-indigo-50/20">
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                onUpdateDay(day.id, 'habilidades_bncc', e.currentTarget.innerText || '')
              }
              className="flex-1 whitespace-pre-wrap leading-relaxed outline-none overflow-y-auto font-medium"
            >
              {day.habilidades_bncc}
            </div>
            {/* Quick BNCC Insert Button (Screen Only) */}
            <button
              onClick={() => onOpenBnccHelper(day.id)}
              className="mt-2 text-[10px] text-indigo-700 bg-indigo-100/80 hover:bg-indigo-200 px-2 py-1 rounded-md no-print flex items-center gap-1 font-semibold self-start transition-colors"
              title="Pesquisar e Inserir Código BNCC"
            >
              <BookOpen className="w-3 h-3" />
              <span>+ BNCC</span>
            </button>
          </div>

          {/* Col 4: Desenvolvimento / Atividades */}
          <div className="col-span-3 p-2.5 flex flex-col justify-start relative group">
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                onUpdateDay(day.id, 'desenvolvimento', e.currentTarget.innerText || '')
              }
              className="flex-1 whitespace-pre-wrap leading-relaxed outline-none overflow-y-auto"
            >
              {day.desenvolvimento}
            </div>
          </div>

          {/* Col 5: Recursos */}
          <div className="col-span-2 p-2.5 flex flex-col justify-start relative group bg-slate-50/40">
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateDay(day.id, 'recursos', e.currentTarget.innerText || '')}
              className="flex-1 whitespace-pre-wrap leading-relaxed outline-none overflow-y-auto text-[9pt]"
            >
              {day.recursos}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="mt-2 pt-1 border-t border-slate-300 flex items-center justify-between text-[8pt] text-slate-600 shrink-0">
        <div>
          <span>Docente: </span>
          <span className="font-semibold">{cabecalho.docente || '_________________'}</span>
        </div>
        <div>
          <span>Visto Coordenação Pedagógica: _______________________</span>
        </div>
      </div>
    </div>
  );
};
