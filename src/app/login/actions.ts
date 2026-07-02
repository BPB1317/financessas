"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";
import type { SessionRole } from "@/lib/types";

export type LoginState = { error: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Merci de renseigner votre email et votre mot de passe." };
  }

  const supabase = supabaseServer();
  const { data: member } = await supabase
    .from("members")
    .select("id, name, email, active")
    .ilike("email", email)
    .eq("active", true)
    .maybeSingle();

  if (!member) {
    return { error: "Email non reconnu. Contactez l'administrateur du fonds." };
  }

  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  const viewerHash = process.env.VIEWER_PASSWORD_HASH;

  let role: SessionRole | null = null;
  if (adminHash && (await bcrypt.compare(password, adminHash))) {
    role = "admin";
  } else if (viewerHash && (await bcrypt.compare(password, viewerHash))) {
    role = "viewer";
  }

  if (!role) {
    return { error: "Mot de passe incorrect." };
  }

  const token = await createSessionToken({
    memberId: member.id,
    email: member.email as string,
    name: member.name,
    role,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);

  redirect("/");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
