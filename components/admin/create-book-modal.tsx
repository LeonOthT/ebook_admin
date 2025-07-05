"use client"

import BookFormModal from "./book-form-modal"

interface CreateBookModalProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export default function CreateBookModal({ trigger, onSuccess }: CreateBookModalProps) {
  return (
    <BookFormModal
      mode="create"
      trigger={trigger}
      onSuccess={onSuccess}
    />
  )
}
