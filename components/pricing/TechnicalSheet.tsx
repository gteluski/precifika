"use client"

import { Trash2, Plus, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils/formatters"
import { TechnicalSheetItem } from "@/types"

interface TechnicalSheetProps {
  items: TechnicalSheetItem[];
  onChange: (items: TechnicalSheetItem[]) => void;
}

const UNITS = [
  { value: 'un', label: 'un' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'l' },
  { value: 'ml', label: 'ml' },
  { value: 'm', label: 'm' },
  { value: 'cm', label: 'cm' },
  { value: 'h', label: 'h' },
  { value: 'min', label: 'min' },
];

export function TechnicalSheet({ items, onChange }: TechnicalSheetProps) {
  const addItem = () => {
    const newItem: TechnicalSheetItem = {
      id: crypto.randomUUID(),
      name: '',
      unit: 'un',
      quantity: 1,
      unit_cost: 0,
      total_cost: 0
    };
    onChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    onChange(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, updates: Partial<TechnicalSheetItem>) => {
    onChange(items.map(i => {
      if (i.id === id) {
        const updated = { ...i, ...updates };
        updated.total_cost = updated.quantity * updated.unit_cost;
        return updated;
      }
      return i;
    }));
  };

  const total = items.reduce((sum, i) => sum + i.total_cost, 0);

  return (
    <div className="mt-4 border rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-slate-50 p-3 border-b text-sm font-bold text-secondary flex items-center">
        <Package className="w-4 h-4 mr-2" />
        Composição da Ficha Técnica
      </div>
      
      <div className="p-4 bg-white">
        {items.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center">
            <p className="text-zinc-400 text-sm italic mb-4">
              Nenhum item adicionado. Clique em &quot;+ Adicionar item&quot; para começar.
            </p>
            <Button size="sm" variant="outline" onClick={addItem} className="border-primary text-primary">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar item
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2 px-2 text-[10px] font-bold text-zinc-400 uppercase">
              <div className="col-span-4">Item</div>
              <div className="col-span-2">Unid.</div>
              <div className="col-span-2">Qtd.</div>
              <div className="col-span-2">Custo Unit.</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center group">
                  <div className="col-span-4">
                    <Input 
                      placeholder="Ex: Tecido" 
                      value={item.name}
                      className="h-9 text-xs"
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Select value={item.unit} onValueChange={(val) => updateItem(item.id, { unit: val })}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map(u => (
                          <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      value={item.quantity}
                      className="h-9 text-xs"
                      onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      value={item.unit_cost}
                      className="h-9 text-xs"
                      onChange={(e) => updateItem(item.id, { unit_cost: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <span className="text-xs font-bold text-primary mr-2">
                      {formatCurrency(item.total_cost)}
                    </span>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-zinc-300 hover:text-danger hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-2 border-t flex justify-between items-center">
              <Button size="sm" variant="ghost" onClick={addItem} className="text-primary hover:bg-primary/5">
                <Plus className="w-4 h-4 mr-1" />
                Adicionar mais um item
              </Button>
              <div className="text-sm">
                <span className="text-zinc-500 mr-2">Total da ficha técnica:</span>
                <span className="font-black text-primary text-lg">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-2 bg-blue-50 text-[10px] text-blue-700 text-center uppercase font-bold tracking-wider">
        O total da ficha técnica substitui o campo &quot;Valor de compra&quot;
      </div>
    </div>
  )
}
