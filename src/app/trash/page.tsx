import { getDbUser } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import TrashPageClient from './trash-client'

export default async function TrashPage() {
  const dbUser = await getDbUser()

  if (!dbUser?.id) {
    redirect('/sign-in')
  }

  return (
    <MainLayout>
      <TrashPageClient userId={dbUser.id} />
    </MainLayout>
  )
}
