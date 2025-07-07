"use client"

import BookFormModal from "./book-form-modal"
import { BookDetailResponse } from "@/lib/api/books"

interface UpdateBookModalProps {
  bookData: BookDetailResponse
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export default function UpdateBookModal({ bookData, trigger, open, onOpenChange, onSuccess }: UpdateBookModalProps) {
  return (
    <BookFormModal
      mode="update"
      bookData={bookData}
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    />
  )
}
