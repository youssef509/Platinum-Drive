import { getDbUser } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import SearchPageClient from './search-client'

export default async function SearchPage() {
  const dbUser = await getDbUser()

  if (!dbUser?.id) {
    redirect('/sign-in')
  }

  return (
    <MainLayout>
      <SearchPageClient userId={dbUser.id} />
    </MainLayout>
  )
}
