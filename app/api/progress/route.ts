// What this API does:
// - POST: Create a new progress entry with images
// - GET: Fetch user's progress entries
// - DELETE: Delete a progress entry

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { ProgressEntry } from '@/lib/models/ProgressEntry'
import { uploadMultipleImages } from '@/lib/imageUpload'

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const formData = await req.formData()
    const images = formData.getAll('images') as File[]
    const weight = formData.get('weight') ? Number(formData.get('weight')) : undefined
    const note = formData.get('note') as string

    // Validate inputs
    if (weight && (isNaN(weight) || weight < 0 || weight > 1000)) {
      return NextResponse.json({ error: 'Invalid weight value' }, { status: 400 })
    }

    if (note && note.length > 500) {
      return NextResponse.json({ error: 'Note too long (max 500 characters)' }, { status: 400 })
    }

    // Upload images if provided
    let imageUrls: string[] = []
    if (images && images.length > 0) {
      try {
        const uploadResults = await uploadMultipleImages(images)
        imageUrls = uploadResults.map(result => result.url)
      } catch (error) {
        console.error('Image upload error:', error)
        return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 })
      }
    }

    // Create progress entry
    const progressEntry = await ProgressEntry.create({
      userId: session.user.email,
      images: imageUrls,
      weight,
      note: note?.trim() || undefined
    })

    return NextResponse.json({ 
      success: true,
      entry: progressEntry 
    })

  } catch (error) {
    console.error('Error creating progress entry:', error)
    return NextResponse.json({ error: 'Failed to create progress entry' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    const entries = await ProgressEntry.find({ userId: session.user.email })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await ProgressEntry.countDocuments({ userId: session.user.email })

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching progress entries:', error)
    return NextResponse.json({ error: 'Failed to fetch progress entries' }, { status: 500 })
  }
}
