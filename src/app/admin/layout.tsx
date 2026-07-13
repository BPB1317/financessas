import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { NavLinks } from "@/components/dashboard/NavLinks";

const NAV_LINKS = [
  { href: "/admin", label: "Aperçu" },
  { href: "/admin/membres", label: "Membres" },
  { href: "/admin/investissements", label: "Investissements" },
  { href: "/admin/dca", label: "DCA" },
  { href: "/admin/bilans", label: "Bilans mensuels" },
  { href: "/admin/parametres", label: "Paramètres" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Administration
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Gestion du fonds</h1>
        </div>
        <Link href="/" className="text-sm text-primary hover:text-primary/80">
          ← Retour au dashboard
        </Link>
      </div>
      <div className="border-b border-border pb-4">
        <NavLinks links={NAV_LINKS} />
      </div>
      {children}
    </div>
  );
}
