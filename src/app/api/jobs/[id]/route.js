import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { verifyFirebaseToken } from '@/lib/verifyFirebaseToken'; // Adjust path as needed
import { register } from '@/instrumentation';
import { Job } from '../../../../../db/schema';

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
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    await register();
    
    const job = await Job.findById(id).lean();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    console.error('Error fetching job:', error);
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
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const applicationData = await request.json();
    
    if (!applicationData.email || !applicationData.responses || !applicationData.appliedAt) {
      return NextResponse.json(
        { error: 'Missing required application data (email, responses, appliedAt)' }, 
        { status: 400 }
      );
    }

    if (decodedToken.email !== applicationData.email) {
      return NextResponse.json(
        { error: 'Cannot apply on behalf of another user' }, 
        { status: 403 }
      );
    }

    if (!Array.isArray(applicationData.responses)) {
      return NextResponse.json(
        { error: 'Responses must be an array' }, 
        { status: 400 }
      );
    }

    for (const response of applicationData.responses) {
      if (!response.fieldName || response.value === undefined) {
        return NextResponse.json(
          { error: 'Each response must have fieldName and value' }, 
          { status: 400 }
        );
      }
    }

    await register();
    
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const existingApplication = job.studentsApplied?.find(
      app => app.email === applicationData.email
    );
    
    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this job' }, 
        { status: 409 }
      );
    }

    if (job.deadline) {
      const deadlineDate = new Date(job.deadline);
      const currentDate = new Date();
      if (currentDate > deadlineDate) {
        return NextResponse.json(
          { error: 'Application deadline has passed' }, 
          { status: 400 }
        );
      }
    }

    const processedResponses = applicationData.responses.map(response => {
      let processedValue = response.value;
      
      if (response.fieldType === 'file' && typeof response.value === 'string') {
        processedValue = response.value;
      }
      
      return {
        fieldName: response.fieldName,
        value: processedValue
      };
    });

    const newApplication = {
      email: applicationData.email,
      responses: processedResponses,
      appliedAt: new Date(applicationData.appliedAt),
      applicantName: decodedToken.name || decodedToken.email.split('@')[0],
      status: 'pending'
    };

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { 
        $push: { 
          studentsApplied: newApplication 
        },
        $set: {
          updatedAt: new Date()
        }
      },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!updatedJob) {
      return NextResponse.json(
        { error: 'Failed to add application' }, 
        { status: 500 }
      );
    }
    return NextResponse.json(
      { 
        message: 'Application submitted successfully',
        applicationId: newApplication.appliedAt.toISOString(),
        applicantCount: updatedJob.studentsApplied.length
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error adding application:', error);
    
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
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    await register();
    
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { 
        $pull: { 
          studentsApplied: { email: studentEmail }
        },
        $set: {
          updatedAt: new Date()
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(
      { 
        message: 'Application withdrawn successfully',
        remainingApplicants: updatedJob.studentsApplied.length
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error withdrawing application:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid job ID format' }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { applicationEmail, newStatus } = await request.json();
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyFirebaseToken(token);
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') }, 
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    await register();
    
    const updatedJob = await Job.findOneAndUpdate(
      { 
        _id: id,
        "studentsApplied.email": applicationEmail
      },
      { 
        $set: { 
          "studentsApplied.$.status": newStatus,
          updatedAt: new Date()
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedJob) {
      return NextResponse.json(
        { error: 'Job or application not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Application status updated successfully',
        newStatus: newStatus
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}