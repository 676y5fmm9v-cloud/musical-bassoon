"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="w-full space-y-4">
      {state?.error && (
        <div className="rounded-lg border border-kalan-red/30 bg-kalan-red-light px-4 py-3 text-sm text-kalan-red">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="identifiant" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Identifiant KALAN
        </label>
        <input
          id="identifiant"
          name="identifiant"
          placeholder="Ex : KLNE2026-0001"
          autoCapitalize="characters"
          required
          className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base font-semibold tracking-wide uppercase text-slate-900 outline-none focus:border-kalan-green"
        />
      </div>

      <div>
        <label htmlFor="mot_de_passe" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Mot de passe
        </label>
        <input
          id="mot_de_passe"
          name="mot_de_passe"
          type="password"
          placeholder="Votre mot de passe"
          required
          className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base text-slate-900 outline-none focus:border-kalan-green"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-kalan-green px-4 py-3.5 text-base font-semibold text-white transition-colors hover:bg-kalan-green-dark disabled:opacity-70"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
