import React, { useState } from 'react';
import {
  BookOpen,
  Share2,
  RefreshCw,
  Sparkles,
  MessageCircle,
  X,
  Search,
  Check,
} from 'lucide-react';
import {
  BiblicalVerse,
  BIBLICAL_FINANCIAL_VERSES,
  getVerseOfTheDay,
} from '../data/biblicalVerses';
import { shareViaWhatsApp, formatVerseWhatsApp } from '../utils/whatsapp';

interface BiblicalStewardshipBannerProps {
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const BiblicalStewardshipBanner: React.FC<BiblicalStewardshipBannerProps> = ({
  isOpenModal,
  onCloseModal,
}) => {
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(() => {
    const today = getVerseOfTheDay();
    const idx = BIBLICAL_FINANCIAL_VERSES.findIndex((v) => v.id === today.id);
    return idx >= 0 ? idx : 0;
  });

  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const isModalOpen = isOpenModal !== undefined ? isOpenModal : internalModalOpen;

  const handleCloseModal = () => {
    setInternalModalOpen(false);
    if (onCloseModal) onCloseModal();
  };

  const handleOpenModal = () => {
    setInternalModalOpen(true);
  };
  const [copied, setCopied] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const currentVerse = BIBLICAL_FINANCIAL_VERSES[currentVerseIndex];

  const handleNextVerse = () => {
    setCurrentVerseIndex((prev) => (prev + 1) % BIBLICAL_FINANCIAL_VERSES.length);
  };

  const handleShareWhatsApp = (verseToShare = currentVerse) => {
    const text = formatVerseWhatsApp(verseToShare);
    shareViaWhatsApp(text);
  };

  const handleCopy = (verseToCopy = currentVerse) => {
    const text = `"${verseToCopy.text}" — ${verseToCopy.reference} (${verseToCopy.theme})\nPrincípio: ${verseToCopy.financialPrinciple}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themes = [
    'todos',
    'Planejamento',
    'Generosidade',
    'Mordomia',
    'Contentamento',
    'Diligência e Trabalho',
    'Integridade e Dívidas',
    'Provisão Divina',
  ];

  const filteredVerses = BIBLICAL_FINANCIAL_VERSES.filter((v) => {
    const matchesTheme = selectedTheme === 'todos' || v.theme === selectedTheme;
    const matchesSearch =
      v.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.financialPrinciple.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTheme && matchesSearch;
  });

  return (
    <>
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-indigo-800/40 relative overflow-hidden">
        {/* Subtle decorative background watermark */}
        <div className="absolute right-0 top-0 bottom-0 opacity-5 pointer-events-none flex items-center pr-6">
          <BookOpen className="w-48 h-48" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Mordomia & Sabedoria Financeira SMVM
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentVerse.theme}
              </span>
            </div>

            <blockquote className="text-sm sm:text-base font-serif italic text-slate-100 leading-relaxed pt-1">
              "{currentVerse.text}"
            </blockquote>

            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <span className="font-bold text-xs sm:text-sm text-amber-400 tracking-wide font-sans">
                {currentVerse.reference}
              </span>
              <span className="text-slate-500 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-slate-300 italic hidden sm:inline">
                Princípio: {currentVerse.financialPrinciple}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
            <button
              id="btn-verse-whatsapp"
              onClick={() => handleShareWhatsApp(currentVerse)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              title="Compartilhar versículo no WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              id="btn-verse-next"
              onClick={handleNextVerse}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium rounded-lg border border-white/10 transition-colors"
              title="Ver outro princípio bíblico"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Outro Versículo</span>
            </button>

            <button
              id="btn-verse-view-all"
              onClick={handleOpenModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium rounded-lg border border-white/10 transition-colors"
              title="Abrir coletânea de versículos sobre finanças"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Todos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: All Biblical Verses */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Versículos Bíblicos sobre Finanças & Mordomia
                  </h3>
                  <p className="text-xs text-slate-500">
                    Instruções das Sagradas Escrituras para a gestão de recursos da SMVM
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Theme Filter Toolbar */}
            <div className="p-4 border-b border-slate-200 bg-white space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar versículo, livro bíblico ou princípio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {themes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTheme(t)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize transition-colors ${
                      selectedTheme === t
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Verses List */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5 divide-y divide-slate-100">
              {filteredVerses.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhum versículo encontrado para os filtros selecionados.
                </div>
              ) : (
                filteredVerses.map((v) => (
                  <div key={v.id} className="pt-3.5 first:pt-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider mb-1">
                          {v.theme}
                        </span>
                        <blockquote className="text-sm font-serif italic text-slate-800 leading-relaxed">
                          "{v.text}"
                        </blockquote>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-bold text-indigo-900 font-sans">
                            {v.reference}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          💡 <span className="font-medium text-slate-700">Aplicação:</span>{' '}
                          {v.financialPrinciple}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopy(v)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Copiar versículo"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(v)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Compartilhar no WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>{filteredVerses.length} versículos cadastrados</span>
              <button
                onClick={handleCloseModal}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
