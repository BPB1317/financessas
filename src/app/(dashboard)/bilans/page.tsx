import Link from "next/link";
import { FileDown } from "lucide-react";
import { getFundData } from "@/lib/data";
import { formatEurPrecise, formatMonthYear } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function BilansPage() {
  const { results } = await getFundData();
  const sorted = [...results].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bilans mensuels</h1>
        <p className="text-sm text-muted-foreground">
          Résumé et document de chaque bilan, du plus récent au plus ancien.
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun bilan enregistré pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {sorted.map((result) => (
            <Card key={result.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="capitalize">{formatMonthYear(result.date)}</CardTitle>
                  <CardDescription>
                    Bénéfice du fonds : {formatEurPrecise(result.total_benefice)}
                  </CardDescription>
                </div>
                {result.pdf_path && (
                  <Button
                    render={<Link href={`/api/bilans/${result.id}/pdf`} target="_blank" />}
                    variant="outline"
                    size="sm"
                  >
                    <FileDown className="size-4" />
                    PDF
                  </Button>
                )}
              </CardHeader>
              {result.summary && (
                <CardContent>
                  <Separator className="mb-4" />
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {result.summary}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
