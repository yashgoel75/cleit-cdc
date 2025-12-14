"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getFirebaseToken } from "@/utils";

import Footer from "@/components/footer-login/page";
import {
  Search,
  Grid3x3,
  List,
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  ExternalLink,
  Clock,
  Users,
} from "lucide-react";

export default function StudentJobs() {
  interface Job {
    _id?: string;
    company: string;
    role: string;
    location: string;
    description: string;
    deadline: string;
    linkToApply: string;
    studentsApplied?: string[];
    extraFields?: { fieldName: string; fieldValue: string }[];
  }

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [applyingJob, setApplyingJob] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobile, setIsMobile] = useState<Boolean | null>(null);
  const [deregisteringJob, setDeregisteringJob] = useState<string | null>(null);

  const router = useRouter();

  const fetchJobs = async () => {
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch jobs");
      setJobs(data.jobs);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!currentUser?.email) return;
    setApplyingJob(jobId);
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: currentUser.email, action: "register" }),
      });
      if (!res.ok) throw new Error("Failed to apply");

      const userEmail = currentUser.email;
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job._id === jobId
            ? {
                ...job,
                studentsApplied: [...(job.studentsApplied || []), userEmail],
              }
            : job
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to apply. Please try again.");
    } finally {
      setApplyingJob(null);
    }
  };

  const handleDeregister = async (jobId: string) => {
    if (!currentUser?.email) return;
    setDeregisteringJob(jobId);
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: currentUser.email,
          action: "deregister",
        }),
      });
      if (!res.ok) throw new Error("Failed to apply");

      const userEmail = currentUser.email;
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job._id === jobId
            ? {
                ...job,
                studentsApplied: (job.studentsApplied || []).filter(
                  (email) => email !== userEmail
                ),
              }
            : job
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to apply. Please try again.");
    } finally {
      setDeregisteringJob(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      locationFilter === "" ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const uniqueLocations = [...new Set(jobs.map((job) => job.location))];

  const isAlreadyApplied = (job: Job) => {
    return job.studentsApplied?.includes(currentUser?.email || "") || false;
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
        fetchJobs();
      } else {
        router.push("/");
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const JobCardSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </div>
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded-xl"></div>
    </div>
  );

  return (
    <>
      <main className="min-h-screen p-2 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Career Opportunities
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  Discover amazing job opportunities from top companies
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
                  <span className="text-sm font-semibold text-indigo-600">
                    {jobs.length}
                  </span>
                  <span className="text-sm text-gray-600 ml-1">
                    opportunities
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by company, role, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-5 py-3.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-red-700 font-bold text-lg mb-2">
                  Something went wrong
                </p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                  onClick={fetchJobs}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl p-12 max-w-lg mx-auto shadow-sm border border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">🔍</span>
                </div>
                <p className="text-2xl text-gray-800 font-bold mb-3">
                  {searchTerm || locationFilter
                    ? "No matches found"
                    : "No jobs available"}
                </p>
                <p className="text-gray-500 text-base mb-6">
                  {searchTerm || locationFilter
                    ? "Try adjusting your search criteria"
                    : "Check back soon for new opportunities!"}
                </p>
                {(searchTerm || locationFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setLocationFilter("");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600 text-sm">
                  Showing{" "}
                  <span className="font-semibold text-indigo-600">
                    {filteredJobs.length}
                  </span>
                  {filteredJobs.length !== jobs.length && (
                    <span>
                      {" "}
                      of <span className="font-semibold">{jobs.length}</span>
                    </span>
                  )}{" "}
                  job{jobs.length !== 1 ? "s" : ""}
                </p>
              </div>

              <section
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {filteredJobs.map((job) => {
                  const deadlineStatus = getDeadlineStatus(job.deadline);
                  const alreadyApplied = isAlreadyApplied(job);

                  return viewMode === "grid" ? (
                    <div
                      key={job._id}
                      className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col h-full overflow-hidden"
                    >
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                              <h3 className="text-lg font-bold text-gray-900 truncate">
                                {job.company}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <p className="font-semibold text-gray-700 truncate">
                                {job.role}
                              </p>
                            </div>
                          </div>
                          {deadlineStatus && (
                            <div
                              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ml-3 flex-shrink-0 ${
                                deadlineStatus.color === "red"
                                  ? "bg-red-100 text-red-700"
                                  : deadlineStatus.color === "orange"
                                  ? "bg-orange-100 text-orange-700"
                                  : deadlineStatus.color === "yellow"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {deadlineStatus.text}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {job.deadline
                                ? new Date(job.deadline).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )
                                : "No deadline"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        {job.extraFields && job.extraFields.length > 0 && (
                          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 mb-4">
                            <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                              Highlights
                            </h4>
                            <div className="space-y-2">
                              {job.extraFields.map((field, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <span className="font-medium text-gray-600">
                                    {field.fieldName}:
                                  </span>
                                  <span className="text-indigo-600 font-semibold">
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
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex-1 mb-4">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div
                              className="text-sm text-gray-600 leading-relaxed line-clamp-3"
                              dangerouslySetInnerHTML={{
                                __html: job.description,
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-3 mt-auto">
                          {job.studentsApplied &&
                            job.studentsApplied.length > 0 && (
                              <div className="flex items-center justify-center gap-2 text-xs text-orange-700 bg-orange-50 py-2 rounded-lg">
                                <Users className="w-4 h-4" />
                                <span className="font-semibold">
                                  {job.studentsApplied.length} student
                                  {job.studentsApplied.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                  applied
                                </span>
                              </div>
                            )}
                          <button
                            onClick={() => router.push(`/jobs/${job._id}`)}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                          >
                            View Details
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={job._id}
                      className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Building2 className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {job.company}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Briefcase className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                  <p className="font-semibold text-gray-700 text-lg">
                                    {job.role}
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                    <span>{job.location}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                    <span>
                                      {job.deadline
                                        ? new Date(
                                            job.deadline
                                          ).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                          })
                                        : "No deadline"}
                                    </span>
                                  </div>
                                  {job.studentsApplied &&
                                    job.studentsApplied.length > 0 && (
                                      <div className="flex items-center gap-2 text-orange-700">
                                        <Users className="w-4 h-4" />
                                        <span className="font-semibold">
                                          {job.studentsApplied.length} applied
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </div>
                              {deadlineStatus && (
                                <div
                                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                                    deadlineStatus.color === "red"
                                      ? "bg-red-100 text-red-700"
                                      : deadlineStatus.color === "orange"
                                      ? "bg-orange-100 text-orange-700"
                                      : deadlineStatus.color === "yellow"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {deadlineStatus.text}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="flex-1">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                  {job.description && (
                                    <div
                                      className="text-sm text-gray-600 leading-relaxed line-clamp-2"
                                      dangerouslySetInnerHTML={{
                                        __html: job.description,
                                      }}
                                    />
                                  )}
                                </div>
                                {job.extraFields &&
                                  job.extraFields.length > 0 && (
                                    <div className="mt-2 w-full bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100">
                                      <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                        Highlights
                                      </h4>
                                      <div className="space-y-2">
                                        {job.extraFields.map((field, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between text-sm"
                                          >
                                            <span className="font-medium text-gray-600">
                                              {field.fieldName}:
                                            </span>
                                            <span className="text-indigo-600 font-semibold">
                                              {field.fieldValue.startsWith(
                                                "https://res.cloudinary.com"
                                              ) ? (
                                                <a
                                                  href={field.fieldValue}
                                                  target="_blank"
                                                  className="flex items-center gap-1 hover:underline"
                                                >
                                                  PDF
                                                  <ExternalLink className="w-3 h-3" />
                                                </a>
                                              ) : (
                                                field.fieldValue
                                              )}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                            <div className="md:w-40 flex-shrink-0">
                              <button
                                onClick={() => router.push(`/jobs/${job._id}`)}
                                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg mt-5 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                              >
                                View Details
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
