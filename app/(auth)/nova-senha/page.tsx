"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth"
import { createClient } from "@/lib/supabase/client"

export default function NovaSenha() {
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  })

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error("O link de recuperação é inválido ou expirou.")
        router.push("/login")
      } else {
        setIsCheckingAuth(false)
      }
    }
    checkSession()
  }, [router, supabase.auth])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      })

      if (error) {
        toast.error("Ocorreu um erro ao alterar sua senha.")
        setIsLoading(false)
        return
      }

      toast.success("Senha alterada com sucesso. Faça login.")
      router.push("/login")
      
    } catch (error) {
      console.error(error)
      toast.error("Ocorreu um erro. Tente novamente.")
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AuthLeftPanel showFeatures={false} />
      
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-secondary text-center">
              Criar Nova Senha
            </CardTitle>
            <CardDescription className="text-center pt-2">
              Digite sua nova senha abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input id="newPassword" type="password" className={errors.newPassword ? "border-danger" : ""} {...register("newPassword")} />
                {errors.newPassword && <p className="text-sm text-danger">{errors.newPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input id="confirmPassword" type="password" className={errors.confirmPassword ? "border-danger" : ""} {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-sm text-danger">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white mt-4" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Alterar Senha
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
