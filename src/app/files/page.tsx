import { getDbUser } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import FilesPageClient from './files-client'

export default async function FilesPage() {
  const dbUser = await getDbUser()

  if (!dbUser?.id) {
    redirect('/sign-in')
  }

  return (
    <MainLayout>
      <FilesPageClient userId={dbUser.id} />
    </MainLayout>
  )
}
