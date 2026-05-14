"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SaveData) => Promise<void>;
  initialName?: string;
  initialType?: 'product' | 'service';
  products: { id: string, name: string }[];
}

export type SaveData = {
  name: string;
  type: 'product' | 'service';
  productId?: string;
}

export function SaveModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialName = '', 
  initialType = 'product',
  products 
}: SaveModalProps) {
  const [name, setName] = useState(initialName);
  const [type, setType] = useState<'product' | 'service'>(initialType);
  const [productId, setProductId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name) return;
    setIsLoading(true);
    try {
      await onSave({ name, type, productId });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-secondary">Salvar esta precificação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="saveName">Nome do produto/serviço</Label>
            <Input 
              id="saveName" 
              placeholder="Ex: Camiseta Algodão Branca" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <RadioGroup 
              value={type} 
              onValueChange={(val) => setType(val as 'product' | 'service')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="product" id="type-product" />
                <Label htmlFor="type-product" className="font-normal">Produto</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="service" id="type-service" />
                <Label htmlFor="type-service" className="font-normal">Serviço</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkProduct">Vincular a produto existente (Opcional)</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger id="linkProduct">
                <SelectValue placeholder="Selecione um produto..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum (Criar novo)</SelectItem>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-zinc-500">Ao vincular, o preço e margem do produto serão atualizados.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white" 
            onClick={handleSave}
            disabled={!name || isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Precificação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
