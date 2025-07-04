import { getApiUrl, config, devLog } from "@/lib/config"

export interface CreateBookRequest {
  file: File
  title: string
  description?: string
  author: string
  isbn?: string
  publisher?: string
  category_id: string
  is_premium?: boolean
  tags?: string
  published_date?: string
}

export interface BookStatusRequest {
  approval_status?: 0 | 1 | 2 // 0: Pending, 1: Approved, 2: Rejected
  approval_note?: string
  is_premium?: boolean
}

export interface Book {
  id: string
  title: string
  author: string
  description: string
  isbn?: string
  publisher?: string
  category_name: string
  cover_image_url: string
  approval_status: 0 | 1 | 2 // 0: Pending, 1: Approved, 2: Rejected
  status: 0 | 1 // 0: Active, 1: Inactive
  is_premium: boolean
  has_chapters: boolean
  average_rating: number
  total_ratings: number
  total_views: number
  published_date: string
  created_at: string
  tags?: string
}

export interface BookListParams {
  // Tìm kiếm kết hợp tất cả trường text (title, author, isbn, publisher, tags)
  search?: string
  // Lọc theo danh mục
  categoryId?: string
  // Lọc theo trạng thái phê duyệt (0: Pending, 1: Approved, 2: Rejected)
  approvalStatus?: 0 | 1 | 2
  // Lọc theo trạng thái sách (0: Active, 1: Inactive)
  status?: 0 | 1
  // Lọc theo loại sách có phí
  isPremium?: boolean
  // Lọc theo sách có chapters
  hasChapters?: boolean
  // Lọc theo khoảng ngày xuất bản
  publishedDateFrom?: string
  publishedDateTo?: string
  // Lọc theo rating
  minRating?: number
  maxRating?: number
  minTotalRatings?: number
  minTotalViews?: number
  maxTotalViews?: number
  // Sắp xếp
  sortBy?: "title" | "author" | "isbn" | "publisher" | "approvalstatus" | "status" | "ispremium" | "pagecount" | "publisheddate" | "createdat" | "rating" | "totalratings" | "totalviews"
  isAscending?: boolean
  // Phân trang
  pageNumber?: number
  pageSize?: number
}

export interface BookListResponse {
  data: Book[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export const booksApi = {
  // Tạo sách mới
  create: async (data: CreateBookRequest, token: string) => {
    const formData = new FormData()

    formData.append("file", data.file)
    formData.append("title", data.title)
    formData.append("author", data.author)
    formData.append("category_id", data.category_id)

    if (data.description) formData.append("description", data.description)
    if (data.isbn) formData.append("isbn", data.isbn)
    if (data.publisher) formData.append("publisher", data.publisher)
    if (data.is_premium !== undefined) formData.append("is_premium", data.is_premium.toString())
    if (data.tags) formData.append("tags", data.tags)
    if (data.published_date) formData.append("published_date", data.published_date)

    const response = await fetch(getApiUrl(config.api.books.create), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const result = await response.json()
    if (!response.ok || result.result !== "success") {
      throw new Error(result.message || "Tạo sách thất bại")
    }

    return result.data
  },

  // Cập nhật trạng thái sách (chỉ Admin)
  updateStatus: async (bookId: string, data: BookStatusRequest, token: string) => {
    const response = await fetch(getApiUrl(config.api.books.updateStatus(bookId)), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    if (!response.ok || result.result !== "success") {
      throw new Error(result.message || "Cập nhật trạng thái sách thất bại")
    }

    return result.data
  },

  // Lấy danh sách sách với lọc, sắp xếp và phân trang
  getList: async (params: BookListParams, token: string): Promise<BookListResponse> => {
    const searchParams = new URLSearchParams()
    
    if (params.search) searchParams.append("search", params.search)
    if (params.categoryId) searchParams.append("categoryId", params.categoryId)
    if (params.approvalStatus !== undefined) searchParams.append("approvalStatus", params.approvalStatus.toString())
    if (params.status !== undefined) searchParams.append("status", params.status.toString())
    if (params.isPremium !== undefined) searchParams.append("isPremium", params.isPremium.toString())
    if (params.hasChapters !== undefined) searchParams.append("hasChapters", params.hasChapters.toString())
    if (params.publishedDateFrom) searchParams.append("publishedDateFrom", params.publishedDateFrom)
    if (params.publishedDateTo) searchParams.append("publishedDateTo", params.publishedDateTo)
    if (params.minRating !== undefined) searchParams.append("minRating", params.minRating.toString())
    if (params.maxRating !== undefined) searchParams.append("maxRating", params.maxRating.toString())
    if (params.minTotalRatings !== undefined) searchParams.append("minTotalRatings", params.minTotalRatings.toString())
    if (params.minTotalViews !== undefined) searchParams.append("minTotalViews", params.minTotalViews.toString())
    if (params.maxTotalViews !== undefined) searchParams.append("maxTotalViews", params.maxTotalViews.toString())
    if (params.sortBy) searchParams.append("sortBy", params.sortBy)
    if (params.isAscending !== undefined) searchParams.append("isAscending", params.isAscending.toString())
    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())

    const url = getApiUrl(`${config.api.books.list}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`)
    devLog("Books API request URL:", url)
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const result = await response.json()
    if (!response.ok || result.result !== "success") {
      throw new Error(result.message || "Lấy danh sách sách thất bại")
    }

    return {
      data: result.data.data,
      pageNumber: result.data.pageNumber,
      pageSize: result.data.pageSize,
      totalPages: result.data.totalPages,
      totalCount: result.data.totalCount,
      hasPreviousPage: result.data.hasPreviousPage,
      hasNextPage: result.data.hasNextPage,
    }
  },
}
