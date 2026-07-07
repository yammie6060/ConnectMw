import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = "max-w-xl" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto bg-[#132333] border border-white/10`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-6 pb-0">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm mt-1.5 text-[#8ca5bc]">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5 flex-shrink-0"
          >
            <X size={18} className="text-[#8ca5bc]" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}