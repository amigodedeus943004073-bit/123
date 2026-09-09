import React from 'react';
import { AlertTriangle, Trash2, X, Check } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  confirmIcon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  confirmIcon,
  onConfirm,
  onCancel,
  children,
}) => {
  if (!isOpen) return null;

  const getButtonStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-xs';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-xs';
      case 'primary':
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-xs';
    }
  };

  const getIcon = () => {
    if (confirmIcon) return confirmIcon;
    switch (variant) {
      case 'danger':
        return <Trash2 className="w-5 h-5 text-rose-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <Check className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div
      id="modal-confirm-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        id="modal-confirm-card"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl shrink-0 ${
                variant === 'danger'
                  ? 'bg-rose-50 border border-rose-100'
                  : variant === 'warning'
                  ? 'bg-amber-50 border border-amber-100'
                  : 'bg-blue-50 border border-blue-100'
              }`}
            >
              {getIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onCancel}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mt-1">
                {message}
              </p>

              {children && <div className="mt-4">{children}</div>}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            id="btn-confirm-cancel"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-xs"
          >
            {cancelText}
          </button>
          <button
            type="button"
            id="btn-confirm-action"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${getButtonStyles()}`}
          >
            {confirmIcon || <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
