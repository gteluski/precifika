"use client"

import { Bell, CheckCheck, AlertCircle, CreditCard, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Alert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col">
      <div className="p-6 border-b flex justify-between items-center">
        <div className="flex items-center">
          <Bell className="w-5 h-5 text-secondary mr-2" />
          <h3 className="font-bold text-secondary">Alertas e Notificações</h3>
        </div>
        {alerts.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs h-8 text-zinc-500 hover:text-primary">
            <CheckCheck className="w-3.5 h-3.5 mr-1" />
            Marcar lido
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <CheckCheck className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm">Nenhum alerta no momento ✓</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={cn(
                  "p-3 rounded-lg border-l-4 flex gap-3",
                  alert.type === 'danger' ? "bg-red-50 border-red-500" : 
                  alert.type === 'warning' ? "bg-amber-50 border-amber-500" : 
                  "bg-blue-50 border-blue-500"
                )}
              >
                {alert.type === 'danger' ? <AlertCircle className="w-5 h-5 text-red-500 shrink-0" /> : 
                 alert.type === 'warning' ? <CreditCard className="w-5 h-5 text-amber-500 shrink-0" /> : 
                 <Info className="w-5 h-5 text-blue-500 shrink-0" />}
                
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-secondary truncate">{alert.title}</h4>
                  <p className="text-xs text-zinc-600 leading-tight mt-1">{alert.description}</p>
                  <span className="text-[10px] text-zinc-400 mt-2 block">{alert.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
