import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { verifyFirebaseToken } from '@/lib/verifyFirebaseToken';
import { register } from '@/instrumentation';
import { Webinar } from '../../../../../db/schema';

export async function GET(request, { params }) {
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
      return NextResponse.json({ error: 'Invalid webinar ID' }, { status: 400 });
    }

    await register();
    
    const webinar = await Webinar.findById(id).lean();

    if (!webinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
    }

    return NextResponse.json({ webinar }, { status: 200 });
  } catch (error) {
    console.error('Error fetching webinar:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

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
      return NextResponse.json({ error: 'Invalid webinar ID' }, { status: 400 });
    }

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' }, 
        { status: 400 }
      );
    }

    if (decodedToken.email !== email) {
      return NextResponse.json(
        { error: 'Cannot register on behalf of another user' }, 
        { status: 403 }
      );
    }

    await register();
    
    const webinar = await Webinar.findById(id);
    if (!webinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
    }

    if (webinar.studentsApplied && webinar.studentsApplied.includes(email)) {
      return NextResponse.json(
        { error: 'You have already registered for this webinar' }, 
        { status: 409 }
      );
    }

    const updatedWebinar = await Webinar.findByIdAndUpdate(
      id,
      { 
        $addToSet: { 
          studentsApplied: email 
        }
      },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!updatedWebinar) {
      return NextResponse.json(
        { error: 'Failed to register for webinar' }, 
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Successfully registered for webinar',
        registrantCount: updatedWebinar.studentsApplied.length
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error registering for webinar:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors }, 
        { status: 400 }
      );
    }

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid data format' }, 
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('email');
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyFirebaseToken(token);
    
    if (!decodedToken || decodedToken.email !== studentEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid webinar ID' }, { status: 400 });
    }

    await register();
    
    const updatedWebinar = await Webinar.findByIdAndUpdate(
      id,
      { 
        $pull: { 
          studentsApplied: studentEmail 
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedWebinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
    }

    return NextResponse.json(
      { 
        message: 'Registration withdrawn successfully',
        remainingRegistrants: updatedWebinar.studentsApplied.length
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error withdrawing registration:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid webinar ID format' }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}