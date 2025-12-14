"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Footer from "@/components/footer-login/page";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirebaseToken } from "@/index";
import {
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  ExternalLink,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Job {
  _id: string;
  company: string;
  role: string;
  location: string;
  description: string;
  studentsApplied?: any[];
  deadline?: string;
}

interface Test {
  _id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  studentsApplied?: string[];
}

interface Webinar {
  _id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  studentsApplied?: string[];
}

interface UserProfile {
  name: string;
  jobs?: { jobId: string }[];
  tests?: { testId: string }[];
  webinars?: { webinarId: string }[];
}

export default function Dashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setCurrentUser(user);
        getUserData(user.email);
      } else {
        setCurrentUser(null);
        setUserData(null);
        setLoading(false);
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  async function getUserData(email: string) {
    try {
      const token = await getFirebaseToken();
      const res = await axios.get(`/api/user?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = res.data.user;
      setUserData(user);

      if (user.jobs?.length) {
        const jobRes = await axios.post(
          "/api/jobs",
          { jobIds: user.jobs.map((j: any) => j.jobId) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setJobs(jobRes.data.jobs);
      }

      if (user.tests?.length) {
        const testRes = await axios.post(
          "/api/tests",
          { testIds: user.tests.map((t: any) => t.testId) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTests(testRes.data.tests);
      }

      if (user.webinars?.length) {
        const webinarRes = await axios.post(
          "/api/webinar",
          { webinarIds: user.webinars.map((w: any) => w.webinarId) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWebinars(webinarRes.data.webinars);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
          <div className="mb-10">
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-bold md:text-4xl text-slate-900">
                Welcome back,&nbsp;<span className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {userData?.name}
              </span>
              </h1>
              
            </div>
            <p className="text-slate-500 mt-2 text-sm">
              Track your applications and upcoming events
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <div className="group relative overflow-hidden bg-white rounded-3xl p-4 md:p-6 border border-slate-200/60 hover:border-indigo-200 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-100/50">
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">
                    Jobs Applied
                  </p>
                  <p className="text-4xl font-semibold text-slate-900">
                    {jobs.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white rounded-3xl p-4 md:p-6 border border-slate-200/60 hover:border-violet-200 transition-all duration-500 hover:shadow-xl hover:shadow-violet-100/50">
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">
                    Tests Applied
                  </p>
                  <p className="text-4xl font-semibold text-slate-900">
                    {tests.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white rounded-3xl p-4 md:p-6 border border-slate-200/60 hover:border-fuchsia-200 transition-all duration-500 hover:shadow-xl hover:shadow-fuchsia-100/50">
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">
                    Webinars Registered
                  </p>
                  <p className="text-4xl font-semibold text-slate-900">
                    {webinars.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Applied Jobs
              </h2>
            </div>
            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {jobs.map((job) => {
                  const deadlineStatus = job.deadline
                    ? (() => {
                        const now = new Date();
                        const deadlineDate = new Date(job.deadline);
                        const diffDays =
                          (deadlineDate.getTime() - now.getTime()) /
                          (1000 * 60 * 60 * 24);
                        if (diffDays < 0)
                          return {
                            text: "Expired",
                            color: "red",
                            icon: AlertCircle,
                          };
                        if (diffDays < 3)
                          return {
                            text: "Closing Soon",
                            color: "orange",
                            icon: Clock,
                          };
                        if (diffDays < 7)
                          return {
                            text: "Ending Soon",
                            color: "yellow",
                            icon: Clock,
                          };
                        return {
                          text: "Open",
                          color: "green",
                          icon: CheckCircle2,
                        };
                      })()
                    : null;

                  return (
                    <div
                      key={job._id}
                      className="group bg-white rounded-3xl border border-slate-200/60 hover:border-indigo-200 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-100/50 overflow-hidden flex flex-col"
                    >
                      <div className="p-6 border-b border-slate-100">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                                <Building2 className="w-5 h-5 text-white" />
                              </div>
                              <h3 className="text-lg font-semibold text-slate-900 truncate">
                                {job.company}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 ml-13">
                              <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              <p className="text-sm font-medium text-slate-600 truncate">
                                {job.role}
                              </p>
                            </div>
                          </div>
                          {deadlineStatus && (
                            <div
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                                deadlineStatus.color === "red"
                                  ? "bg-red-50 text-red-700"
                                  : deadlineStatus.color === "orange"
                                  ? "bg-orange-50 text-orange-700"
                                  : deadlineStatus.color === "yellow"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              <deadlineStatus.icon className="w-3.5 h-3.5" />
                              {deadlineStatus.text}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2.5 text-sm text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>
                              {job.deadline
                                ? new Date(job.deadline).toLocaleDateString()
                                : "No deadline"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex-1 mb-4">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div
                              className="text-sm text-slate-600 leading-relaxed line-clamp-3"
                              dangerouslySetInnerHTML={{
                                __html: job.description,
                              }}
                            />
                          </div>
                        </div>
                        {job.studentsApplied &&
                          job.studentsApplied.length > 0 && (
                            <div className="flex items-center gap-2 text-xs font-medium text-indigo-700 bg-indigo-50 px-3 py-2 rounded-xl mb-4">
                              <Users className="w-4 h-4" />
                              <span>
                                {job.studentsApplied.length} applicant
                                {job.studentsApplied.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                        <button
                          onClick={() => router.push(`/jobs/${job._id}`)}
                          className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 group/btn"
                        >
                          <span>View Details</span>
                          <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              "You have not applied for any jobs."
            )}
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-violet-500 to-violet-600 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Applied Tests
              </h2>
            </div>
            {tests.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {tests.map((test) => (
                  <div
                    key={test._id}
                    className="group bg-white rounded-3xl border border-slate-200/60 hover:border-violet-200 transition-all duration-500 hover:shadow-xl hover:shadow-violet-100/50 p-6 flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 truncate flex-1">
                        {test.title}
                      </h3>
                    </div>
                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-center gap-2.5 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>
                          {test.date} at {test.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{test.duration}</span>
                      </div>
                    </div>
                    {test.studentsApplied!.length > 0 && (
                      <div className="flex items-center gap-2 text-xs font-medium text-violet-700 bg-violet-50 px-3 py-2 rounded-xl mb-4">
                        <Users className="w-4 h-4" />
                        <span>
                          {test.studentsApplied?.length} applicant
                          {test.studentsApplied?.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => router.push(`/tests/${test._id}`)}
                      className="w-full bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white font-medium py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 group/btn mt-auto"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              "You have not applied for any tests."
            )}
          </div>

          
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-fuchsia-500 to-fuchsia-600 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Registered Webinars
              </h2>
            </div>
            {webinars.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {webinars.map((webinar) => (
                  <div
                    key={webinar._id}
                    className="group bg-white rounded-3xl border border-slate-200/60 hover:border-fuchsia-200 transition-all duration-500 hover:shadow-xl hover:shadow-fuchsia-100/50 p-6 flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 truncate flex-1">
                        {webinar.title}
                      </h3>
                    </div>
                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-center gap-2.5 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>
                          {webinar.date} at {webinar.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{webinar.duration}</span>
                      </div>
                    </div>
                    {webinar.studentsApplied!.length > 0 && (
                      <div className="flex items-center gap-2 text-xs font-medium text-fuchsia-700 bg-fuchsia-50 px-3 py-2 rounded-xl mb-4">
                        <Users className="w-4 h-4" />
                        <span>
                          {webinar.studentsApplied?.length} attendee
                          {webinar.studentsApplied?.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => router.push(`/webinars/${webinar._id}`)}
                      className="w-full bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 hover:from-fuchsia-600 hover:to-fuchsia-700 text-white font-medium py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-500/30 hover:shadow-xl hover:shadow-fuchsia-500/40 group/btn mt-auto"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              "You have not registered for any webinars."
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
