import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export interface User {
  username: string
  email: string
  app_role: string[]
  is_active: boolean
}

export interface AuthState {
  user: User | null
  access_token: string | null
  token_expires_in: number | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  access_token: null,
  token_expires_in: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
}

type Credentials = { email: string; password: string }

async function loginRequest(body: Record<string, string>) {
  const res = await fetch(
    "https://booklify-api-fhhjg3asgwhxgfhd.southeastasia-01.azurewebsites.net/api/cms/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    },
  )

  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error("Invalid response format from server")
  }

  if (!res.ok || data.result !== "success") {
    const msg = data?.message || `HTTP Error: ${res.status}`
    throw new Error(msg)
  }

  return data.data
}

// thử lần lượt 3 biến thể payload
async function smartLogin({ email, password }: Credentials) {
  const variants: Record<string, string>[] = [
    // 1) chỉ username (thử đầu tiên vì server expect username)
    { username: email, password },
    // 2) chỉ email  
    { email, password },
    // 3) cả hai trường giống nhau
    { email, username: email, password },
  ]

  let lastError: Error | null = null
  for (const body of variants) {
    try {
      console.log("Trying login with:", Object.keys(body))
      return await loginRequest(body)
    } catch (err: any) {
      lastError = err
      console.warn("Login variant failed:", Object.keys(body), err.message)
      // Nếu lỗi là validation/thiếu trường ⇒ thử biến thể tiếp theo
      if (/validation|thiếu trường/i.test(err.message)) continue
      // Nếu lỗi khác (DB error/sai mật khẩu) ⇒ dừng hẳn
      break
    }
  }
  throw lastError ?? new Error("Đăng nhập thất bại")
}

export const loginUser = createAsyncThunk("auth/loginUser", async (credentials: Credentials, { rejectWithValue }) => {
  try {
    const data = await smartLogin(credentials)
    // lưu localStorage
    localStorage.setItem("access_token", data.access_token)
    localStorage.setItem("user", JSON.stringify(data))
    return data
  } catch (error: any) {
    console.error("Login error:", error)
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return rejectWithValue("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.")
    }
    // chuẩn hoá thông báo
    const friendly =
      error.message === "Database error occurred"
        ? "Thông tin đăng nhập không hợp lệ hoặc hệ thống đang gặp sự cố."
        : error.message
    return rejectWithValue(friendly)
  }
})

// Check if user is already logged in
export const checkAuthStatus = createAsyncThunk("auth/checkAuthStatus", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("access_token")
    const userStr = localStorage.getItem("user")

    if (token && userStr) {
      const user = JSON.parse(userStr)
      return { ...user, access_token: token }
    }

    throw new Error("No authentication found")
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.access_token = null
      state.token_expires_in = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem("access_token")
      localStorage.removeItem("user")
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("Login fulfilled, setting authentication state...")
        state.isLoading = false
        state.user = {
          username: action.payload.username,
          email: action.payload.email,
          app_role: action.payload.app_role,
          is_active: action.payload.is_active,
        }
        state.access_token = action.payload.access_token
        state.token_expires_in = action.payload.token_expires_in
        state.isAuthenticated = true
        console.log("Authentication state updated:", { isAuthenticated: state.isAuthenticated, user: state.user?.username })
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
      // Check status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = {
          username: action.payload.username,
          email: action.payload.email,
          app_role: action.payload.app_role,
          is_active: action.payload.is_active,
        }
        state.access_token = action.payload.access_token
        state.token_expires_in = action.payload.token_expires_in
        state.isAuthenticated = true
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
