'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface TemplateExistsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateName: string
}

export function TemplateExistsDialog({ 
  open, 
  onOpenChange, 
  templateName 
}: TemplateExistsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Template Already Exists
          </DialogTitle>
          <DialogDescription>
            A template named <span className="font-semibold">"{templateName}"</span> already exists in your library.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full h-12"
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
