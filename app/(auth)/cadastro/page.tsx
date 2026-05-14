"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CnpjInput } from "@/components/forms/CnpjInput"
import { PhoneInput } from "@/components/forms/PhoneInput"
import { registrationSchema, type RegistrationFormData } from "@/lib/validations/auth"
import { createClient } from "@/lib/supabase/client"

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]

export default function Cadastro() {
  const [step, setStep] = useState<1 | 2>(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors }, trigger, setValue } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onBlur"
  })

  const nextStep = async () => {
    const valid = await trigger(["cnpj", "razao_social", "nome_fantasia", "telefone", "cidade", "estado"])
    if (valid) setStep(2)
  }

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true)
    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast.error("Este e-mail já está em uso.")
        } else {
          toast.error("Ocorreu um erro. Tente novamente.")
        }
        return
      }

      if (authData.user) {
        // 2. Insert Company
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .insert({
            cnpj: data.cnpj.replace(/\D/g, ''),
            razao_social: data.razao_social,
            nome_fantasia: data.nome_fantasia || null,
            email: data.email,
            phone: data.telefone.replace(/\D/g, ''),
            city: data.cidade,
            state: data.estado,
          })
          .select()
          .single()

        if (companyError) throw companyError

        // 3. Insert User Profile
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert({
            id: authData.user.id,
            company_id: company.id,
            full_name: data.fullName,
            role: "owner"
          })

        if (profileError) throw profileError

        // 4. Insert Fiscal Profile (empty/incomplete)
        const { error: fiscalError } = await supabase
          .from("fiscal_profiles")
          .insert({
            company_id: company.id,
            business_type: "product",
            tax_regime: "simples_nacional",
            onboarding_completed: false
          })

        if (fiscalError) throw fiscalError

        toast.success("Conta criada com sucesso!")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error(error)
      toast.error("Ocorreu um erro. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AuthLeftPanel />
      
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <Card className="w-full max-w-lg border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-secondary text-center">
              Cadastre sua Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <CnpjInput id="cnpj" error={!!errors.cnpj} {...register("cnpj")} />
                    {errors.cnpj && <p className="text-sm text-danger">{errors.cnpj.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="razao_social">Razão Social</Label>
                    <Input id="razao_social" className={errors.razao_social ? "border-danger" : ""} {...register("razao_social")} />
                    {errors.razao_social && <p className="text-sm text-danger">{errors.razao_social.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nome_fantasia">Nome Fantasia (Opcional)</Label>
                    <Input id="nome_fantasia" {...register("nome_fantasia")} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <PhoneInput id="telefone" error={!!errors.telefone} {...register("telefone")} />
                      {errors.telefone && <p className="text-sm text-danger">{errors.telefone.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Select onValueChange={(val) => setValue("estado", val)}>
                        <SelectTrigger className={errors.estado ? "border-danger" : ""}>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {BRAZILIAN_STATES.map(uf => (
                            <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.estado && <p className="text-sm text-danger">{errors.estado.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" className={errors.cidade ? "border-danger" : ""} {...register("cidade")} />
                    {errors.cidade && <p className="text-sm text-danger">{errors.cidade.message}</p>}
                  </div>

                  <Button type="button" className="w-full bg-primary hover:bg-primary/90 text-white" onClick={nextStep}>
                    Próximo Passo
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input id="fullName" className={errors.fullName ? "border-danger" : ""} {...register("fullName")} />
                    {errors.fullName && <p className="text-sm text-danger">{errors.fullName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail Corporativo</Label>
                    <Input id="email" type="email" className={errors.email ? "border-danger" : ""} {...register("email")} />
                    {errors.email && <p className="text-sm text-danger">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" className={errors.password ? "border-danger" : ""} {...register("password")} />
                    {errors.password && <p className="text-sm text-danger">{errors.password.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input id="confirmPassword" type="password" className={errors.confirmPassword ? "border-danger" : ""} {...register("confirmPassword")} />
                    {errors.confirmPassword && <p className="text-sm text-danger">{errors.confirmPassword.message}</p>}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)} disabled={isLoading}>
                      Voltar
                    </Button>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Finalizar Cadastro
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-6 text-center text-sm text-zinc-600">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Faça login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
