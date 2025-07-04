const API_BASE = "https://booklify-api-fhhjg3asgwhxgfhd.southeastasia-01.azurewebsites.net/api/cms"

export interface BookCategory {
  id: string
  name: string
  description: string
  status: string
  books_count: number
  created_at: string
}

export interface CreateCategoryRequest {
  name: string
  description: string
}

export interface CategoryListParams {
  name?: string
  description?: string
  status?: number
  sortBy?: "name" | "description" | "status" | "createdat" | "bookscount"
  isAscending?: boolean
  pageNumber?: number
  pageSize?: number
}

export interface CategoryListResponse {
  data: BookCategory[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export const categoriesApi = {
  // Tạo danh mục sách mới
  create: async (data: CreateCategoryRequest, token: string): Promise<BookCategory> => {
    const response = await fetch(`${API_BASE}/book-categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    if (!response.ok || result.result !== "success") {
      throw new Error(result.message || "Tạo danh mục thất bại")
    }

    return result.data
  },

  // Lấy danh sách danh mục với lọc, sắp xếp và phân trang
  getList: async (params: CategoryListParams, token: string): Promise<CategoryListResponse> => {
    const searchParams = new URLSearchParams()
    
    if (params.name) searchParams.append("name", params.name)
    if (params.description) searchParams.append("description", params.description)
    if (params.status !== undefined) searchParams.append("status", params.status.toString())
    if (params.sortBy) searchParams.append("sortBy", params.sortBy)
    if (params.isAscending !== undefined) searchParams.append("isAscending", params.isAscending.toString())
    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())

    const url = `${API_BASE}/book-categories/list${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const result = await response.json()
    if (!response.ok || result.result !== "success") {
      throw new Error(result.message || "Lấy danh sách danh mục thất bại")
    }

    return {
      data: result.data,
      pageNumber: result.pageNumber,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      totalCount: result.totalCount,
      hasPreviousPage: result.hasPreviousPage,
      hasNextPage: result.hasNextPage,
    }
  },

  // Lấy danh sách danh mục (phương thức cũ - giữ để tương thích)
  getAll: async (token: string): Promise<BookCategory[]> => {
    const response = await fetch(`${API_BASE}/book-categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const result = await response.json()
    if (!response.ok || result.result !== "success") {
      throw new Error(result.message || "Lấy danh sách danh mục thất bại")
    }

    return result.data
  },
}
