import { getFundData, todayIso } from "@/lib/data";
import { createMember, toggleMemberActive, updateMember } from "@/lib/actions/members";
import { FormDialog } from "@/components/admin/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

export default async function AdminMembresPage() {
  const { members } = await getFundData();
  const today = todayIso();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Membres</h2>
          <p className="text-sm text-muted-foreground">
            L&apos;email d&apos;un membre actif lui donne accès au dashboard.
          </p>
        </div>
        <FormDialog
          trigger={<Button>Ajouter un membre</Button>}
          title="Ajouter un membre"
          description="Son email devient utilisable pour se connecter avec le mot de passe commun."
          action={createMember}
          submitLabel="Ajouter"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="joined_date">Date d&apos;entrée</Label>
            <Input id="joined_date" name="joined_date" type="date" defaultValue={today} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="initial_investment">Investissement initial (€, optionnel)</Label>
            <Input id="initial_investment" name="initial_investment" type="number" step="0.01" />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="is_manager" name="is_manager" />
            <Label htmlFor="is_manager">Gérant (part fixe de dividende)</Label>
          </div>
        </FormDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des membres</CardTitle>
          <CardDescription>{members.length} membre(s) au total.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Entrée</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {member.name}
                      {member.is_manager && <Badge variant="secondary">Gérant</Badge>}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>{member.joined_date}</TableCell>
                  <TableCell>
                    <Badge variant={member.active ? "default" : "outline"}>
                      {member.active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <FormDialog
                        trigger={
                          <Button variant="outline" size="sm">
                            Modifier
                          </Button>
                        }
                        title={`Modifier ${member.name}`}
                        action={updateMember}
                        submitLabel="Enregistrer"
                      >
                        <input type="hidden" name="id" value={member.id} />
                        <div className="space-y-2">
                          <Label htmlFor={`name-${member.id}`}>Nom</Label>
                          <Input
                            id={`name-${member.id}`}
                            name="name"
                            defaultValue={member.name}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`email-${member.id}`}>Email</Label>
                          <Input
                            id={`email-${member.id}`}
                            name="email"
                            type="email"
                            defaultValue={member.email ?? ""}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`joined_date-${member.id}`}>Date d&apos;entrée</Label>
                          <Input
                            id={`joined_date-${member.id}`}
                            name="joined_date"
                            type="date"
                            defaultValue={member.joined_date}
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`is_manager-${member.id}`}
                            name="is_manager"
                            defaultChecked={member.is_manager}
                          />
                          <Label htmlFor={`is_manager-${member.id}`}>
                            Gérant (part fixe de dividende)
                          </Label>
                        </div>
                      </FormDialog>
                      <form action={toggleMemberActive}>
                        <input type="hidden" name="id" value={member.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={(!member.active).toString()}
                        />
                        <Button type="submit" variant="outline" size="sm">
                          {member.active ? "Désactiver" : "Réactiver"}
                        </Button>
                      </form>
                    </div>
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
