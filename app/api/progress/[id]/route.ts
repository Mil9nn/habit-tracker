// What this API does:
// - DELETE: Delete a specific progress entry

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { ProgressEntry } from '@/lib/models/ProgressEntry'

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { id } = await context.params

    // Find the progress entry to ensure it belongs to the user
    const progressEntry = await ProgressEntry.findOne({
      _id: id,
      userId: session.user.email
    })

    if (!progressEntry) {
      return NextResponse.json({ error: 'Progress entry not found' }, { status: 404 })
    }

    // Delete the progress entry
    await progressEntry.deleteOne({ _id: id });

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting progress entry:', error)
    return NextResponse.json({ error: 'Failed to delete progress entry' }, { status: 500 })
  }
}
