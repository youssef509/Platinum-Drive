import { NextRequest, NextResponse } from 'next/server'
import { auth, getDbUser } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'

interface FolderNode {
  id: string
  name: string
  parentId: string | null
  children?: FolderNode[]
  depth: number
}

// Helper function to build folder tree
function buildFolderTree(folders: any[]): FolderNode[] {
  const folderMap = new Map<string, FolderNode>()
  const rootFolders: FolderNode[] = []

  // Create folder nodes
  folders.forEach(folder => {
    folderMap.set(folder.id, {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      children: [],
      depth: 0,
    })
  })

  // Build tree structure
  folders.forEach(folder => {
    const node = folderMap.get(folder.id)!
    if (folder.parentId && folderMap.has(folder.parentId)) {
      const parent = folderMap.get(folder.parentId)!
      parent.children!.push(node)
    } else {
      rootFolders.push(node)
    }
  })

  // Calculate depth
  function setDepth(node: FolderNode, depth: number) {
    node.depth = depth
    node.children?.forEach(child => setDepth(child, depth + 1))
  }

  rootFolders.forEach(node => setDepth(node, 0))

  return rootFolders
}

// Flatten tree to list with depth
function flattenTree(nodes: FolderNode[]): FolderNode[] {
  const result: FolderNode[] = []
  
  function traverse(node: FolderNode) {
    result.push(node)
    if (node.children) {
      // Sort children alphabetically
      node.children.sort((a, b) => a.name.localeCompare(b.name, 'ar'))
      node.children.forEach(child => traverse(child))
    }
  }

  // Sort root folders alphabetically
  nodes.sort((a, b) => a.name.localeCompare(b.name, 'ar'))
  nodes.forEach(node => traverse(node))

  return result
}

// GET - Get all user folders (for upload page folder selection)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }
    const dbUser = await getDbUser()
    if (!dbUser) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Get all folders for this user
    const folders = await prisma.folder.findMany({
      where: {
        ownerId: dbUser.id,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    })

    // Build folder tree
    const tree = buildFolderTree(folders)
    
    // Flatten tree with depth information
    const flattenedFolders = flattenTree(tree)

    return NextResponse.json({ folders: flattenedFolders })
  } catch (error) {
    console.error('Error fetching all folders:', error)
    return NextResponse.json(
      { error: 'فشل تحميل المجلدات' },
      { status: 500 }
    )
  }
}
