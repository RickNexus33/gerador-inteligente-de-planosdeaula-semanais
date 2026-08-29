import React from 'react';
import {
  Upload,
  Printer,
  FileDown,
  Layout,
  Type,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  BookOpen,
  Check,
  ChevronDown,
  FileText,
  Trash2,
  FolderOpen,
  FilePlus2,
} from 'lucide-react';
import {
  DocumentSettings,
  DocumentOrientation,
  FontFamily,
  FontSize,
  MarginOption,
} from '../types';

interface ToolbarProps {
  settings: DocumentSettings;
  onUpdateSettings: (newSettings: Partial<DocumentSettings>) => void;
  onOpenUploadModal: () => void;
  onOpenBnccModal: () => void;
  onOpenHistoryModal: () => void;
  onPrintPdf: () => void;
  onExportWord: () => void;
  onClearAll: () => void;
  onNewWeek: () => void;
  onScrollToDay: (pageIndex: number) => void;
  isExportingWord?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  settings,
  onUpdateSettings,
  onOpenUploadModal,
  onOpenBnccModal,
  onOpenHistoryModal,
  onPrintPdf,
  onExportWord,
  onClearAll,
  onNewWeek,
  onScrollToDay,
  isExportingWord = false,
}) => {
  const days = [
    { label: 'Seg', full: 'Segunda-feira', page: 0 },
    { label: 'Ter', full: 'Terça-feira', page: 1 },
    { label: 'Qua', full: 'Quarta-feira', page: 2 },
    { label: 'Qui', full: 'Quinta-feira', page: 3 },
    { label: 'Sex', full: 'Sexta-feira', page: 4 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print select-none">
      {/* Top Brand & Actions Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              Gerador Inteligente de Planos de Aula
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Ensino Fundamental • 1 Folha A4 por Dia • Diagramação Oficial
            </p>
          </div>
        </div>

        {/* Day Quick Jump Navigation */}
        <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-[11px] text-slate-500 font-semibold px-2">Ir para:</span>
          {days.map((d) => (
            <button
              key={d.page}
              onClick={() => onScrollToDay(d.page)}
              className="px-2.5 py-1 rounded-md text-slate-700 hover:text-indigo-600 hover:bg-white transition-colors font-medium"
              title={d.full}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Limpar Tudo */}
          <button
            id="btn-limpar-tudo"
            type="button"
            onClick={onClearAll}
            className="px-3 py-2 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg shadow-xs flex items-center gap-1.5 transition-all hover:border-rose-300 active:scale-95 cursor-pointer"
            title="Limpar cabeçalho e todas as tabelas das 5 folhas"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>🧹 Limpar Tudo</span>
          </button>

          {/* 2. Nova Semana */}
          <button
            id="btn-nova-semana"
            type="button"
            onClick={onNewWeek}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Limpar apenas as tabelas da semana, mantendo os dados da professora e escola"
          >
            <FilePlus2 className="w-3.5 h-3.5 text-slate-700" />
            <span>📄 Nova Semana</span>
          </button>

          {/* 3. Importar Rascunho */}
          <button
            id="btn-importar-rascunho"
            type="button"
            onClick={onOpenUploadModal}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-all hover:shadow-indigo-200 active:scale-95 cursor-pointer"
            title="Importar rascunhos em foto, câmera ou PDF com IA"
          >
            <Upload className="w-4 h-4" />
            <span>Importar Rascunho</span>
          </button>

          {/* 4. Histórico */}
          <button
            id="btn-historico"
            type="button"
            onClick={onOpenHistoryModal}
            className="px-3 py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Ver histórico de planos salvos e restaurar versões anteriores"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>📂 Histórico</span>
          </button>

          {/* 5. BNCC */}
          <button
            id="btn-bncc-modal"
            type="button"
            onClick={onOpenBnccModal}
            className="px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Consultar Banco de Habilidades BNCC"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Banco BNCC</span>
          </button>

          {/* 6. Print / Save PDF Button */}
          <button
            id="btn-imprimir-pdf"
            type="button"
            onClick={onPrintPdf}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Imprimir ou Salvar em PDF com paginação de 1 folha por dia"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>

          {/* 7. Download Word (.docx) Button */}
          <button
            id="btn-exportar-word"
            type="button"
            onClick={onExportWord}
            disabled={isExportingWord}
            className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            title="Baixar documento formatado em Word (.docx)"
          >
            <FileDown className="w-4 h-4" />
            <span>{isExportingWord ? 'Gerando Word...' : 'Baixar Word (.docx)'}</span>
          </button>
        </div>
      </div>


      {/* Word-Style Secondary Tool Ribbon */}
      <div className="border-t border-slate-200 bg-slate-50/80 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Controls Group */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. Layout Orientation */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => onUpdateSettings({ orientation: 'portrait' })}
                className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                  settings.orientation === 'portrait'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Orientação Retrato (Vertical 210x297mm)"
              >
                <div className="w-2.5 h-3.5 border border-current rounded-xs" />
                <span>Retrato</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ orientation: 'landscape' })}
                className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                  settings.orientation === 'landscape'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Orientação Paisagem (Horizontal 297x210mm)"
              >
                <div className="w-3.5 h-2.5 border border-current rounded-xs" />
                <span>Paisagem</span>
              </button>
            </div>

            <div className="h-5 w-px bg-slate-300 hidden sm:block" />

            {/* 2. Typography: Font Family */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium hidden sm:inline">Fonte:</span>
              <select
                value={settings.fontFamily}
                onChange={(e) =>
                  onUpdateSettings({ fontFamily: e.target.value as FontFamily })
                }
                className="bg-white border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Arial">Arial (Padrão)</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Calibri">Calibri</option>
              </select>
            </div>

            {/* 3. Typography: Font Size */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium hidden sm:inline">Tamanho:</span>
              <select
                value={settings.fontSize}
                onChange={(e) =>
                  onUpdateSettings({ fontSize: e.target.value as FontSize })
                }
                className="bg-white border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="9pt">9pt</option>
                <option value="10pt">10pt (Padrão)</option>
                <option value="11pt">11pt</option>
                <option value="12pt">12pt</option>
              </select>
            </div>

            {/* 4. Margins */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium hidden sm:inline">Margens:</span>
              <select
                value={settings.margin}
                onChange={(e) =>
                  onUpdateSettings({ margin: e.target.value as MarginOption })
                }
                className="bg-white border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="minimal">Mínima (8mm)</option>
                <option value="narrow">Estreita (12.7mm - Padrão)</option>
                <option value="normal">Normal (25mm)</option>
              </select>
            </div>
          </div>

          {/* Zoom & Reset Controls */}
          <div className="flex items-center gap-2">
            {/* Zoom Slider / Controls */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-0.5 shadow-xs">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ zoom: Math.max(0.6, settings.zoom - 0.1) })
                }
                className="p-1 text-slate-600 hover:text-indigo-600"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-semibold text-slate-700 w-10 text-center">
                {Math.round(settings.zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ zoom: Math.min(1.4, settings.zoom + 0.1) })
                }
                className="p-1 text-slate-600 hover:text-indigo-600"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ zoom: 1.0 })}
                className="text-[10px] text-slate-500 hover:text-indigo-600 px-1 font-medium border-l border-slate-200 ml-1"
                title="Zoom 100%"
              >
                100%
              </button>
            </div>

            {/* Limpar tudo */}
            <button
              onClick={onClearAll}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Limpar tudo e reiniciar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
