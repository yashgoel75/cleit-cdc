import mongoose from "mongoose";
const { Schema } = mongoose;

const StudentApplicationSchema = new mongoose.Schema({
    email: { type: String, required: true },
    responses: [
        {
            fieldName: String,
            value: mongoose.Schema.Types.Mixed,
        },
    ],
    appliedAt: { type: Date, default: Date.now },
});


const job = new Schema({
    company: String,
    role: String,
    location: String,
    description: String,
    deadline: String,
    postedAt: { type: Date, default: Date.now },
    jobDescriptionPdf: String,
    eligibility: [String],
    linkToApply: String,
    studentsApplied: [StudentApplicationSchema],
    studentsNotInterested: [String],
    extraFields: [{
        fieldName: {
            type: String,
            required: true,
        },
        fieldValue: {
            type: String,
            required: true,
        },
    }],
    inputFields: [{
        fieldName: { type: String, required: true },
        type: { type: String, required: true },
        placeholder: { type: String },
        required: { type: Boolean, default: false },
        options: [{ type: String }],
    }],

}, { timestamps: true })

const test = new Schema({
    title: { type: String, required: true },
    description: String,
    date: String,
    time: String,
    duration: String,
    mode: { type: String },
    link: String,
    instructions: [String],
    eligibility: [String],
    deadline: String,
    studentsApplied: [String]
}, { timestamps: true })

const webinar = new Schema({
    title: { type: String, required: true },
    description: String,
    date: String,
    time: String,
    duration: String,
    mode: { type: String },
    link: String,
    studentsApplied: [String]
})

const user = new Schema({
    name: String,
    username: String,
    collegeEmail: String,
    personalEmail: String,
    enrollmentNumber: String,
    phone: Number,
    department: String,
    tenthPercentage: Number,
    twelfthPercentage: Number,
    collegeGPA: Number,
    batchStart: Number,
    batchEnd: Number,
    linkedin: String,
    github: String,
    leetcode: String,
    resume: String,
    status: String,
    isProfileComplete: Boolean,
    jobs: [{
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
        appliedAt: { type: Date, default: Date.now }
    }],
    tests: [{ testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" }, appliedAt: { type: Date, default: Date.now } }],
    webinars: [{ webinarId: { type: mongoose.Schema.Types.ObjectId, ref: "Webinar" }, appliedAt: { type: Date, default: Date.now } }],
});

const Job = mongoose.models.Job || mongoose.model("Job", job);
const Test = mongoose.models.Test || mongoose.model("Test", test);
const Webinar = mongoose.models.Webinar || mongoose.model("Webinar", webinar);
const User = mongoose.models.User || mongoose.model("User", user);

export { Job, Test, Webinar, User };