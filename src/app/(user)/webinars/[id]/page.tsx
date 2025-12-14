"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/footer-login/page";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirebaseToken } from "@/utils";
import {
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Timer,
  Globe,
  Link as LinkIcon,
} from "lucide-react";

export default function WebinarDetails() {
  interface Webinar {
    _id?: string;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    mode: string;
    link: string;
    studentsApplied?: string[];
  }

  const { id } = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  const fetchWebinar = async (webinarId: string) => {
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/webinar/${webinarId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to fetch webinar details.");
      setWebinar(data.webinar);

      if (data.webinar.studentsApplied?.includes(currentUser?.email)) {
        setRegistered(true);
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

  const [isStudentRegistered, setIsStudentRegistered] = useState(false);
  useEffect(() => {
    const checkRegistration = () => {
      if (!currentUser?.email || !webinar) return false;
      setIsStudentRegistered(
        webinar.studentsApplied?.includes(currentUser?.email) || false
      );
    };
    checkRegistration();
  }, [webinar, currentUser]);

  const handleRegister = async () => {
    if (!currentUser?.email || !id) return;

    setRegistering(true);
    try {
      const token = await getFirebaseToken();

      const res = await fetch(`/api/webinar/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: currentUser.email }),
      });

      if (!res.ok) throw new Error("Failed to register for webinar.");

      setRegistered(true);
      setIsStudentRegistered(true);
    } catch (err) {
      console.error(err);
      alert("There was a problem registering for the webinar.");
    } finally {
      setRegistering(false);
    }
  };

  const handleWithdraw = async () => {
    if (!currentUser?.email || !id) return;

    if (!confirm("Are you sure you want to withdraw your registration?")) {
      return;
    }

    try {
      const token = await getFirebaseToken();

      const res = await fetch(`/api/webinar/${id}?email=${currentUser.email}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to withdraw registration.");

      setRegistered(false);
      setIsStudentRegistered(false);
      if (id) fetchWebinar(id as string);
    } catch (err) {
      console.error(err);
      alert("There was a problem withdrawing your registration.");
    }
  };

  const getWebinarStatus = (date: string) => {
    if (!date) return null;
    const webinarDate = new Date(date);
    const today = new Date();
    const diffTime = webinarDate.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return { status: "completed", color: "gray", text: "Completed" };
    if (diffDays === 0)
      return { status: "today", color: "red", text: "Today!" };
    if (diffDays <= 3)
      return {
        status: "upcoming",
        color: "orange",
        text: `In ${diffDays} days`,
      };
    if (diffDays <= 7)
      return { status: "soon", color: "yellow", text: `In ${diffDays} days` };
    return { status: "normal", color: "green", text: `In ${diffDays} days` };
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        if (id) fetchWebinar(id as string);
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
            Back to Webinars
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
                  onClick={() => id && fetchWebinar(id as string)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : !webinar ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl p-12 max-w-lg mx-auto shadow-sm border border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">🔍</span>
                </div>
                <p className="text-2xl text-gray-800 font-bold mb-3">
                  Webinar not found
                </p>
                <p className="text-gray-500 text-base mb-6">
                  The webinar you're looking for doesn't exist or has been
                  removed.
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
                        <Video className="w-5 h-5" />
                        <h1 className="text-lg md:text-2xl font-bold leading-tight">
                          {webinar.title}
                        </h1>
                      </div>
                      <div className="flex items-center gap-2 text-indigo-100 text-lg">
                        <Globe className="w-5 h-5" />
                        <p className="font-semibold">{webinar.mode}</p>
                      </div>
                    </div>
                    {(() => {
                      const status = getWebinarStatus(webinar.date);
                      return (
                        status && (
                          <div
                            className={`px-4 hidden md:block py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                              status.color === "gray"
                                ? "bg-gray-700 text-white"
                                : status.color === "red"
                                ? "bg-red-700 text-white"
                                : status.color === "orange"
                                ? "bg-orange-500 text-white"
                                : status.color === "yellow"
                                ? "bg-yellow-500 text-black"
                                : "bg-green-500 text-white"
                            }`}
                          >
                            {status.text}
                          </div>
                        )
                      );
                    })()}
                  </div>

                  <div className="flex-1 md:flex space-y-2 md:space-y-0 flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>
                        {webinar.date
                          ? new Date(webinar.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "TBA"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{webinar.time || "TBA"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5" />
                      <span>{webinar.duration || "TBA"}</span>
                    </div>
                    {webinar.studentsApplied &&
                      webinar.studentsApplied.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          <span>
                            {webinar.studentsApplied.length} registered
                          </span>
                        </div>
                      )}
                        </div>
                        {(() => {
                      const status = getWebinarStatus(webinar.date);
                      return (
                        status && (
                          <div
                            className={`px-4 md:hidden mt-3 w-fit py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                              status.color === "gray"
                                ? "bg-gray-700 text-white"
                                : status.color === "red"
                                ? "bg-red-700 text-white"
                                : status.color === "orange"
                                ? "bg-orange-500 text-white"
                                : status.color === "yellow"
                                ? "bg-yellow-500 text-black"
                                : "bg-green-500 text-white"
                            }`}
                          >
                            {status.text}
                          </div>
                        )
                      );
                    })()}
                </div>

                <div className="p-4 md:p-8">
                  {webinar.description && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">
                        About This Webinar
                      </h2>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                        <div
                          className="text-gray-700 h-70 overflow-auto leading-relaxed prose max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: webinar.description,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {webinar.link && isStudentRegistered && (
                    <div className="mb-8">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <LinkIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800">
                                Join the Webinar
                              </h3>
                              <p className="text-gray-600 text-sm">
                                Click below to access the webinar link
                              </p>
                            </div>
                          </div>
                          <a
                            href={webinar.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg"
                          >
                            Join Now
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {!isStudentRegistered && !registered ? (
                      <button
                        onClick={handleRegister}
                        disabled={
                          registering ||
                          getWebinarStatus(webinar.date)?.status === "completed"
                        }
                        className={`flex-1 bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                          registering ||
                          getWebinarStatus(webinar.date)?.status === "completed"
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-indigo-700"
                        }`}
                      >
                        {registering ? (
                          <>Registering...</>
                        ) : getWebinarStatus(webinar.date)?.status ===
                          "completed" ? (
                          "Webinar Completed"
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Register for Webinar
                          </>
                        )}
                      </button>
                    ) : (
                      <>
                        <div className="flex-1 bg-green-50 border-2 border-green-300 text-green-700 px-6 py-3.5 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Registered Successfully
                        </div>
                        <button
                          onClick={handleWithdraw}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          Withdraw Registration
                        </button>
                      </>
                    )}
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
