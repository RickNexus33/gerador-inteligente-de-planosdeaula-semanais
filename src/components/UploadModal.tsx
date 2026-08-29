import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Camera,
} from 'lucide-react';
import { UploadedFileItem, WeeklyPlanState } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanExtracted: (plan: WeeklyPlanState) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onPlanExtracted,
}) => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = (incomingFiles: FileList | File[]) => {
    setErrorMessage(null);

    Array.from(incomingFiles).forEach((file) => {
      // Accept JPG, PNG, WEBP, and PDF
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf') && !file.type.startsWith('image/')) {
        setErrorMessage('Formato não suportado. Por favor envie fotos (JPG, PNG, WEBP) ou PDFs.');
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        setErrorMessage(`O arquivo ${file.name} excede o limite máximo de 20MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = (e.target?.result as string) || '';
        setFiles((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name || `Foto_${new Date().toLocaleTimeString('pt-BR').replace(/:/g, '-')}.jpg`,
            size: file.size,
            type: file.type || 'image/jpeg',
            dataUrl: base64Data,
            base64: base64Data,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleProcessWithGemini = async () => {
    if (files.length === 0) {
      setErrorMessage('Adicione ao menos uma foto ou PDF do seu rascunho de plano de aula.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payloadFiles = files.map((f) => ({
        name: f.name,
        mimeType: f.type,
        data: f.base64,
      }));

      const res = await fetch('/api/extract-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: payloadFiles,
          customInstructions,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Falha ao processar o rascunho com a IA Gemini.');
      }

      const extractedData = json.data;

      // Ensure full 5-day week structure with IDs
      const daysOfWeek = [
        'Segunda-feira',
        'Terça-feira',
        'Quarta-feira',
        'Quinta-feira',
        'Sexta-feira',
      ];
      const dayIds = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];

      const sanitizedDays = daysOfWeek.map((dayName, idx) => {
        const found = extractedData.dias?.find(
          (d: any) =>
            d.dia_semana?.toLowerCase().includes(dayName.toLowerCase().split('-')[0]) ||
            d.dia_semana?.toLowerCase() === dayName.toLowerCase()
        ) || extractedData.dias?.[idx] || {};

        return {
          id: dayIds[idx],
          data: found.data || '',
          dia_semana: dayName,
          objetos_conhecimento: found.objetos_conhecimento || '',
          habilidades_bncc: found.habilidades_bncc || '',
          desenvolvimento: found.desenvolvimento || '',
          recursos: found.recursos || '',
        };
      });

      const fullPlan: WeeklyPlanState = {
        cabecalho: {
          escola: extractedData.cabecalho?.escola || '',
          municipio: extractedData.cabecalho?.municipio || '',
          dre: extractedData.cabecalho?.dre || '',
          docente: extractedData.cabecalho?.docente || '',
          bimestre: extractedData.cabecalho?.bimestre || '',
          turma: extractedData.cabecalho?.turma || '',
          turno: extractedData.cabecalho?.turno || '',
          componente_curricular: extractedData.cabecalho?.componente_curricular || '',
        },
        dias: sanitizedDays,
      };

      onPlanExtracted(fullPlan);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Ocorreu um erro ao conectar com a IA Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 no-print overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-400/30">
              <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-semibold">
                Importar Rascunhos Manuscritos com IA
              </h2>
              <p className="text-xs text-slate-300">
                Tire foto do seu caderno ou envie imagens e PDFs para preenchimento automático
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons: Camera vs File Browse */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Direct Camera Button */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/80 hover:border-indigo-400 transition-all text-left flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                  <span>📸 Tirar Foto com a Câmera</span>
                </div>
                <p className="text-[11px] text-indigo-700 leading-tight mt-0.5">
                  Fotografe as páginas do seu caderno ou fichas de aula agora
                </p>
              </div>
            </button>

            {/* Browse Files Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300 transition-all text-left flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  📁 Selecionar Imagens ou PDF
                </div>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Envie fotos da galeria ou documentos digitalizados
                </p>
              </div>
            </button>
          </div>

          {/* Hidden inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-150 ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01]'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-slate-800">
                Arraste fotos ou PDFs aqui para anexar
              </div>
              <p className="text-[11px] text-slate-400">
                Suporta múltiplas fotos (JPG, PNG, WEBP) e arquivos PDF
              </p>
            </div>
          </div>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Arquivos Anexados ({files.length})</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium text-[11px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar mais
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-44 overflow-y-auto p-1">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg group hover:border-slate-300"
                  >
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center text-slate-500">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={file.dataUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 block">
              Orientações Específicas / Observações (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Foco no 3º ano, enfatizar leitura e cálculo mental..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleProcessWithGemini}
            disabled={isLoading || files.length === 0}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analisando Rascunho com Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Transcrever e Diagramar ({files.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
