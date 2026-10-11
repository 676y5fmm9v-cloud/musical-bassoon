import { KalanMark, KalanWordmark } from "@/components/KalanLogo";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Connexion · Kalan",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-kalan-green-dark via-kalan-green to-kalan-green-dark px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <KalanMark className="h-16 w-16" />
          <KalanWordmark className="mt-3 text-3xl" />
          <p className="mt-1 text-[11px] font-bold tracking-[2px] text-kalan-green">
            APPRENDRE. PROGRESSER. RÉUSSIR.
          </p>
          <p className="mt-5 text-sm text-slate-600">
            Toute l&apos;école dans une seule application.
          </p>
        </div>

        <div className="mt-6">
          <LoginForm />
        </div>

        <div className="mt-6 rounded-xl border-l-4 border-kalan-yellow bg-kalan-yellow-light px-4 py-3 text-xs leading-relaxed text-amber-900">
          💡 <b>Démo</b> — identifiants : <b>KLNE2026-0001</b> (élève),{" "}
          <b>KLNP2026-0001</b> (professeur), <b>KLNPA2026-0001</b> (parent),{" "}
          <b>KLND2026-0001</b> (direction). Mot de passe : <b>kalan2026</b>.
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          🛡 <b className="text-kalan-green">Sécurisé.</b> Conçu pour l&apos;éducation.
        </p>
      </div>
    </div>
  );
}
