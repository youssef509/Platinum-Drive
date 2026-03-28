import { NextResponse } from 'next/server'
import { auth, getDbUser } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }
    const dbUser = await getDbUser()
    if (!dbUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const fileType = searchParams.get('fileType') // 'image', 'document', 'video', 'audio', 'archive', 'other'
    const dateFrom = searchParams.get('dateFrom') // ISO date string
    const dateTo = searchParams.get('dateTo') // ISO date string
    const minSize = searchParams.get('minSize') // bytes
    const maxSize = searchParams.get('maxSize') // bytes
    const folderId = searchParams.get('folderId') // search within specific folder
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build search filters
    const searchFilters: any = {
      ownerId: dbUser.id,
      deletedAt: null, // Exclude deleted files
    }

    // Text search in name
    if (query.trim()) {
      searchFilters.name = {
        contains: query.trim(),
        mode: 'insensitive',
      }
    }

    // File type filter
    if (fileType) {
      const mimeTypePatterns: Record<string, string[]> = {
        image: ['image/%'],
        document: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument%',
          'text/%',
        ],
        video: ['video/%'],
        audio: ['audio/%'],
        archive: [
          'application/zip',
          'application/x-rar%',
          'application/x-7z%',
        ],
      }

      if (mimeTypePatterns[fileType]) {
        searchFilters.OR = mimeTypePatterns[fileType].map((pattern) => ({
          mimeType: { contains: pattern.replace('%', '') },
        }))
      }
    }

    // Date range filter
    if (dateFrom || dateTo) {
      searchFilters.createdAt = {}
      if (dateFrom) {
        searchFilters.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        searchFilters.createdAt.lte = new Date(dateTo)
      }
    }

    // Size range filter
    if (minSize || maxSize) {
      searchFilters.size = {}
      if (minSize) {
        searchFilters.size.gte = parseInt(minSize)
      }
      if (maxSize) {
        searchFilters.size.lte = parseInt(maxSize)
      }
    }

    // Folder filter
    if (folderId) {
      searchFilters.folderId = folderId
    }

    // Search files
    const [files, totalFiles] = await Promise.all([
      prisma.file.findMany({
        where: searchFilters,
        include: {
          folder: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.file.count({ where: searchFilters }),
    ])

    // Build folder search filters (only name search, no mime type)
    const folderSearchFilters: any = {
      ownerId: dbUser.id,
    }

    if (query.trim()) {
      folderSearchFilters.name = {
        contains: query.trim(),
        mode: 'insensitive',
      }
    }

    if (folderId) {
      folderSearchFilters.parentId = folderId
    }

    // Search folders (only if text query provided)
    let folders: any[] = []
    let totalFolders = 0

    if (query.trim()) {
      ;[folders, totalFolders] = await Promise.all([
        prisma.folder.findMany({
          where: folderSearchFilters,
          include: {
            _count: {
              select: {
                files: true,
                children: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 20, // Limit folders in results
        }),
        prisma.folder.count({ where: folderSearchFilters }),
      ])
    }

    return NextResponse.json({
      files,
      folders,
      totalFiles,
      totalFolders,
      page,
      limit,
      totalPages: Math.ceil(totalFiles / limit),
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'فشل البحث' },
      { status: 500 }
    )
  }
}
