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
import { CnpjInput } from "@/components/forms/CnpjInput"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth"
import { createClient } from "@/lib/supabase/client"

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        toast.error("E-mail ou senha incorretos.")
        setIsLoading(false)
        return
      }

      if (authData.user) {
        // Fetch company via user profile
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("company_id")
          .eq("id", authData.user.id)
          .single()

        if (profile?.company_id) {
          const { data: company } = await supabase
            .from("companies")
            .select("subscription_status")
            .eq("id", profile.company_id)
            .single()

          if (company?.subscription_status === "suspended") {
            toast.error("Sua conta está suspensa por inadimplência. Regularize o pagamento para reativar o acesso.", { duration: 6000 })
            router.push("/planos")
            return
          }

          const { data: fiscalProfile } = await supabase
            .from("fiscal_profiles")
            .select("onboarding_completed")
            .eq("company_id", profile.company_id)
            .single()

          if (fiscalProfile && fiscalProfile.onboarding_completed === false) {
            router.push("/dashboard/onboarding")
            return
          }

          router.push("/dashboard")
        } else {
          toast.error("Ocorreu um erro. Tente novamente.")
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error(error)
      toast.error("Ocorreu um erro. Tente novamente.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AuthLeftPanel />
      
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-secondary text-center">
              Acesse sua Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ (Opcional)</Label>
                <CnpjInput id="cnpj" error={!!errors.cnpj} {...register("cnpj")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" className={errors.email ? "border-danger" : ""} {...register("email")} />
                {errors.email && <p className="text-sm text-danger">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link href="/esqueci-senha" className="text-sm text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
                <Input id="password" type="password" className={errors.password ? "border-danger" : ""} {...register("password")} />
                {errors.password && <p className="text-sm text-danger">{errors.password.message}</p>}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="remember" className="rounded border-zinc-300 text-primary focus:ring-primary" />
                <Label htmlFor="remember" className="font-normal cursor-pointer">Lembrar acesso</Label>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white mt-4" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-zinc-600">
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="text-primary font-medium hover:underline">
                Cadastre sua empresa
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
