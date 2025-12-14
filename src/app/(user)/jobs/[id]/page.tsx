"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirebaseToken } from "@/utils";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  ExternalLink,
  Briefcase,
} from "lucide-react";

export default function JobDetails() {
  interface StudentApplication {
    email: string;
    responses: {
      fieldName: string;
      value: string | number | File;
    }[];
    appliedAt: string;
  }

  interface inputField {
    fieldName: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }
  interface Job {
    _id?: string;
    company: string;
    role: string;
    location: string;
    description: string;
    deadline: string;
    postedAt?: string;
    jobDescriptionPdf?: string;
    eligibility?: string[];
    linkToApply?: string;
    studentsApplied?: StudentApplication[];
    studentsNotInterested?: string[];
    pdfUrl: string;
    extraFields?: { fieldName: string; fieldValue: string }[];
    inputFields?: {
      fieldName: string;
      type: string;
      placeholder?: string;
      required?: boolean;
      options?: string[];
    }[];
  }

  const { id } = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [formData, setFormData] = useState<
    Record<string, string | number | File>
  >({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchJob = async (jobId: string) => {
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to fetch job details.");
      setJob(data.job);

      if (
        data.job.studentsApplied?.some(
          (app: StudentApplication) => app.email === currentUser?.email
        )
      ) {
        setApplied(true);
      }

      if (data.job.inputFields) {
        const initialFormData: Record<string, string | number | File> = {};
        data.job.inputFields.forEach((field: inputField) => {
          initialFormData[field.fieldName] = field.type === "number" ? 0 : "";
        });
        setFormData(initialFormData);
      }

      setError(null);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    fieldName: string,
    value: string | number | File
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    if (formErrors[fieldName]) {
      setFormErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!job?.inputFields) return true;

    const errors: Record<string, string> = {};

    job.inputFields.forEach((field) => {
      if (field.required) {
        const value = formData[field.fieldName];
        if (!value || (typeof value === "string" && value.trim() === "")) {
          errors[field.fieldName] = `${field.fieldName} is required`;
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [isStudentApplied, setIsStudentApplied] = useState(false);
  useEffect(() => {
    const isAlreadyApplied = () => {
      if (!currentUser?.email || !job) return false;
      setIsStudentApplied(
        job.studentsApplied?.some((app) => app.email === currentUser?.email) ||
          false
      );
    };
    isAlreadyApplied();
  }, [job, currentUser]);

  async function checkEligibility() {
    if (!currentUser?.email || !id) return;
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/user?email=${currentUser.email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const normalize = (str: string) => str.replace(/–/g, "-").trim();

      const eligibilityList = job?.eligibility?.map((e: string) =>
        normalize(e)
      );

      const batchStart = Number(data.user?.batchStart);
      const batchEnd = Number(data.user?.batchEnd);
      const batch =
        batchEnd - batchStart === 3
          ? `${batchStart - 1}-${batchEnd}`
          : `${batchStart}-${batchEnd}`;
      if (eligibilityList?.includes(batch)) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Eligibility check failed:", error);
    }
  }
  const handleApply = async () => {
    if (!currentUser?.email || !id) return;
    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }
    const eligible = await checkEligibility();
    if (!eligible) {
      alert("You are not eligible for this job application");
      return;
    }
    setApplying(true);
    try {
      const token = await getFirebaseToken();
      const responses = Object.entries(formData).map(([fieldName, value]) => ({
        fieldName,
        value,
      }));

      const application: StudentApplication = {
        email: currentUser.email,
        responses,
        appliedAt: new Date().toISOString(),
      };

      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(application),
      });

      if (!res.ok) throw new Error("Failed to apply.");

      setApplied(true);
    } catch (err) {
      console.error(err);
      alert("There was a problem submitting your application.");
    } finally {
      setApplying(false);
    }
  };

  const handleNotInterested = async () => {
    if (!currentUser?.email || !id) return;
    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }
    const eligible = await checkEligibility();
    if (!eligible) {
      alert("You are not eligible for this job application");
      return;
    }
    setApplying(true);
    try {
      const token = await getFirebaseToken();

      const res = await fetch(`/api/jobs/notInterested/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: currentUser.email, notInterested: true }),
      });

      if (!res.ok) throw new Error("Failed to apply.");

      setApplied(true);
    } catch (err) {
      console.error(err);
      alert("There was a problem submitting your application.");
    } finally {
      setApplying(false);
    }
  };

  async function handleApplyOnCompany() {
    if (!currentUser?.email || !id) return;
    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }
    const eligible = await checkEligibility();
    if (!eligible) {
      alert("You are not eligible for this job application");
      return;
    }
    if (job && job.linkToApply) {
      window.open(job.linkToApply, "_blank");
    }
  }

  const renderInputField = (field: inputField) => {
    const value = formData[field.fieldName] || "";
    const hasError = formErrors[field.fieldName];

    switch (field.type) {
      case "text":
        return (
          <div key={field.fieldName} className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value as string}
              onChange={(e) =>
                handleInputChange(field.fieldName, e.target.value)
              }
              placeholder={field.placeholder}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${
                hasError
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {hasError}
              </p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={field.fieldName} className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value as number}
              onChange={(e) =>
                handleInputChange(
                  field.fieldName,
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder={field.placeholder}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${
                hasError
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {hasError}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.fieldName} className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value as string}
              onChange={(e) =>
                handleInputChange(field.fieldName, e.target.value)
              }
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${
                hasError
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
            >
              <option value="">Select {field.fieldName}</option>
              {field.options?.map((option: string, index: number) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {hasError && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {hasError}
              </p>
            )}
          </div>
        );

      case "file":
        return (
          <div key={field.fieldName} className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleInputChange(field.fieldName, file);
                }
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${
                hasError
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {hasError}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return { status: "expired", color: "red", text: "Expired" };
    if (diffDays <= 3)
      return {
        status: "urgent",
        color: "orange",
        text: `${diffDays} days left`,
      };
    if (diffDays <= 7)
      return { status: "soon", color: "yellow", text: `${diffDays} days left` };
    return { status: "normal", color: "green", text: `${diffDays} days left` };
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        if (id) fetchJob(id as string);
      } else {
        router.push("/");
      }
    });
    return () => unsub();
  }, [id]);

  const DetailSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Jobs
        </button>

        {loading ? (
          <DetailSkeleton />
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-700 font-bold text-lg mb-2">
                Something went wrong
              </p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={() => id && fetchJob(id as string)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : !job ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-12 max-w-lg mx-auto shadow-sm border border-gray-200">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">🔍</span>
              </div>
              <p className="text-2xl text-gray-800 font-bold mb-3">
                Job not found
              </p>
              <p className="text-gray-500 text-base mb-6">
                The job you're looking for doesn't exist or has been removed.
              </p>
              <button
                onClick={() => router.back()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-indigo-600 p-4 md:p-8 text-white">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-5 h-5 shrink-0" />
                      <h1 className="text-lg md:text-2xl font-bold leading-tight">
                        {job.company}
                      </h1>
                    </div>

                    <div className="flex items-center gap-2 text-indigo-100 text-lg">
                      <Briefcase className="w-5 h-5 shrink-0" />
                      <p className="font-semibold leading-tight">{job.role}</p>
                    </div>
                  </div>

                  {(() => {
                    const deadlineStatus = getDeadlineStatus(job.deadline);
                    return (
                      deadlineStatus && (
                        <div
                          className={`px-4 hidden md:block py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                            deadlineStatus.color === "red"
                              ? "bg-red-700 text-white"
                              : deadlineStatus.color === "orange"
                              ? "bg-orange-500 text-white"
                              : deadlineStatus.color === "yellow"
                              ? "bg-yellow-500 text-black"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {deadlineStatus.text}
                        </div>
                      )
                    );
                  })()}
                </div>

                <div className="flex-1 md:flex space-y-2 md:space-y-0 flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>
                      Deadline:{" "}
                      {job.deadline
                        ? new Date(job.deadline).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "No deadline"}
                    </span>
                  </div>
                  {job.studentsApplied && job.studentsApplied.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span>{job.studentsApplied.length} applicants</span>
                    </div>
                  )}
                </div>
                {(() => {
                  const deadlineStatus = getDeadlineStatus(job.deadline);
                  return (
                    deadlineStatus && (
                      <div
                        className={`px-4 w-fit mt-3 md:hidden py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                          deadlineStatus.color === "red"
                            ? "bg-red-700 text-white"
                            : deadlineStatus.color === "orange"
                            ? "bg-orange-500 text-white"
                            : deadlineStatus.color === "yellow"
                            ? "bg-yellow-500 text-black"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {deadlineStatus.text}
                      </div>
                    )
                  );
                })()}
              </div>

              <div className="p-4 md:p-8">
                {job.postedAt && (
                  <div className="mb-6 flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      Posted on{" "}
                      {new Date(job.postedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}

                {job.extraFields && job.extraFields.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Job Highlights
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      {job.extraFields.map((field, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-700 text-sm">
                              {field.fieldName}
                            </span>
                            <span className="text-indigo-600 font-bold text-sm">
                              {field.fieldValue.startsWith(
                                "https://res.cloudinary.com"
                              ) ? (
                                <a
                                  href={field.fieldValue}
                                  target="_blank"
                                  className="flex items-center gap-1 hover:underline"
                                >
                                  View PDF
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                field.fieldValue
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Job Description
                  </h2>
                  <div className="bg-gray-50 border h-70 overflow-auto border-gray-200 rounded-xl p-4 md:p-6">
                    <div
                      className="text-gray-700 leading-relaxed prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: job.description }}
                    />
                  </div>
                </div>

                {job.eligibility && job.eligibility.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Eligibility Criteria
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <ul className="space-y-2">
                        {job.eligibility.map((criterion, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{criterion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {job.jobDescriptionPdf && (
                  <div className="mb-8">
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">
                              Detailed Job Description
                            </h3>
                            <p className="text-gray-600 text-sm">
                              Download the complete job description
                            </p>
                          </div>
                        </div>
                        <a
                          href={job.jobDescriptionPdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {job.inputFields &&
                  job.inputFields.length > 0 &&
                  !applied &&
                  !isStudentApplied && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Application Form
                      </h3>
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        {job.inputFields.map((field) =>
                          renderInputField(field)
                        )}
                      </div>
                    </div>
                  )}

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  {job.linkToApply && (
                    <>
                      <button
                        onClick={handleNotInterested}
                        className={`flex-1 bg-gray-500 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
                          isStudentApplied ||
                          applied ||
                          getDeadlineStatus(job.deadline)?.status === "expired"
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-600"
                        }`}
                        disabled={
                          applying ||
                          applied ||
                          isStudentApplied ||
                          getDeadlineStatus(job.deadline)?.status === "expired"
                        }
                      >
                        Not Interested
                      </button>
                      <button
                        onClick={handleApplyOnCompany}
                        className={`flex-1 bg-green-500 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                          isStudentApplied ||
                          applied ||
                          getDeadlineStatus(job.deadline)?.status === "expired"
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-green-600"
                        }`}
                        disabled={
                          applying ||
                          applied ||
                          isStudentApplied ||
                          getDeadlineStatus(job.deadline)?.status === "expired"
                        }
                      >
                        Apply on Company Website
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleApply}
                    disabled={
                      applying ||
                      applied ||
                      isStudentApplied ||
                      getDeadlineStatus(job.deadline)?.status === "expired"
                    }
                    className={`flex-1 bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                      isStudentApplied ||
                      applied ||
                      getDeadlineStatus(job.deadline)?.status === "expired"
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-indigo-700"
                    }`}
                  >
                    {isStudentApplied || applied ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {applying ? "Submitting..." : "Application Submitted"}
                      </>
                    ) : getDeadlineStatus(job.deadline)?.status ===
                      "expired" ? (
                      "Expired"
                    ) : (
                      "Applied on Portal?"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
