import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // ─── ROLES ─────────────────────────────────────────────────────────────────

  const rolAdmin = await prisma.role.upsert({
    where:  { nombre: 'ADMIN' },
    update: {},
    create: { nombre: 'ADMIN' },
  })

  const rolCliente = await prisma.role.upsert({
    where:  { nombre: 'CLIENTE' },
    update: {},
    create: { nombre: 'CLIENTE' },
  })

  console.log(`✅ Roles creados: ADMIN (id:${rolAdmin.id}), CLIENTE (id:${rolCliente.id})`)

  // ─── ADMIN POR DEFECTO ─────────────────────────────────────────────────────

  const adminEmail    = process.env.ADMIN_EMAIL    ?? 'admin@ncstore.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!'

  const hash = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.usuario.upsert({
    where:  { email: adminEmail },
    update: {},
    create: {
      email:         adminEmail,
      password:      hash,
      nombre:        'Admin',
      apellido:      'NC Store',
      nombreVisible: 'Administrador',
      roleId:        rolAdmin.id,
    },
  })

  console.log(`✅ Admin creado: ${admin.email}`)
  console.log(`   Password:    ${adminPassword}`)
  console.log(`   ⚠️  Cambia la contraseña del admin en producción`)

  // ─── CLIENTE DE PRUEBA ─────────────────────────────────────────────────────

  const clienteEmail    = process.env.CLIENTE_EMAIL    ?? 'cliente@ncstore.com'
  const clientePassword = process.env.CLIENTE_PASSWORD ?? 'Cliente123!'

  const hashCliente = await bcrypt.hash(clientePassword, 12)

  const clienteUser = await prisma.usuario.upsert({
    where:  { email: clienteEmail },
    update: {},
    create: {
      email:         clienteEmail,
      password:      hashCliente,
      nombre:        'Cliente',
      apellido:      'Prueba',
      nombreVisible: 'Cliente Prueba',
      roleId:        rolCliente.id,
    },
  })

  const clienteExistente = await prisma.cliente.findUnique({
    where: { usuarioId: clienteUser.id },
  })

  if (!clienteExistente) {
    await prisma.cliente.create({
      data: {
        usuarioId:    clienteUser.id,
        ciudad:       'Medellín',
        region:       'Antioquia',
        codigoPostal: '050001',
      },
    })
  }

  console.log(`✅ Cliente de prueba creado: ${clienteUser.email}`)
  console.log(`   Password: ${clientePassword}`)

  console.log('\n🎉 Seed completado exitosamente')
}

main()
  .catch((e) => {
    console.error(' Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })