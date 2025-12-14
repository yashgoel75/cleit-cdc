"use client";
import Footer from "@/components/footer-login/page";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getFirebaseToken } from "@/utils";
import {
  Search,
  Grid3x3,
  List,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Trophy,
  Timer,
  FileText,
} from "lucide-react";

export default function StudentTests() {
  interface Test {
    _id?: string;
    title: string;
    description: string;
    date: string;
    duration: string;
    mode: string;
    link: string;
    studentsApplied?: string[];
  }

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const router = useRouter();

  const fetchTests = async (email: string | null | undefined) => {
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/tests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch tests");
      setTests(data.tests);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (testId: string) => {
    if (!currentUser?.email) return;
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/tests/${testId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: currentUser.email }),
      });
      if (!res.ok) throw new Error("Failed to apply");
      alert("Applied successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to apply");
    }
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode =
      modeFilter === "" ||
      test.mode.toLowerCase().includes(modeFilter.toLowerCase());
    return matchesSearch && matchesMode;
  });

  const uniqueModes = [...new Set(tests.map((test) => test.mode))];

  const getDateStatus = (date: string) => {
    if (!date) return null;
    const testDate = new Date(date);
    const today = new Date();
    const diffTime = testDate.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: "past", color: "red", text: "Past" };
    if (diffDays === 0)
      return { status: "today", color: "orange", text: "Today" };
    if (diffDays <= 3)
      return {
        status: "soon",
        color: "yellow",
        text: `In ${diffDays} day${diffDays !== 1 ? "s" : ""}`,
      };
    if (diffDays <= 7)
      return {
        status: "upcoming",
        color: "green",
        text: `In ${diffDays} days`,
      };
    return {
      status: "scheduled",
      color: "blue",
      text: `In ${diffDays} days`,
    };
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchTests(user.email);
      } else {
        router.push("/");
      }
    });
    return () => unsub();
  }, []);

  const TestCardSkeleton = () => (
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
                  Tests and Hackathons
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  Take part in assessments and showcase your skills through our
                  comprehensive testing platform
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
                  <span className="text-sm font-semibold text-indigo-600">
                    {tests.length}
                  </span>
                  <span className="text-sm text-gray-600 ml-1">
                    assessment{tests.length !== 1 ? "s" : ""}
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
                  placeholder="Search by title or keywords..."
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
                <TestCardSkeleton key={i} />
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
                  onClick={() => fetchTests(currentUser?.email)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl p-12 max-w-lg mx-auto shadow-sm border border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">🔍</span>
                </div>
                <p className="text-2xl text-gray-800 font-bold mb-3">
                  {searchTerm || modeFilter
                    ? "No matches found"
                    : "No tests available"}
                </p>
                <p className="text-gray-500 text-base mb-6">
                  {searchTerm || modeFilter
                    ? "Try adjusting your search criteria"
                    : "Check back soon for new assessments!"}
                </p>
                {(searchTerm || modeFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setModeFilter("");
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
                    {filteredTests.length}
                  </span>
                  {filteredTests.length !== tests.length && (
                    <span>
                      {" "}
                      of <span className="font-semibold">{tests.length}</span>
                    </span>
                  )}{" "}
                  test{tests.length !== 1 ? "s" : ""}
                </p>
              </div>

              <section
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {filteredTests.map((test) => {
                  const dateStatus = getDateStatus(test.date);

                  return viewMode === "grid" ? (
                    <div
                      key={test._id}
                      className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col h-full overflow-hidden"
                    >
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Trophy className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                              <h3 className="text-lg font-bold text-gray-900 truncate">
                                {test.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <p className="font-semibold text-gray-700 truncate">
                                {test.mode}
                              </p>
                            </div>
                          </div>
                          {dateStatus && (
                            <div
                              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ml-3 flex-shrink-0 ${
                                dateStatus.color === "red"
                                  ? "bg-red-100 text-red-700"
                                  : dateStatus.color === "orange"
                                  ? "bg-orange-100 text-orange-700"
                                  : dateStatus.color === "yellow"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : dateStatus.color === "green"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {dateStatus.text}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {test.date
                                ? new Date(test.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )
                                : "No date"}
                            </span>
                          </div>
                          {test.duration && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Timer className="w-4 h-4 flex-shrink-0" />
                              <span>{test.duration}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex-1 mb-4">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div
                              className="text-sm text-gray-600 leading-relaxed line-clamp-3"
                              dangerouslySetInnerHTML={{
                                __html: test.description,
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-3 mt-auto">
                          {test.studentsApplied &&
                            test.studentsApplied.length > 0 && (
                              <div className="flex items-center justify-center gap-2 text-xs text-orange-700 bg-orange-50 py-2 rounded-lg">
                                <Users className="w-4 h-4" />
                                <span className="font-semibold">
                                  {test.studentsApplied.length} student
                                  {test.studentsApplied.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                  applied
                                </span>
                              </div>
                            )}
                          <button
                            onClick={() => router.push(`/tests/${test._id}`)}
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
                      key={test._id}
                      className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Trophy className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {test.title}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                  <p className="font-semibold text-gray-700 text-lg">
                                    {test.mode}
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                    <span>
                                      {test.date
                                        ? new Date(
                                            test.date
                                          ).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                          })
                                        : "No date"}
                                    </span>
                                  </div>
                                  {test.duration && (
                                    <div className="flex items-center gap-2">
                                      <Timer className="w-4 h-4 flex-shrink-0" />
                                      <span>{test.duration}</span>
                                    </div>
                                  )}
                                  {test.studentsApplied &&
                                    test.studentsApplied.length > 0 && (
                                      <div className="flex items-center gap-2 text-orange-700">
                                        <Users className="w-4 h-4" />
                                        <span className="font-semibold">
                                          {test.studentsApplied.length} applied
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </div>
                              {dateStatus && (
                                <div
                                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                                    dateStatus.color === "red"
                                      ? "bg-red-100 text-red-700"
                                      : dateStatus.color === "orange"
                                      ? "bg-orange-100 text-orange-700"
                                      : dateStatus.color === "yellow"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : dateStatus.color === "green"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {dateStatus.text}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="flex-1">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                  <div
                                    className="text-sm text-gray-600 leading-relaxed line-clamp-2"
                                    dangerouslySetInnerHTML={{
                                      __html: test.description,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="md:w-40 flex-shrink-0">
                              <button
                                onClick={() =>
                                  router.push(`/tests/${test._id}`)
                                }
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
