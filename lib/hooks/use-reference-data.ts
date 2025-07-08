import { useState, useEffect } from "react"
import { referenceApi, type DropdownOption } from "@/lib/api/reference"
import { devLog } from "@/lib/config"

// Global cache để share data giữa components
let globalCategoriesCache: DropdownOption[] = []
let globalCategoriesLoading = false
let globalCategoriesError: string | null = null
let globalCategoriesLoaded = false

// List các callbacks để notify khi data thay đổi
let globalCategoriesCallbacks: Set<() => void> = new Set()

// Hook để lấy book categories cho dropdown (KHÔNG cần token)
// autoLoad: true = load ngay khi mount (cho filters), false = lazy load (cho modals)
export const useBookCategories = (autoLoad: boolean = false) => {
  const [categories, setCategories] = useState<DropdownOption[]>(globalCategoriesCache)
  const [isLoading, setIsLoading] = useState(globalCategoriesLoading)
  const [error, setError] = useState<string | null>(globalCategoriesError)
  const [hasLoaded, setHasLoaded] = useState(globalCategoriesLoaded)

  // Callback để update local state khi global state thay đổi
  const updateFromGlobal = () => {
    setCategories(globalCategoriesCache)
    setIsLoading(globalCategoriesLoading)
    setError(globalCategoriesError)
    setHasLoaded(globalCategoriesLoaded)
  }

  // Register callback
  useEffect(() => {
    globalCategoriesCallbacks.add(updateFromGlobal)
    return () => {
      globalCategoriesCallbacks.delete(updateFromGlobal)
    }
  }, [])

  const loadCategories = async () => {
    if (globalCategoriesLoaded || globalCategoriesLoading) {
      devLog("useBookCategories - Already loaded or loading, skipping")
      return
    }
    
    globalCategoriesLoading = true
    globalCategoriesError = null
    
    // Notify all subscribers
    globalCategoriesCallbacks.forEach(callback => callback())
    
    try {
      const options = await referenceApi.getBookCategories()
      globalCategoriesCache = options
      globalCategoriesLoaded = true
      globalCategoriesLoading = false
      devLog("useBookCategories - Categories loaded:", { count: options.length, autoLoad, items: options })
    } catch (err: any) {
      const errorMessage = err.message || "Không thể tải danh sách danh mục"
      globalCategoriesError = errorMessage
      globalCategoriesLoading = false
      devLog("useBookCategories - Error:", errorMessage)
    }
    
    // Notify all subscribers
    globalCategoriesCallbacks.forEach(callback => callback())
  }

  // Auto load nếu autoLoad = true (cho filters)
  useEffect(() => {
    if (autoLoad && !globalCategoriesLoaded && !globalCategoriesLoading) {
      devLog("useBookCategories - Auto loading for filters")
      loadCategories()
    }
  }, [autoLoad])

  return {
    categories,
    isLoading,
    error,
    hasLoaded,
    loadCategories
  }
}

// Hook chung cho các reference data khác (KHÔNG cần token)
export const useReferenceData = () => {
  const getBookCategories = async (): Promise<DropdownOption[]> => {
    return await referenceApi.getBookCategories()
  }

  // Có thể thêm các reference data khác ở đây (KHÔNG cần token)
  // const getAuthors = async (): Promise<DropdownOption[]> => { ... }
  // const getPublishers = async (): Promise<DropdownOption[]> => { ... }

  return {
    getBookCategories,
    // getAuthors,
    // getPublishers,
  }
} 