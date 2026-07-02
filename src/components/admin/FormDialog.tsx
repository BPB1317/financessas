"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export type ActionState = { error?: string; success?: boolean } | undefined;

type FormDialogProps = {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel?: string;
  children: React.ReactNode;
};

// Dialog générique pour les formulaires de création/édition de l'admin : le
// parent ne fournit que les champs (children) et l'action serveur, le dialog
// gère l'ouverture/fermeture, les erreurs et l'état "en cours" de manière
// identique partout.
export function FormDialog({
  trigger,
  title,
  description,
  action,
  submitLabel = "Enregistrer",
  children,
}: FormDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    undefined
  );

  // Ferme le dialog dès qu'une soumission réussit, sans passer par un effect
  // (voir https://react.dev/reference/react/useState#storing-information-from-previous-renders).
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.success && open) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {children}
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Enregistrement..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
