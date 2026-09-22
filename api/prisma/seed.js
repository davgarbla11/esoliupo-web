import 'dotenv/config'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import { ROLES } from '../lib/rbac.js'

const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@esoliupo.org'
const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345'
const name = 'Administrador ESOLIUPO'

const passwordHash = await bcrypt.hash(password, 10)

const admin = await prisma.user.upsert({
  where: { email },
  update: { role: ROLES.ADMINISTRADOR },
  create: { email, passwordHash, name, role: ROLES.ADMINISTRADOR },
})

console.log(`Administrador listo: ${admin.email} (${admin.role})`)

await prisma.$disconnect()
