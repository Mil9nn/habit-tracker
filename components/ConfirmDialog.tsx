"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, ChefHat } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  type?: "delete" | "template"
  itemName?: string
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  type = "delete",
  itemName = ""
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const getIcon = () => {
    switch (type) {
      case "template":
        return <ChefHat className="h-6 w-6 text-amber-500" />
      default:
        return <Trash2 className="h-6 w-6 text-red-500" />
    }
  }

  const getGradient = () => {
    switch (type) {
      case "template":
        return "from-amber-500/20 to-orange-500/20 border-amber-500/30"
      default:
        return "from-red-500/20 to-rose-500/20 border-red-500/30"
    }
  }

  const getConfirmButtonVariant = () => {
    switch (type) {
      case "template":
        return "destructive" as const
      default:
        return "destructive" as const
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-xl font-semibold text-zinc-900 pt-4">
            {title}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 leading-relaxed">
            {description}
            {itemName && (
              <span className="block mt-2 font-medium text-zinc-700 bg-zinc-200 px-3 py-2 rounded-lg text-sm">
                "{itemName}"
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6 py-4 h-12 border-zinc-300 text-zinc-700 hover:bg-zinc-50"
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            onClick={handleConfirm}
            className="px-6 py-4 h-12 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
