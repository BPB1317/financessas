import { getFundData } from "@/lib/data";
import { SettingsForm } from "@/components/admin/SettingsForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminParametresPage() {
  const { settings } = await getFundData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Paramètres</h2>
        <p className="text-sm text-muted-foreground">
          Ces réglages s&apos;appliquent immédiatement à tous les calculs.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Fonds</CardTitle>
          <CardDescription>Nom affiché et règle de répartition des dividendes.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm fundName={settings.fund_name} managerSharePct={settings.manager_share_pct} />
        </CardContent>
      </Card>
    </div>
  );
}
