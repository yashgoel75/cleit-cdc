"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/footer-login/page";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirebaseToken } from "@/utils";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  ExternalLink,
  Timer,
  Award,
} from "lucide-react";

export default function TestDetails() {
  interface Test {
    _id?: string;
    title: string;
    description: string;
    date: string;
    deadline: string;
    duration: string;
    mode: string;
    link: string;
    pdfUrl: string;
    studentsApplied?: string[];
    extraFields?: { fieldName: string; fieldValue: string }[];
  }

  const { id } = useParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const fetchTest = async (testId: string) => {
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch test");
      setTest(data.test);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const [isStudentApplied, setIsStudentApplied] = useState(false);
  useEffect(() => {
    const isAlreadyApplied = () => {
      if (!currentUser?.email || !test) return false;
      setIsStudentApplied(
        test.studentsApplied?.includes(currentUser.email) || false
      );
    };
    isAlreadyApplied();
  }, [test, currentUser]);

  const handleApply = async () => {
    if (!currentUser?.email || !id) return;
    setApplying(true);
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/tests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: currentUser.email }),
      });
      if (!res.ok) throw new Error("Failed to apply");
      setIsStudentApplied(true);
    } catch (err) {
      console.error(err);
      alert("Failed to apply");
    } finally {
      setApplying(false);
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
    if (diffDays === 0)
      return { status: "today", color: "orange", text: "Today" };
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
        if (id) fetchTest(id as string);
      } else {
        router.push("/");
      }
    });
    return () => unsub();
  }, [id]);

  const DetailSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
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
    <>
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Tests
          </button>

          {loading ? (
            <DetailSkeleton />
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-white border border-red-200 rounded-2xl p-4 md:p-8 max-w-md mx-auto shadow-lg">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-700 font-bold text-lg mb-2">
                  Something went wrong
                </p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                  onClick={() => id && fetchTest(id as string)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : !test ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl p-12 max-w-lg mx-auto shadow-sm border border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">🔍</span>
                </div>
                <p className="text-2xl text-gray-800 font-bold mb-3">
                  Test not found
                </p>
                <p className="text-gray-500 text-base mb-6">
                  The test you're looking for doesn't exist or has been removed.
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
                      <div className="flex items-center gap-3 mb-3">
                        <Trophy className="w-5 h-5" />
                        <h1 className="text-lg md:text-2xl font-bold leading-tight">
                          {test.title}
                        </h1>
                      </div>
                      <div className="flex items-center gap-2 text-indigo-100 text-lg">
                        <Award className="w-5 h-5" />
                        <p className="font-semibold">{test.mode}</p>
                      </div>
                    </div>
                    {(() => {
                      const deadlineStatus = getDeadlineStatus(test.deadline);
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
                      <Calendar className="w-5 h-5" />
                      <span>
                        Date:{" "}
                        {test.date
                          ? new Date(test.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "TBA"}
                      </span>
                    </div>
                    {test.duration && (
                      <div className="flex items-center gap-2">
                        <Timer className="w-5 h-5" />
                        <span>Duration: {test.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>
                        Deadline:{" "}
                        {test.deadline
                          ? new Date(test.deadline).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "No deadline"}
                      </span>
                    </div>
                    {test.studentsApplied &&
                      test.studentsApplied.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          <span>{test.studentsApplied.length} applicants</span>
                        </div>
                      )}
                        </div>
                        {(() => {
                      const deadlineStatus = getDeadlineStatus(test.deadline);
                      return (
                        deadlineStatus && (
                          <div
                            className={`px-4 md:hidden mt-3 w-fit py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
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
                  {test.extraFields && test.extraFields.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Test Highlights
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        {test.extraFields.map((field, index) => (
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
                      Test Description
                    </h2>
                    <div className="bg-gray-50 border h-70 overflow-auto border-gray-200 rounded-xl p-4 md:p-6">
                      <div
                        className="text-gray-700 leading-relaxed prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: test.description }}
                      />
                    </div>
                  </div>

                  {test.pdfUrl && (
                    <div className="mb-8">
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
                        <div className="flex-1 md:flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                              <FileText className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800">
                                Detailed Test Information
                              </h3>
                              <p className="text-gray-600 text-sm">
                                Download the complete test details
                              </p>
                            </div>
                          </div>
                          <a
                            href={test.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex mt-4 md:mt-0 items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg"
                          >
                            <Download className="w-4 h-4" />
                            Download PDF
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {test.link && (
                      <a
                        href={test.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 bg-green-500 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                          isStudentApplied ||
                          getDeadlineStatus(test.deadline)?.status === "expired"
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-green-600"
                        }`}
                      >
                        Apply via Portal
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={handleApply}
                      disabled={
                        applying ||
                        isStudentApplied ||
                        getDeadlineStatus(test.deadline)?.status === "expired"
                      }
                      className={`flex-1 bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                        isStudentApplied ||
                        getDeadlineStatus(test.deadline)?.status === "expired"
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-indigo-700"
                      }`}
                    >
                      {isStudentApplied ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          {applying ? "Submitting..." : "Application Submitted"}
                        </>
                      ) : getDeadlineStatus(test.deadline)?.status ===
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
      <Footer />
    </>
  );
}
