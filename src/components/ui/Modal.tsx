"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl border border-stone bg-cream p-6 shadow-xl",
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          {title ? <h2 className="text-xl font-semibold font-[family-name:var(--font-playfair)]">{title}</h2> : <div />}
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-stone transition-colors"
          >
            <X className="h-5 w-5 text-charcoal/70" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
