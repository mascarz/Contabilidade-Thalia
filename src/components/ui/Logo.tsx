import React from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className, iconOnly = false }: { className?: string, iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
        <Sparkles size={24} />
      </div>
      {!iconOnly && (
        <div className="flex flex-col">
          <span className="text-lg font-black leading-none tracking-tight text-foreground">
            Studio <span className="text-primary">Thalia</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Abdo
          </span>
        </div>
      )}
    </div>
  )
}
