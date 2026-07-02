import { getFundData, todayIso } from "@/lib/data";
import {
  createMonthlyResult,
  deleteMonthlyResult,
  updateMonthlyResult,
} from "@/lib/actions/monthly-results";
import { FormDialog } from "@/components/admin/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatEurPrecise, formatMonthYear } from "@/lib/format";

function firstOfMonth(date: string): string {
  return `${date.slice(0, 7)}-01`;
}

export default async function AdminBilansPage() {
  const { results } = await getFundData();
  const sorted = [...results].sort((a, b) => b.date.localeCompare(a.date));
  const defaultDate = firstOfMonth(todayIso());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Bilans mensuels</h2>
          <p className="text-sm text-muted-foreground">
            Un bilan par mois : bénéfice du fonds, résumé et PDF optionnel.
          </p>
        </div>
        <FormDialog
          trigger={<Button>Ajouter un bilan</Button>}
          title="Ajouter un bilan mensuel"
          action={createMonthlyResult}
          submitLabel="Ajouter"
        >
          <div className="space-y-2">
            <Label htmlFor="date">Mois</Label>
            <Input id="date" name="date" type="date" defaultValue={defaultDate} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total_benefice">Bénéfice total du fonds (€)</Label>
            <Input id="total_benefice" name="total_benefice" type="number" step="0.01" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Résumé (optionnel)</Label>
            <Textarea id="summary" name="summary" rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pdf">PDF du bilan (optionnel)</Label>
            <Input id="pdf" name="pdf" type="file" accept="application/pdf" />
          </div>
        </FormDialog>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun bilan enregistré pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {sorted.map((result) => (
            <Card key={result.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    {formatMonthYear(result.date)}
                    {result.pdf_path && <Badge variant="secondary">PDF joint</Badge>}
                  </CardTitle>
                  <CardDescription>
                    Bénéfice : {formatEurPrecise(result.total_benefice)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <FormDialog
                    trigger={
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    }
                    title={`Modifier le bilan de ${formatMonthYear(result.date)}`}
                    action={updateMonthlyResult}
                    submitLabel="Enregistrer"
                  >
                    <input type="hidden" name="id" value={result.id} />
                    <div className="space-y-2">
                      <Label htmlFor={`date-${result.id}`}>Mois</Label>
                      <Input
                        id={`date-${result.id}`}
                        name="date"
                        type="date"
                        defaultValue={result.date}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`total_benefice-${result.id}`}>
                        Bénéfice total du fonds (€)
                      </Label>
                      <Input
                        id={`total_benefice-${result.id}`}
                        name="total_benefice"
                        type="number"
                        step="0.01"
                        defaultValue={result.total_benefice}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`summary-${result.id}`}>Résumé (optionnel)</Label>
                      <Textarea
                        id={`summary-${result.id}`}
                        name="summary"
                        rows={4}
                        defaultValue={result.summary ?? ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`pdf-${result.id}`}>
                        {result.pdf_path ? "Remplacer le PDF" : "PDF du bilan (optionnel)"}
                      </Label>
                      <Input id={`pdf-${result.id}`} name="pdf" type="file" accept="application/pdf" />
                    </div>
                  </FormDialog>
                  <form action={deleteMonthlyResult}>
                    <input type="hidden" name="id" value={result.id} />
                    <Button type="submit" variant="outline" size="sm">
                      Supprimer
                    </Button>
                  </form>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
