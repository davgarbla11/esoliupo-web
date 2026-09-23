import prisma from '../lib/prisma.js'

async function getSettingsRow() {
  return prisma.appSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  })
}

export async function getSettings(req, res) {
  const settings = await getSettingsRow()
  res.json({ maintenanceMode: settings.maintenanceMode })
}

export async function updateSettings(req, res) {
  const { maintenanceMode } = req.body

  if (typeof maintenanceMode !== 'boolean') {
    return res.status(400).json({ error: 'Estado de mantenimiento inválido.' })
  }

  await getSettingsRow()
  const settings = await prisma.appSettings.update({
    where: { id: 'singleton' },
    data: { maintenanceMode },
  })

  res.json({ maintenanceMode: settings.maintenanceMode })
}
