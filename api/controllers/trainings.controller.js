import prisma from '../lib/prisma.js'

function toPublicTraining(training) {
  return {
    id: training.id,
    title: training.title,
    description: training.description,
    place: training.place,
    date: training.date,
    published: training.published,
    instructor: {
      id: training.instructor.id,
      name: training.instructor.name,
      role: training.instructor.role,
    },
    enrolledCount: training._count?.enrollments ?? training.enrollments?.length ?? 0,
    createdAt: training.createdAt,
    updatedAt: training.updatedAt,
  }
}

function validateTrainingFields(body) {
  const { title, description, place, date, instructorId } = body

  if (!title?.trim() || !description?.trim() || !place?.trim()) {
    return 'Nombre, descripción y lugar son obligatorios.'
  }
  if (!date || Number.isNaN(new Date(date).getTime())) {
    return 'La fecha no es válida.'
  }
  if (!instructorId?.trim()) {
    return 'Selecciona quién imparte la formación.'
  }
  return null
}

async function withEnrolledFlag(trainings, userId) {
  const enrollments = await prisma.trainingEnrollment.findMany({
    where: { userId, trainingId: { in: trainings.map((t) => t.id) } },
    select: { trainingId: true },
  })
  const enrolledIds = new Set(enrollments.map((e) => e.trainingId))

  return trainings.map((training) => ({
    ...toPublicTraining(training),
    enrolled: enrolledIds.has(training.id),
  }))
}

export async function listPublicTrainings(req, res) {
  const trainings = await prisma.training.findMany({
    where: { published: true },
    include: { instructor: true, _count: { select: { enrollments: true } } },
    orderBy: { date: 'asc' },
  })

  res.json({ trainings: await withEnrolledFlag(trainings, req.user.sub) })
}

export async function listTrainings(req, res) {
  const trainings = await prisma.training.findMany({
    include: { instructor: true, _count: { select: { enrollments: true } } },
    orderBy: { date: 'desc' },
  })

  res.json({ trainings: await withEnrolledFlag(trainings, req.user.sub) })
}

export async function getTraining(req, res) {
  const { id } = req.params

  const training = await prisma.training.findUnique({
    where: { id },
    include: {
      instructor: true,
      _count: { select: { enrollments: true } },
      enrollments: { include: { user: true }, orderBy: { createdAt: 'asc' } },
    },
  })
  if (!training) {
    return res.status(404).json({ error: 'Formación no encontrada.' })
  }

  res.json({
    training: toPublicTraining(training),
    enrollees: training.enrollments.map((enrollment) => ({
      id: enrollment.user.id,
      name: enrollment.user.name,
      email: enrollment.user.email,
      studies: enrollment.user.studies,
      enrolledAt: enrollment.createdAt,
    })),
  })
}

export async function createTraining(req, res) {
  const error = validateTrainingFields(req.body)
  if (error) {
    return res.status(400).json({ error })
  }

  const { title, description, place, date, instructorId } = req.body

  const instructor = await prisma.user.findUnique({ where: { id: instructorId } })
  if (!instructor || !instructor.active) {
    return res.status(400).json({ error: 'La persona seleccionada no es válida.' })
  }

  const training = await prisma.training.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      place: place.trim(),
      date: new Date(date),
      instructorId,
    },
    include: { instructor: true, _count: { select: { enrollments: true } } },
  })

  res.status(201).json({ training: toPublicTraining(training) })
}

export async function updateTraining(req, res) {
  const { id } = req.params
  const { title, description, place, date, instructorId, published } = req.body

  const existing = await prisma.training.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Formación no encontrada.' })
  }

  const data = {}
  if (title !== undefined) data.title = title.trim()
  if (description !== undefined) data.description = description.trim()
  if (place !== undefined) data.place = place.trim()
  if (date !== undefined) {
    if (Number.isNaN(new Date(date).getTime())) {
      return res.status(400).json({ error: 'La fecha no es válida.' })
    }
    data.date = new Date(date)
  }
  if (instructorId !== undefined) {
    const instructor = await prisma.user.findUnique({ where: { id: instructorId } })
    if (!instructor || !instructor.active) {
      return res.status(400).json({ error: 'La persona seleccionada no es válida.' })
    }
    data.instructorId = instructorId
  }
  if (published !== undefined) {
    if (typeof published !== 'boolean') {
      return res.status(400).json({ error: 'Estado de publicación inválido.' })
    }
    data.published = published
  }

  const training = await prisma.training.update({
    where: { id },
    data,
    include: { instructor: true, _count: { select: { enrollments: true } } },
  })
  res.json({ training: toPublicTraining(training) })
}

export async function deleteTraining(req, res) {
  const { id } = req.params

  const existing = await prisma.training.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Formación no encontrada.' })
  }

  await prisma.training.delete({ where: { id } })
  res.status(204).end()
}

export async function enrollInTraining(req, res) {
  const { id } = req.params
  const userId = req.user.sub

  const training = await prisma.training.findUnique({ where: { id } })
  if (!training || !training.published) {
    return res.status(404).json({ error: 'Formación no encontrada.' })
  }

  const existing = await prisma.trainingEnrollment.findUnique({
    where: { trainingId_userId: { trainingId: id, userId } },
  })
  if (existing) {
    return res.status(409).json({ error: 'Ya estás inscrito en esta formación.' })
  }

  await prisma.trainingEnrollment.create({ data: { trainingId: id, userId } })
  res.status(201).json({})
}

export async function unenrollFromTraining(req, res) {
  const { id } = req.params
  const userId = req.user.sub

  const existing = await prisma.trainingEnrollment.findUnique({
    where: { trainingId_userId: { trainingId: id, userId } },
  })
  if (!existing) {
    return res.status(404).json({ error: 'No estás inscrito en esta formación.' })
  }

  await prisma.trainingEnrollment.delete({ where: { id: existing.id } })
  res.status(204).end()
}
