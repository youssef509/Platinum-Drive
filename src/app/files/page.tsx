import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import FilesPageClient from './files-client'

export default async function FilesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/sign-in')
  }

  return <FilesPageClient userId={session.user.id} />
}
