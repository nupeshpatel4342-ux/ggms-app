const STORAGE_PREFIX = 'ggms_' 

function storageKey(name) {
  return `${STORAGE_PREFIX}${String(name).trim()}`
}

function loadRepository(name, fallback = []) {
  try {
    const raw = localStorage.getItem(storageKey(name))
    if (!raw) return Array.isArray(fallback) ? fallback : [fallback]
    const parsed = JSON.parse(raw)
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback
    return parsed ?? fallback
  } catch {
    return Array.isArray(fallback) ? fallback : [fallback]
  }
}

function saveRepository(name, items) {
  try {
    localStorage.setItem(storageKey(name), JSON.stringify(items ?? []))
  } catch {
    // ignore storage errors
  }
}

function createRepositoryEntry(name, entry) {
  const existing = loadRepository(name, [])
  const item = { ...entry, id: String(entry?.id ?? Date.now()) }
  const next = [...existing, item]
  saveRepository(name, next)
  return item
}

function updateRepositoryEntry(name, id, updates) {
  const existing = loadRepository(name, [])
  const next = existing.map(item => item?.id === String(id) ? { ...item, ...updates, id: String(id) } : item)
  saveRepository(name, next)
  return next.find(item => item?.id === String(id)) ?? null
}

function deleteRepositoryEntry(name, id) {
  const existing = loadRepository(name, [])
  const next = existing.filter(item => item?.id !== String(id))
  saveRepository(name, next)
  return next
}

export {
  loadRepository,
  saveRepository,
  createRepositoryEntry,
  updateRepositoryEntry,
  deleteRepositoryEntry,
}
