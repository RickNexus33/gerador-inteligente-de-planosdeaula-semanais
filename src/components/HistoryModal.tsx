import React, { useState } from 'react';
import { X, History, Trash2, RotateCcw, Calendar, School, Clock, BookmarkPlus } from 'lucide-react';
import { PlanHistoryItem, WeeklyPlanState } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyList: PlanHistoryItem[];
  currentPlan: WeeklyPlanState;
  onRestorePlan: (item: PlanHistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onSaveCurrentToHistory: (customTitle?: string) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  historyList,
  currentPlan,
  onRestorePlan,
  onDeleteHistoryItem,
  onSaveCurrentToHistory,
  onClearHistory,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCurrentToHistory(newTitle.trim() || undefined);
    setNewTitle('');
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Histórico de Planos Salvos</h2>
              <p className="text-xs text-slate-400">
                Acesse, restaure ou guarde versões dos seus planejamentos semanais
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: Save Current Snapshot */}
        <div className="p-4 bg-indigo-50/70 border-b border-indigo-100 flex flex-col gap-2">
          {!isSaving ? (
            <div className="flex items-center justify-between">
              <div className="text-xs text-indigo-950 font-medium flex items-center gap-1.5">
                <BookmarkPlus className="w-4 h-4 text-indigo-600" />
                <span>Deseja guardar uma cópia do plano atual no histórico?</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSaving(true)}
                className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Salvar Versão Atual</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="flex items-center gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Título do plano (ex: 4º Ano - Semana de Fábulas)..."
                autoFocus
                className="flex-1 text-xs px-3 py-2 bg-white border border-indigo-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
              <button
                type="submit"
                className="px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shrink-0"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setIsSaving(false)}
                className="px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>

        {/* Content: History List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {historyList.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Nenhum plano no histórico ainda</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Quando você importar rascunhos com IA ou clicar em "Salvar Versão Atual", seus planos ficarão guardados aqui para você restaurar quando quiser.
              </p>
            </div>
          ) : (
            historyList.map((item) => {
              const teacher = item.plan.cabecalho.docente || 'Docente não informado';
              const school = item.plan.cabecalho.escola || 'Escola não informada';
              const grade = item.plan.cabecalho.turma;
              const subject = item.plan.cabecalho.componente_curricular;

              return (
                <div
                  key={item.id}
                  className="border border-slate-200 hover:border-indigo-300 rounded-xl p-4 bg-white hover:bg-indigo-50/20 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                        {item.title}
                      </h4>
                      {grade && (
                        <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                          {grade}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 truncate">
                        <School className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{school}</span>
                      </span>
                      {subject && (
                        <span className="truncate text-slate-600 font-medium">
                          • {subject}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{item.savedAt}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onRestorePlan(item)}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors flex items-center gap-1"
                      title="Substituir plano atual pelo selecionado"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar</span>
                    </button>
                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir do histórico"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {historyList.length > 0 && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Total: <strong>{historyList.length}</strong> plano(s) salvo(s)
            </span>
            <button
              onClick={onClearHistory}
              className="text-rose-600 hover:text-rose-700 hover:underline font-medium text-xs flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Todo o Histórico</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
