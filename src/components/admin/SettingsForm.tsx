"use client";

import { useActionState } from "react";
import { updateSettings } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SettingsForm({
  fundName,
  managerSharePct,
}: {
  fundName: string;
  managerSharePct: number;
}) {
  const [state, action, pending] = useActionState(updateSettings, undefined);

  return (
    <form action={action} className="max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fund_name">Nom du fonds</Label>
        <Input id="fund_name" name="fund_name" defaultValue={fundName} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="manager_share_pct">Part fixe du gérant (%)</Label>
        <Input
          id="manager_share_pct"
          name="manager_share_pct"
          type="number"
          step="0.01"
          min={0}
          max={100}
          defaultValue={managerSharePct}
          required
        />
        <p className="text-xs text-muted-foreground">
          Le solde est réparti entre les autres membres au prorata de leur investissement.
        </p>
      </div>
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state?.success && (
        <Alert>
          <AlertDescription>Paramètres enregistrés.</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
