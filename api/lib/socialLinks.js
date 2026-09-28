const ALLOWED_HOSTS = {
  linkedinUrl: ['linkedin.com'],
  githubUrl: ['github.com'],
}

export function normalizeSocialUrl(field, value) {
  const trimmed = value?.trim()
  if (!trimmed) return { value: null }

  let parsed
  try {
    parsed = new URL(trimmed)
  } catch {
    return { error: true }
  }

  if (parsed.protocol !== 'https:') {
    return { error: true }
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
  if (!ALLOWED_HOSTS[field].includes(host)) {
    return { error: true }
  }

  return { value: parsed.toString() }
}
