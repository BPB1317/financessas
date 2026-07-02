import { getFundData, todayIso } from "@/lib/data";
import {
  createInvestmentEvent,
  deleteInvestmentEvent,
  toggleInvestmentEventHidden,
  updateInvestmentEvent,
} from "@/lib/actions/investments";
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
import { formatDateShort, formatEurPrecise } from "@/lib/format";

const SELECT_CLASS =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export default async function AdminInvestissementsPage() {
  const { members, events } = await getFundData();
  const memberById = new Map(members.map((m) => [m.id, m]));
  const rows = [...events].sort((a, b) => b.date.localeCompare(a.date));
  const today = todayIso();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Investissements</h2>
          <p className="text-sm text-muted-foreground">
            Un montant positif = apport, un montant négatif = retrait. Les mouvements
            de type &quot;dividende réinvesti&quot; sont générés automatiquement.
          </p>
        </div>
        <FormDialog
          trigger={<Button>Ajouter un mouvement</Button>}
          title="Ajouter un mouvement"
          action={createInvestmentEvent}
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
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" defaultValue={today} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (€)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note (optionnel)</Label>
            <Input id="note" name="note" />
          </div>
        </FormDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
          <CardDescription>{rows.length} mouvement(s) enregistré(s).</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Membre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Visibilité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{formatDateShort(event.date)}</TableCell>
                  <TableCell className="font-medium">
                    {memberById.get(event.member_id)?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    {event.source === "reinvestment" ? (
                      <Badge variant="secondary">Réinvestissement</Badge>
                    ) : event.amount >= 0 ? (
                      <Badge variant="outline">Apport</Badge>
                    ) : (
                      <Badge variant="outline">Retrait</Badge>
                    )}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${event.amount < 0 ? "text-destructive" : ""}`}
                  >
                    {formatEurPrecise(event.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{event.note ?? ""}</TableCell>
                  <TableCell>
                    <form action={toggleInvestmentEventHidden} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={event.id} />
                      <input type="hidden" name="hidden" value={(!event.hidden).toString()} />
                      {event.hidden && <Badge variant="secondary">Masqué</Badge>}
                      <Button type="submit" variant="outline" size="sm">
                        {event.hidden ? "Afficher" : "Masquer"}
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell>
                    {event.source === "manual" && (
                      <div className="flex justify-end gap-2">
                        <FormDialog
                          trigger={
                            <Button variant="outline" size="sm">
                              Modifier
                            </Button>
                          }
                          title="Modifier le mouvement"
                          action={updateInvestmentEvent}
                          submitLabel="Enregistrer"
                        >
                          <input type="hidden" name="id" value={event.id} />
                          <div className="space-y-2">
                            <Label htmlFor={`date-${event.id}`}>Date</Label>
                            <Input
                              id={`date-${event.id}`}
                              name="date"
                              type="date"
                              defaultValue={event.date}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`amount-${event.id}`}>Montant (€)</Label>
                            <Input
                              id={`amount-${event.id}`}
                              name="amount"
                              type="number"
                              step="0.01"
                              defaultValue={event.amount}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`note-${event.id}`}>Note (optionnel)</Label>
                            <Input id={`note-${event.id}`} name="note" defaultValue={event.note ?? ""} />
                          </div>
                        </FormDialog>
                        <form action={deleteInvestmentEvent}>
                          <input type="hidden" name="id" value={event.id} />
                          <Button type="submit" variant="outline" size="sm">
                            Supprimer
                          </Button>
                        </form>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
