"use client";

import type { ReactNode } from "react";
import { IconTrash } from "@/components/icons";

export function DeleteButton({
  action,
  confirmMessage,
  label = "Supprimer",
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  label?: string;
  children?: ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        <IconTrash className="h-4 w-4" />
        {label}
      </button>
    </form>
  );
}
