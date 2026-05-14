import { z } from 'zod';
import { isValidCnpj } from '../utils/cnpj';

export const loginSchema = z.object({
  email: z.string().email('Digite um e-mail válido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
  cnpj: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registrationSchema = z.object({
  // Step 1 - Company Data
  cnpj: z.string().refine((val) => {
    return isValidCnpj(val);
  }, 'CNPJ inválido.'),
  razao_social: z.string().min(3, 'A razão social deve ter no mínimo 3 caracteres.'),
  nome_fantasia: z.string().optional(),
  telefone: z.string().min(14, 'Telefone inválido.'),
  cidade: z.string().min(2, 'Cidade é obrigatória.'),
  estado: z.string().length(2, 'Selecione um estado válido.'),
  
  // Step 2 - Access Credentials
  email: z.string().email('Digite um e-mail válido.'),
  password: z.string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .regex(/\d/, 'A senha deve conter pelo menos um número.'),
  confirmPassword: z.string(),
  fullName: z.string().min(3, 'Nome completo é obrigatório.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Digite um e-mail válido.'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .regex(/\d/, 'A senha deve conter pelo menos um número.'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
