import { redirect } from 'next/navigation'
import { getDbUser } from '@/lib/auth/auth'
import SharedLinksClient from './shared-client'
import MainLayout from '@/components/layout/main-layout'

export default async function SharedLinksPage() {
  const dbUser = await getDbUser()

  if (!dbUser?.id) {
    redirect('/sign-in')
  }

  return (
    <MainLayout>
      <SharedLinksClient userId={dbUser.id} />
    </MainLayout>
  )
}
