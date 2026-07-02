// Génère le hash bcrypt d'un mot de passe, à coller dans VIEWER_PASSWORD_HASH
// ou ADMIN_PASSWORD_HASH (.env.local / variables d'environnement Vercel).
// Usage: node scripts/hash-password.mjs "mon-mot-de-passe"
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "mon-mot-de-passe"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log(hash);
