// Cấu hình môi trường cho ứng dụng
export const config = {
  // API Base URLs
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7001/api/cms',
  referenceApiBaseUrl: process.env.NEXT_PUBLIC_REFERENCE_API_BASE_URL || 'http://localhost:7001/api/common/reference',
  
  // API Endpoints
  api: {
    auth: {
      login: '/auth/login',
    },
    staff: {
      list: '/staff/list',
      create: '/staff',
    },
    books: {
      list: '/books/list',
      create: '/books',
      update: (bookId: string) => `/books/${bookId}`,
      updateStatus: (bookId: string) => `/books/${bookId}/manage-status`,
      getDetail: (bookId: string) => `/books/${bookId}`,
      getChapters: (bookId: string) => `/books/${bookId}/chapters`,
      delete: (bookId: string) => `/books/${bookId}`,
    },
    categories: {
      list: '/book-categories/list',
      create: '/book-categories',
      getAll: '/book-categories',
    },
  },
  
  // Reference API Endpoints (for dropdowns)
  referenceApi: {
    bookCategories: '/book-categories',
  },
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

// Helper function để tạo full URL
export const getApiUrl = (endpoint: string): string => {
  return `${config.apiBaseUrl}${endpoint}`
}

// Helper function để tạo reference API URL
export const getReferenceApiUrl = (endpoint: string): string => {
  return `${config.referenceApiBaseUrl}${endpoint}`
}

// Helper function để log trong development
export const devLog = (message: string, data?: any) => {
  if (config.isDevelopment) {
    console.log(`[DEV] ${message}`, data || '')
  }
}

// Debug environment variables
if (config.isDevelopment) {
  console.log('[DEV] Environment Variables Check:')
  console.log('[DEV] NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
  console.log('[DEV] NEXT_PUBLIC_REFERENCE_API_BASE_URL:', process.env.NEXT_PUBLIC_REFERENCE_API_BASE_URL)
  console.log('[DEV] Config apiBaseUrl:', config.apiBaseUrl)
  console.log('[DEV] Config referenceApiBaseUrl:', config.referenceApiBaseUrl)
}
