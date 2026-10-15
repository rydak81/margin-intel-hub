"use client"

// Shared catalog state: the user's imported catalog from localStorage when one
// exists, otherwise the anonymized sample catalog. Dashboard, history, and
// deep-dive pages all read through this hook so an import applies everywhere.

import { useCallback, useEffect, useState } from "react"
import type { CatalogItem } from "@/lib/repricer/types"
import { CATALOG_STORAGE_KEY, SEED_CATALOG, loadStoredCatalog } from "@/lib/repricer/catalog"

export function useCatalog() {
  const [stored, setStored] = useState<CatalogItem[] | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setStored(loadStoredCatalog())
    setHydrated(true)
  }, [])

  const importCatalog = useCallback((items: CatalogItem[]) => {
    try {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Private browsing or blocked storage: the import still applies this session.
    }
    setStored(items)
  }, [])

  const resetToSample = useCallback(() => {
    try {
      localStorage.removeItem(CATALOG_STORAGE_KEY)
    } catch {
      // ignore storage failures
    }
    setStored(null)
  }, [])

  return {
    items: stored ?? SEED_CATALOG,
    isSample: stored === null,
    hydrated,
    importCatalog,
    resetToSample,
  }
}
