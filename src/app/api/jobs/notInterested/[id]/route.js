import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { verifyFirebaseToken } from '@/lib/verifyFirebaseToken';
import { register } from '@/instrumentation';
import {Job} from "../../../../../../db/schema"

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyFirebaseToken(token);
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const { email, notInterested } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await register();
    
    const job = await Job.findById(id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (notInterested) {
      if (!job.studentsNotInterested) {
        job.studentsNotInterested = [];
      }
      if (!job.studentsNotInterested.includes(email)) {
        job.studentsNotInterested.push(email);
      }
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await job.save();

    return NextResponse.json({ message: 'Status updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}