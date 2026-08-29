import React, { useState, useEffect } from 'react';
import {
  WeeklyPlanState,
  DocumentSettings,
  InstitutionalHeader,
  DayPlan,
  PlanHistoryItem,
} from './types';
import { initialWeeklyPlan, emptyWeeklyPlan, createEmptyDays, emptyHeader } from './data/defaultPlan';
import { Toolbar } from './components/Toolbar';
import { A4Page } from './components/A4Page';
import { UploadModal } from './components/UploadModal';
import { BnccHelperModal } from './components/BnccHelperModal';
import { HistoryModal } from './components/HistoryModal';
import { ConfirmModal } from './components/ConfirmModal';
import { exportToWord } from './utils/docxExport';
import { CheckCircle2, Sparkles, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanState>(() => {
    try {
      const saved = localStorage.getItem('gemini_weekly_lesson_plan');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return initialWeeklyPlan;
  });

  const [historyList, setHistoryList] = useState<PlanHistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem('gemini_weekly_plans_history');
      if (savedHistory) {
        return JSON.parse(savedHistory);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [settings, setSettings] = useState<DocumentSettings>({
    orientation: 'portrait',
    fontFamily: 'Arial',
    fontSize: '10pt',
    margin: 'narrow',
    zoom: 1.0,
  });

  const [planRevision, setPlanRevision] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBnccModalOpen, setIsBnccModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activeDayForBncc, setActiveDayForBncc] = useState<string>('segunda');
  const [isExportingWord, setIsExportingWord] = useState(false);

  // In-App Confirmation Modal State (replaces native window.confirm to bypass iframe restrictions)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    confirmVariant?: 'danger' | 'primary' | 'warning';
    iconType?: 'trash' | 'new_week' | 'alert';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    onConfirm: () => {},
  });

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  // Auto-save current active plan to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gemini_weekly_lesson_plan', JSON.stringify(weeklyPlan));
    } catch (e) {
      console.error('Falha ao salvar rascunho localmente:', e);
    }
  }, [weeklyPlan]);

  // Auto-save history list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gemini_weekly_plans_history', JSON.stringify(historyList));
    } catch (e) {
      console.error('Falha ao salvar histórico:', e);
    }
  }, [historyList]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  };

  const handleUpdateSettings = (newSettings: Partial<DocumentSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleUpdateHeader = (field: keyof InstitutionalHeader, value: string) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      cabecalho: {
        ...prev.cabecalho,
        [field]: value,
      },
    }));
  };

  const handleUpdateDay = (dayId: string, field: keyof DayPlan, value: string) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      dias: prev.dias.map((d) => (d.id === dayId ? { ...d, [field]: value } : d)),
    }));
  };

  // Helper to add a snapshot into history automatically or manually
  const saveSnapshotToHistory = (customTitle?: string) => {
    const hasContent =
      weeklyPlan.cabecalho.escola ||
      weeklyPlan.cabecalho.docente ||
      weeklyPlan.dias.some((d) => d.objetos_conhecimento || d.desenvolvimento);

    if (!hasContent) {
      showToast('O plano atual está vazio. Digite algo ou importe um rascunho antes de salvar.', 'info');
      return;
    }

    const title =
      customTitle ||
      `${weeklyPlan.cabecalho.turma || 'Plano Semanal'} - ${weeklyPlan.cabecalho.componente_curricular || weeklyPlan.cabecalho.docente || 'Semana ' + new Date().toLocaleDateString('pt-BR')}`;

    const newItem: PlanHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      savedAt: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      plan: JSON.parse(JSON.stringify(weeklyPlan)),
    };

    setHistoryList((prev) => [newItem, ...prev.slice(0, 29)]);
    showToast(`Versão "${title}" guardada no histórico!`, 'success');
  };

  const handlePlanExtracted = (newPlan: WeeklyPlanState) => {
    // If previous plan had content, auto-archive to history so teacher doesn't lose anything
    const hadContent =
      weeklyPlan.dias.some((d) => d.objetos_conhecimento || d.desenvolvimento) ||
      weeklyPlan.cabecalho.escola;

    if (hadContent) {
      const autoTitle = `Auto-Salvo: ${weeklyPlan.cabecalho.turma || 'Semana Anterior'} (${new Date().toLocaleDateString('pt-BR')})`;
      setHistoryList((prev) => [
        {
          id: Math.random().toString(36).substring(2, 9),
          title: autoTitle,
          savedAt: new Date().toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          plan: JSON.parse(JSON.stringify(weeklyPlan)),
        },
        ...prev.slice(0, 29),
      ]);
    }

    setWeeklyPlan(newPlan);
    setPlanRevision((r) => r + 1);
    showToast('Plano de aula semanal extraído e diagramado com sucesso!', 'success');
  };

  const handleOpenBnccForDay = (dayId: string) => {
    setActiveDayForBncc(dayId);
    setIsBnccModalOpen(true);
  };

  const handleInsertBnccSkill = (skillText: string) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      dias: prev.dias.map((d) => {
        if (d.id === activeDayForBncc) {
          const currentSkills = d.habilidades_bncc.trim();
          const updated = currentSkills ? `${currentSkills}\n${skillText}` : skillText;
          return { ...d, habilidades_bncc: updated };
        }
        return d;
      }),
    }));
    showToast('Habilidade BNCC inserida no dia selecionado!', 'success');
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleExportWord = async () => {
    setIsExportingWord(true);
    try {
      await exportToWord(weeklyPlan, settings);
      showToast('Documento Word (.docx) gerado e baixado com sucesso!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erro ao gerar arquivo Word.', 'error');
    } finally {
      setIsExportingWord(false);
    }
  };

  // 1. BOTÃO "LIMPAR TUDO": Limpa cabeçalho e todas as tabelas das 5 folhas
  const handleClearAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Limpar Todo o Plano de Aula?',
      message:
        'Todos os campos do cabeçalho (Escola, Professor, Turma, etc.) e todas as tabelas de Segunda a Sexta serão totalmente apagados, deixando todas as folhas em branco para um novo uso. Deseja continuar?',
      confirmLabel: 'Sim, Limpar Tudo',
      confirmVariant: 'danger',
      iconType: 'trash',
      onConfirm: () => {
        // Auto-save to history before clearing if it had content
        const hadContent =
          weeklyPlan.dias.some((d) => d.objetos_conhecimento || d.desenvolvimento) ||
          weeklyPlan.cabecalho.escola;
        if (hadContent) {
          setHistoryList((prev) => [
            {
              id: Math.random().toString(36).substring(2, 9),
              title: `Backup antes de Limpar (${new Date().toLocaleTimeString('pt-BR')})`,
              savedAt: new Date().toLocaleString('pt-BR'),
              plan: JSON.parse(JSON.stringify(weeklyPlan)),
            },
            ...prev.slice(0, 29),
          ]);
        }

        setWeeklyPlan({
          cabecalho: { ...emptyHeader },
          dias: createEmptyDays(),
        });
        setPlanRevision((r) => r + 1);
        showToast('Todas as páginas e o cabeçalho foram limpos com sucesso!', 'info');
      },
    });
  };

  // 2. BOTÃO "NOVA SEMANA": Limpa apenas as tabelas dos 5 dias, mantendo os dados da professora/escola
  const handleNewWeek = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Iniciar Nova Semana?',
      message:
        'As tabelas de planejamento dos 5 dias (Segunda a Sexta) serão limpas, mas os dados da sua escola, turma e professor no cabeçalho serão mantidos intactos. Deseja continuar?',
      confirmLabel: 'Sim, Nova Semana',
      confirmVariant: 'warning',
      iconType: 'new_week',
      onConfirm: () => {
        // Auto-save backup to history
        const hadContent = weeklyPlan.dias.some((d) => d.objetos_conhecimento || d.desenvolvimento);
        if (hadContent) {
          setHistoryList((prev) => [
            {
              id: Math.random().toString(36).substring(2, 9),
              title: `${weeklyPlan.cabecalho.turma || 'Semana'} - Concluída (${new Date().toLocaleDateString('pt-BR')})`,
              savedAt: new Date().toLocaleString('pt-BR'),
              plan: JSON.parse(JSON.stringify(weeklyPlan)),
            },
            ...prev.slice(0, 29),
          ]);
        }

        setWeeklyPlan((prev) => ({
          cabecalho: { ...prev.cabecalho },
          dias: createEmptyDays(),
        }));
        setPlanRevision((r) => r + 1);
        showToast('Nova semana iniciada! Tabelas limpas com cabeçalho preservado.', 'success');
      },
    });
  };

  // 3. RESTAURAR DO HISTÓRICO
  const handleRestorePlanFromHistory = (item: PlanHistoryItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Restaurar Plano do Histórico?',
      message: `Deseja restaurar o plano "${item.title}" salvo em ${item.savedAt}? O plano atual na tela será substituído.`,
      confirmLabel: 'Restaurar Plano',
      confirmVariant: 'primary',
      iconType: 'alert',
      onConfirm: () => {
        setWeeklyPlan(JSON.parse(JSON.stringify(item.plan)));
        setPlanRevision((r) => r + 1);
        setIsHistoryModalOpen(false);
        showToast(`Plano "${item.title}" restaurado com sucesso!`, 'success');
      },
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistoryList((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removido do histórico.', 'info');
  };

  const handleClearHistory = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Limpar Todo o Histórico?',
      message: 'Tem certeza que deseja apagar todos os planos salvos no histórico? Esta ação não pode ser desfeita.',
      confirmLabel: 'Sim, Limpar Histórico',
      confirmVariant: 'danger',
      iconType: 'trash',
      onConfirm: () => {
        setHistoryList([]);
        showToast('Histórico limpo com sucesso.', 'info');
      },
    });
  };

  const handleScrollToDay = (pageIndex: number) => {
    const el = document.getElementById(`a4-page-${pageIndex + 1}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-200/70 text-slate-900 flex flex-col antialiased">
      {/* Top Word-Style Ribbon Toolbar */}
      <Toolbar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenBnccModal={() => setIsBnccModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onPrintPdf={handlePrintPdf}
        onExportWord={handleExportWord}
        onClearAll={handleClearAll}
        onNewWeek={handleNewWeek}
        onScrollToDay={handleScrollToDay}
        isExportingWord={isExportingWord}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs animate-in slide-in-from-bottom-5 duration-200 no-print">
          {toastMessage.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          {toastMessage.type === 'error' && (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          {toastMessage.type === 'info' && (
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          )}
          <span className="font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Main Workspace (A4 Document Canvas) */}
      <main className="flex-1 py-8 px-4 flex justify-center items-start overflow-x-auto">
        <div
          className="a4-container transition-transform duration-150 origin-top"
          style={{
            transform: settings.zoom !== 1.0 ? `scale(${settings.zoom})` : undefined,
          }}
        >
          {weeklyPlan.dias.map((day, index) => (
            <A4Page
              key={`${day.id}-${planRevision}`}
              pageIndex={index}
              day={day}
              cabecalho={weeklyPlan.cabecalho}
              settings={settings}
              onUpdateHeader={handleUpdateHeader}
              onUpdateDay={handleUpdateDay}
              onOpenBnccHelper={handleOpenBnccForDay}
            />
          ))}
        </div>
      </main>

      {/* Quick Helper Floating Action for uploading on mobile/desktop */}
      <div className="fixed bottom-6 left-6 z-30 no-print flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold hover:shadow-indigo-300 transition-all hover:scale-105 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-indigo-200" />
          <span>Escanear Rascunho com IA</span>
        </button>
      </div>

      {/* Multimodal Upload & Gemini Extraction Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onPlanExtracted={handlePlanExtracted}
      />

      {/* BNCC Skills Database Modal */}
      <BnccHelperModal
        isOpen={isBnccModalOpen}
        onClose={() => setIsBnccModalOpen(false)}
        onSelectSkill={handleInsertBnccSkill}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        historyList={historyList}
        currentPlan={weeklyPlan}
        onRestorePlan={handleRestorePlanFromHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onSaveCurrentToHistory={saveSnapshotToHistory}
        onClearHistory={handleClearHistory}
      />

      {/* In-App Confirmation Modal (Bypasses iframe blocks) */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        confirmVariant={confirmModal.confirmVariant}
        iconType={confirmModal.iconType}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
