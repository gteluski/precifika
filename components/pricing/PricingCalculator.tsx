"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  Sparkles, 
  RotateCcw, 
  Save, 
  ArrowUpRight, 
  Lock,
  Package,
  Wrench
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePricingCalculator } from "@/lib/hooks/usePricingCalculator"
import { FiscalProfile } from "@/types"

import { Block1PurchaseCost } from "./Block1PurchaseCost"
import { Block2SaleTaxes } from "./Block2SaleTaxes"
import { Block3Margin } from "./Block3Margin"
import { NegativeMarginAlert } from "./NegativeMarginAlert"
import { ResultsBar } from "./ResultsBar"
import { SaveModal, SaveData } from "./SaveModal"

interface PricingCalculatorProps {
  fiscalProfile: FiscalProfile;
  products: { id: string, name: string }[];
  plan: 'free' | 'premium';
}

export function PricingCalculator({ fiscalProfile, products, plan }: PricingCalculatorProps) {
  const router = useRouter();
  const { state, results, updateState, resetCalculator } = usePricingCalculator(fiscalProfile.effective_rate);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleSave = async (saveData: SaveData) => {
    try {
      const response = await fetch('/api/pricing/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state,
          ...results,
          itemName: saveData.name,
          itemType: saveData.type,
          productId: saveData.productId === 'none' ? undefined : saveData.productId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'LIMIT_REACHED') {
          toast.error("Limite do plano atingido! Faça upgrade para salvar mais precificações.", {
            action: {
              label: "Ver Planos",
              onClick: () => router.push('/planos')
            }
          });
          return;
        }
        throw new Error(data.message || 'Erro ao salvar');
      }

      toast.success("Precificação salva com sucesso!");
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao salvar precificação.";
      toast.error(message);
    }
  };

  return (
    <div className="pb-20">
      {/* Top Header & Item Type Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex-1 max-w-2xl">
          <Tabs 
            value={state.itemType} 
            onValueChange={(val) => updateState({ itemType: val as 'product' | 'service' })}
            className="mb-4"
          >
            <TabsList className="bg-slate-100 p-1 h-12">
              <TabsTrigger value="product" className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary">
                <Package className="w-4 h-4 mr-2" />
                PRODUTO
              </TabsTrigger>
              <TabsTrigger value="service" className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary">
                <Wrench className="w-4 h-4 mr-2" />
                SERVIÇO
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Input 
            placeholder={state.itemType === 'product' ? "Nome do produto (ex: Camiseta Algodão)" : "Nome do serviço (ex: Consultoria Fiscal)"}
            value={state.itemName}
            onChange={(e) => updateState({ itemName: e.target.value })}
            className="h-14 text-xl font-bold text-secondary border-2 border-slate-200 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <div className="relative group">
            <Button 
              variant="outline" 
              className={plan === 'free' ? "bg-slate-50 text-slate-400 border-slate-200" : "bg-white border-primary text-primary"}
              disabled={plan === 'free'}
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Importar XML
              {plan === 'free' && <Lock className="w-3 h-3 ml-2" />}
            </Button>
            {plan === 'free' && (
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-48 p-2 bg-zinc-800 text-white text-[10px] rounded shadow-lg z-50">
                A importação de XML da NF-e está disponível apenas no plano Premium.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Block1PurchaseCost 
          state={state} 
          updateState={updateState} 
          purchaseTaxesAmount={results.purchaseTaxesAmount} 
        />
        
        <Block2SaleTaxes 
          state={state} 
          updateState={updateState} 
          totalSaleTaxRate={results.totalSaleTaxRate}
          initialSimplesRate={fiscalProfile.effective_rate}
        />
        
        <Block3Margin 
          state={state} 
          updateState={updateState} 
          actualMargin={results.actualMargin}
          suggestedPrice={results.suggestedPrice}
        />
      </div>

      {/* Negative Margin Alert */}
      <NegativeMarginAlert 
        isNegative={results.isNegativeMargin}
        profitPerUnit={results.profitPerUnit}
        minimumPrice={results.minimumPrice}
        sellingPrice={results.sellingPrice}
        onUseMinimumPrice={() => updateState({ sellingPrice: results.minimumPrice, marginInputMode: 'price' })}
      />

      {/* Results Bar */}
      <ResultsBar 
        realCost={results.realCost}
        minimumPrice={results.minimumPrice}
        suggestedPrice={results.suggestedPrice}
        profitPerUnit={results.profitPerUnit}
      />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t">
        <Button 
          variant="ghost" 
          onClick={resetCalculator}
          className="text-zinc-500 hover:text-danger hover:bg-red-50"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Limpar calculadora
        </Button>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className={plan === 'free' ? "text-zinc-400" : "border-primary text-primary"}
            disabled={plan === 'free'}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Sugestão com IA
            {plan === 'free' && <Lock className="w-3 h-3 ml-2" />}
          </Button>

          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white min-w-[200px]"
            onClick={() => setIsSaveModalOpen(true)}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar precificação
          </Button>
        </div>
      </div>

      {/* Save Modal */}
      <SaveModal 
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSave}
        initialName={state.itemName}
        initialType={state.itemType}
        products={products}
      />
    </div>
  )
}
