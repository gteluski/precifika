import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/supabase/auth-helpers"
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"

export default async function OnboardingPage() {
  const { company, fiscalProfile } = await requireAuth()

  if (fiscalProfile && fiscalProfile.onboarding_completed) {
    redirect('/dashboard')
  }

  if (!company) {
    redirect('/login')
  }

  return <OnboardingWizard companyId={company.id} />
}
