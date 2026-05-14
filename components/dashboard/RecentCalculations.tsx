import Link from "next/link"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, ArrowRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils/formatters"
import { PriceCalculation } from "@/types"

interface RecentCalculationsProps {
  calculations: PriceCalculation[];
}

export function RecentCalculations({ calculations }: RecentCalculationsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="font-bold text-secondary">Cálculos Recentes</h3>
        <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/5">
          <Link href="/relatorios">
            Ver histórico completo
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-bold">Produto/Serviço</TableHead>
            <TableHead className="font-bold">Custo Real</TableHead>
            <TableHead className="font-bold">Preço Venda</TableHead>
            <TableHead className="font-bold">Margem</TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="text-right font-bold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calculations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-zinc-400 italic">
                Nenhum cálculo realizado ainda. Comece agora!
              </TableCell>
            </TableRow>
          ) : (
            calculations.map((calc) => {
              const margin = ((calc.selling_price - calc.real_cost) / calc.selling_price * 100).toFixed(1);
              
              return (
                <TableRow key={calc.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-secondary">
                    {calc.product_name}
                  </TableCell>
                  <TableCell>{formatCurrency(calc.real_cost)}</TableCell>
                  <TableCell>{formatCurrency(calc.selling_price)}</TableCell>
                  <TableCell>
                    <span className={calc.is_negative_margin ? "text-danger font-bold" : "text-primary font-bold"}>
                      {margin}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={calc.is_negative_margin ? "bg-red-100 text-red-700 hover:bg-red-100 border-none" : "bg-green-100 text-green-700 hover:bg-green-100 border-none"}>
                      {calc.is_negative_margin ? "Negativo" : "Saudável"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild title="Ver detalhes">
                      <Link href={`/precificar/${calc.id}`}>
                        <Eye className="w-4 h-4 text-zinc-500" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
