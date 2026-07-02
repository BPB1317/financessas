import { getFundData, todayIso } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase/server";
import {
  applyDcaRulesNow,
  createDcaRule,
  deleteDcaRule,
  toggleDcaRuleActive,
} from "@/lib/actions/dca";
import { FormDialog } from "@/components/admin/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatEurPrecise } from "@/lib/format";

const SELECT_CLASS =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export default async function AdminDcaPage() {
  const { members } = await getFundData();
  const memberById = new Map(members.map((m) => [m.id, m]));
  const today = todayIso();

  const supabase = supabaseServer();
  const { data: rules } = await supabase
    .from("dca_rules")
    .select("id, member_id, amount, day_of_month, start_date, active, note")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Investissement programmé (DCA)</h2>
          <p className="text-sm text-muted-foreground">
            Ajoute automatiquement un montant fixe pour un membre chaque mois, au jour
            choisi. Vérifié chaque jour ; vous pouvez aussi forcer une vérification
            immédiate.
          </p>
        </div>
        <div className="flex gap-2">
          <form action={applyDcaRulesNow}>
            <Button type="submit" variant="outline">
              Appliquer maintenant
            </Button>
          </form>
          <FormDialog
            trigger={<Button>Ajouter une règle</Button>}
            title="Ajouter une règle DCA"
            description="Le premier mouvement est généré immédiatement si la date est déjà passée ce mois-ci."
            action={createDcaRule}
            submitLabel="Ajouter"
          >
            <div className="space-y-2">
              <Label htmlFor="member_id">Membre</Label>
              <select id="member_id" name="member_id" required defaultValue="" className={SELECT_CLASS}>
                <option value="" disabled>
                  Choisir un membre
                </option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (€) par mois</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day_of_month">Jour du mois (1 à 28)</Label>
              <Input id="day_of_month" name="day_of_month" type="number" min={1} max={28} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">À partir du</Label>
              <Input id="start_date" name="start_date" type="date" defaultValue={today} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (optionnel)</Label>
              <Input id="note" name="note" />
            </div>
          </FormDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Règles</CardTitle>
          <CardDescription>{(rules ?? []).length} règle(s) enregistrée(s).</CardDescription>
        </CardHeader>
        <CardContent>
          {(rules ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune règle DCA pour le moment.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membre</TableHead>
                  <TableHead className="text-right">Montant / mois</TableHead>
                  <TableHead>Jour</TableHead>
                  <TableHead>Depuis</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(rules ?? []).map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">
                      {memberById.get(rule.member_id)?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatEurPrecise(rule.amount)}
                    </TableCell>
                    <TableCell>{rule.day_of_month}</TableCell>
                    <TableCell>{rule.start_date}</TableCell>
                    <TableCell>
                      <Badge variant={rule.active ? "default" : "outline"}>
                        {rule.active ? "Active" : "En pause"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <form action={toggleDcaRuleActive}>
                          <input type="hidden" name="id" value={rule.id} />
                          <input type="hidden" name="active" value={(!rule.active).toString()} />
                          <Button type="submit" variant="outline" size="sm">
                            {rule.active ? "Mettre en pause" : "Réactiver"}
                          </Button>
                        </form>
                        <form action={deleteDcaRule}>
                          <input type="hidden" name="id" value={rule.id} />
                          <Button type="submit" variant="outline" size="sm">
                            Supprimer
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
