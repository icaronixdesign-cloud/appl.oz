"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  variant?: "side" | "center";
  children: ReactNode;
};

export function Drawer({ open, onClose, title, variant = "side", children }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={"drawer drawer--" + variant}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="drawer-inner">
        <div className="drawer-heading">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar painel" autoFocus>
            <X aria-hidden="true" size={21} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
