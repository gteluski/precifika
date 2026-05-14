"use client"

import { HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface InfoTooltipProps {
  content: React.ReactNode;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="w-4 h-4 text-zinc-400 hover:text-zinc-600 cursor-help transition-colors inline ml-1 align-text-bottom" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px] bg-secondary text-white border-none p-3 shadow-lg">
          <p className="text-sm font-normal leading-snug">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
