"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AuthPanel } from "@/components/auth-panel"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  redirectTo?: string
  title?: string
  description?: string
}

export function AuthModal({
  open,
  onOpenChange,
  redirectTo,
  title,
  description,
}: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">MarketplaceBeta account access</DialogTitle>
        </DialogHeader>
        <AuthPanel
          redirectTo={redirectTo}
          title={title}
          description={description}
          onSent={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
