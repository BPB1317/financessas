import Link from "next/link";
import { getFundData } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SECTIONS = [
  {
    href: "/admin/membres",
    title: "Membres",
    description: "Ajouter un membre, modifier ses informations, gérer son accès.",
  },
  {
    href: "/admin/investissements",
    title: "Investissements",
    description: "Enregistrer un apport ou un retrait pour un membre.",
  },
  {
    href: "/admin/bilans",
    title: "Bilans mensuels",
    description: "Ajouter le bénéfice du mois, un résumé et le PDF du bilan.",
  },
  {
    href: "/admin/parametres",
    title: "Paramètres",
    description: "Nom du fonds et part fixe du gérant.",
  },
];

export default async function AdminHomePage() {
  const { members, results } = await getFundData();

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {members.filter((m) => m.active).length} membre(s) actif(s) · {results.length} bilan(s)
        mensuel(s) enregistré(s).
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
