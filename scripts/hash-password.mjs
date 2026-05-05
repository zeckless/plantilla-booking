import bcrypt from "bcryptjs"

const password = process.argv[2]
if (!password) {
  console.error("Uso: node scripts/hash-password.mjs <nueva-contraseña>")
  process.exit(1)
}

const hash = await bcrypt.hash(password, 12)
console.log("\nCopia este valor en tu .env como ADMIN_PASSWORD_HASH:\n")
console.log(`ADMIN_PASSWORD_HASH=${hash}`)
console.log()
