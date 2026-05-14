"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"

import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth"
import { createClient } from "@/lib/supabase/client"

export default function EsqueciSenha() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/nova-senha`,
      })

      if (error) {
        toast.error("Ocorreu um erro. Verifique se o e-mail está correto.")
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
    } catch (error) {
      console.error(error)
      toast.error("Ocorreu um erro. Tente novamente.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AuthLeftPanel showFeatures={false} />
      
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-secondary text-center">
              Recuperar Senha
            </CardTitle>
            <CardDescription className="text-center pt-2">
              Informe seu e-mail corporativo para receber as instruções de recuperação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center space-y-6">
                <div className="p-4 bg-primary/10 text-primary rounded-lg">
                  Enviamos um link para <strong>{getValues("email")}</strong>. Verifique sua caixa de entrada.
                </div>
                <Link href="/login" className="inline-flex items-center text-sm font-medium text-secondary hover:text-primary transition-colors">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" className={errors.email ? "border-danger" : ""} {...register("email")} />
                  {errors.email && <p className="text-sm text-danger">{errors.email.message}</p>}
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white mt-4" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar link de redefinição
                </Button>
                
                <div className="pt-4 text-center">
                  <Link href="/login" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-primary transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
