"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Footer from "@/components/footer-login/page";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getFirebaseToken } from "@/utils";
import { ChevronDown, ChevronUp, CheckCircle, Circle, ExternalLink, Trophy, Users, Sparkles, Loader2, Award } from "lucide-react";
import dsaData from "@/data/dsaSheet.json";

interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  link: string;
}

interface Topic {
  id: string;
  name: string;
  explanation: string[];
  problems: Problem[];
}

export default function DSASheet() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dsaProgress, setDsaProgress] = useState<string[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Leaderboard states
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"sheet" | "leaderboard">("sheet");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [updatingLeaderboardStatus, setUpdatingLeaderboardStatus] = useState(false);

  const topics: Topic[] = dsaData.topics as Topic[];
  const totalProblems = topics.reduce((acc, topic) => acc + topic.problems.length, 0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setCurrentUser(user);
        getUserProgress(user.email);
      } else {
        setCurrentUser(null);
        setLoading(false);
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  async function getUserProgress(email: string) {
    try {
      const token = await getFirebaseToken();
      const res = await axios.get(`/api/user?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.user;
      setUserData(data);
      setDsaProgress(data.dsaProgress || []);
    } catch (error) {
      console.error("Error fetching DSA progress:", error);
    } finally {
      setLoading(false);
    }
  }

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const token = await getFirebaseToken();
      const res = await axios.get("/api/user/dsa/leaderboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaderboard(res.data.leaderboard || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    if (activeTab === "leaderboard") {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const handleToggleLeaderboard = async (participate: boolean) => {
    if (!currentUser?.email) return;
    setUpdatingLeaderboardStatus(true);
    try {
      const token = await getFirebaseToken();
      const res = await axios.patch(
        "/api/user",
        {
          email: currentUser.email,
          updates: { participateLeaderboard: participate },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedUser = res.data.user;
      setUserData(updatedUser);
      if (activeTab === "leaderboard") {
        fetchLeaderboard();
      }
    } catch (error) {
      console.error("Error updating leaderboard participation:", error);
    } finally {
      setUpdatingLeaderboardStatus(false);
    }
  };

  const toggleProblem = async (problemId: string, currentlyCompleted: boolean) => {
    if (!currentUser?.email) return;

    // Optimistic UI update
    setDsaProgress((prev) => 
      currentlyCompleted 
        ? prev.filter((id) => id !== problemId)
        : [...prev, problemId]
    );

    try {
      const token = await getFirebaseToken();
      await axios.post(
        "/api/user/dsa",
        {
          email: currentUser.email,
          problemId,
          completed: !currentlyCompleted, // toggle
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Error updating problem status", error);
      // Revert on error
      setDsaProgress((prev) => 
        currentlyCompleted 
          ? [...prev, problemId]
          : prev.filter((id) => id !== problemId)
      );
    }
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "Medium": return "text-amber-600 bg-amber-50 border-amber-200";
      case "Hard": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const progressPercentage = totalProblems > 0 ? Math.round((dsaProgress.length / totalProblems) * 100) : 0;

  return (
    <>
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
          
          {/* Header & Progress */}
          <div className="mb-10 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-indigo-600" />
                {dsaData.sheetName}
              </h1>
              <p className="mt-3 text-slate-600 text-lg">
                {dsaData.description}
              </p>
            </div>
            
            <div className="w-full md:w-auto min-w-[300px] bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Your Progress</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {dsaProgress.length} / {totalProblems}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 mb-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-3 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-right text-xs font-medium text-slate-500">{progressPercentage}% Completed</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 mb-8 gap-6">
            <button
              onClick={() => setActiveTab("sheet")}
              className={`pb-4 text-lg font-bold border-b-2 transition-all duration-200 flex items-center gap-2 ${
                activeTab === "sheet"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Trophy className="w-5 h-5" />
              DSA Sheet
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`pb-4 text-lg font-bold border-b-2 transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === "leaderboard"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Users className="w-5 h-5" />
              Leaderboard
              {leaderboard.length > 0 && (
                <span className="ml-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                  {leaderboard.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === "sheet" ? (
            /* Topics List */
            <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200"></div>
                  ))}
                </div>
              ) : (
                topics.map((topic, index) => {
                  const isExpanded = expandedTopics[topic.id] || false;
                  const solvedInTopic = topic.problems.filter(p => dsaProgress.includes(p.id)).length;
                  const totalInTopic = topic.problems.length;
                  
                  return (
                    <div key={topic.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:border-indigo-200">
                      <button 
                        onClick={() => toggleTopic(topic.id)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-visible:bg-slate-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{topic.name}</h3>
                            <p className="text-sm text-slate-500 mt-1 font-medium">{solvedInTopic} / {totalInTopic} Solved</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {isExpanded ? <ChevronUp className="w-6 h-6 text-slate-400" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/50 p-6 leading-relaxed">
                          <div className="text-slate-700 mb-6 bg-indigo-50/50 p-5 rounded-xl border border-indigo-100/50 text-sm">
                            {topic.explanation.map((paragraph, i) => (
                              <p key={i} className="mb-3 last:mb-0">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                          
                          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 font-semibold uppercase tracking-wider">
                                    <th className="py-3 px-4 w-16 text-center">Status</th>
                                    <th className="py-3 px-4">Problem</th>
                                    <th className="py-3 px-4 w-32 text-center">Difficulty</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {topic.problems.map((problem, pIdx) => {
                                    const isSolved = dsaProgress.includes(problem.id);
                                    return (
                                      <tr key={problem.id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${isSolved ? 'bg-emerald-50/30' : ''}`}>
                                        <td className="py-3 px-4 text-center align-middle">
                                          <button 
                                            onClick={() => toggleProblem(problem.id, isSolved)}
                                            className="focus:outline-none transition-transform hover:scale-110 active:scale-95 flex items-center justify-center w-full"
                                          >
                                            {isSolved ? (
                                              <CheckCircle className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                                            ) : (
                                              <Circle className="w-6 h-6 text-slate-300 hover:text-indigo-400" />
                                            )}
                                          </button>
                                        </td>
                                        <td className="py-3 px-4 align-middle">
                                          <a 
                                            href={problem.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={`font-semibold text-base transition-colors flex items-center gap-2 group ${isSolved ? 'text-slate-500' : 'text-indigo-600 hover:text-indigo-800'}`}
                                          >
                                            {problem.title}
                                            <ExternalLink className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isSolved ? 'text-slate-400' : 'text-indigo-500'}`} />
                                          </a>
                                        </td>
                                        <td className="py-3 px-4 text-center align-middle">
                                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(problem.difficulty)}`}>
                                            {problem.difficulty}
                                          </span>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Leaderboard Tab */
            <div className="space-y-6">
              {/* Privacy/Participation Call-To-Action Card */}
              <div className={`p-6 md:p-8 rounded-3xl border transition-all duration-300 ${
                userData?.participateLeaderboard 
                  ? "bg-emerald-50/40 border-emerald-100" 
                  : "bg-gradient-to-br from-indigo-50/60 to-violet-50/30 border-indigo-100"
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className={`w-5 h-5 ${userData?.participateLeaderboard ? "text-emerald-600" : "text-indigo-600"}`} />
                      <h2 className="text-xl font-bold text-slate-900">
                        {userData?.participateLeaderboard 
                          ? "You are live on the Leaderboard!" 
                          : "Showcase Your Progress on the Leaderboard"}
                      </h2>
                    </div>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      {userData?.participateLeaderboard 
                        ? "Great job competing! Other students can now see your progress. You can opt out anytime using the button on the right." 
                        : "Compete with your peers and keep each other motivated! Opt-in to show your ranking. We will only share your name, graduation year, branch, and solved questions count."}
                    </p>
                    
                    {/* User profile preview details for transparency */}
                    {!userData?.participateLeaderboard && (
                      <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-500 border-t border-indigo-100/60">
                        <span>Name: <strong className="text-slate-700">{userData?.name || "Anonymous"}</strong></span>
                        <span>Branch: <strong className="text-slate-700">{userData?.department || "N/A"}</strong></span>
                        <span>Year: <strong className="text-slate-700">{userData?.batchStart && userData?.batchEnd ? `${userData.batchStart} - ${userData.batchEnd}` : "N/A"}</strong></span>
                        <span>Solved: <strong className="text-slate-700">{dsaProgress.length} Problems</strong></span>
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      disabled={updatingLeaderboardStatus}
                      onClick={() => handleToggleLeaderboard(!userData?.participateLeaderboard)}
                      className={`w-full md:w-auto px-6 py-3 rounded-xl font-semibold text-sm shadow-sm transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 whitespace-nowrap ${
                        userData?.participateLeaderboard
                          ? "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {updatingLeaderboardStatus ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : userData?.participateLeaderboard ? (
                        "Opt Out / Hide Progress"
                      ) : (
                        "Opt In & Join Leaderboard 🚀"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Leaderboard Table Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      Student Rankings
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Based on total questions solved from this DSA sheet</p>
                  </div>
                  <button 
                    onClick={fetchLeaderboard}
                    className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"
                    title="Refresh rankings"
                  >
                    <svg className={`w-4 h-4 ${loadingLeaderboard ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18" />
                    </svg>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  {loadingLeaderboard ? (
                    <div className="p-6 space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
                          <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
                          <div className="flex-1 h-6 bg-slate-100 rounded"></div>
                          <div className="w-20 h-6 bg-slate-100 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : leaderboard.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="inline-flex p-4 rounded-full bg-slate-50 text-slate-400 mb-3">
                        <Users className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">No participants yet</h3>
                      <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 leading-relaxed">
                        Be the first one to opt in and lead the scoreboard! Use the button above to participate.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-200 text-xs text-slate-600 font-bold uppercase tracking-wider">
                          <th className="py-4 px-6 w-20 text-center">Rank</th>
                          <th className="py-4 px-6">Name</th>
                          <th className="py-4 px-6">Branch</th>
                          <th className="py-4 px-6 text-center">Batch / Year</th>
                          <th className="py-4 px-6 text-right w-48">Problems Solved</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {leaderboard.map((student, idx) => {
                          const rank = idx + 1;
                          const isCurrentUser = student.collegeEmail === currentUser?.email;
                          
                          // Custom styles for top 3
                          let rankBadge = null;
                          if (rank === 1) {
                            rankBadge = (
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-sm shadow-sm" style={{ animationDuration: '3s' }} title="Gold Medalist">
                                🥇
                              </span>
                            );
                          } else if (rank === 2) {
                            rankBadge = (
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-sm shadow-sm" title="Silver Medalist">
                                🥈
                              </span>
                            );
                          } else if (rank === 3) {
                            rankBadge = (
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 border border-orange-200 text-orange-800 font-extrabold text-sm shadow-sm" title="Bronze Medalist">
                                🥉
                              </span>
                            );
                          } else {
                            rankBadge = (
                              <span className="inline-flex items-center justify-center w-8 h-8 text-slate-500 font-bold text-sm">
                                {rank}
                              </span>
                            );
                          }

                          // Initials for avatar
                          const initials = student.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2);

                          // Mini progress bar in row
                          const studentPercentage = totalProblems > 0 ? Math.round((student.solvedCount / totalProblems) * 100) : 0;

                          return (
                            <tr 
                              key={idx} 
                              className={`group hover:bg-slate-50 transition-colors duration-150 ${
                                isCurrentUser ? "bg-indigo-50/50 hover:bg-indigo-50/80 font-medium animate-pulse" : ""
                              }`}
                              style={isCurrentUser ? { animationIterationCount: 1, animationDuration: '1.5s' } : undefined}
                            >
                              <td className="py-4 px-6 text-center align-middle">
                                {rankBadge}
                              </td>
                              <td className="py-4 px-6 align-middle">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                                    isCurrentUser 
                                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                                      : "bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100"
                                  }`}>
                                    {initials || "?"}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm font-semibold ${isCurrentUser ? "text-indigo-900 font-bold" : "text-slate-900"}`}>
                                        {student.name}
                                      </span>
                                      {isCurrentUser && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white border border-indigo-700 shadow-sm uppercase tracking-wider">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-slate-400 block font-normal">{student.collegeEmail}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 align-middle text-sm text-slate-700">
                                {student.department || "N/A"}
                              </td>
                              <td className="py-4 px-6 align-middle text-center text-sm text-slate-600 font-medium">
                                {student.batchStart && student.batchEnd 
                                  ? `${student.batchStart} - ${student.batchEnd}` 
                                  : "N/A"}
                              </td>
                              <td className="py-4 px-6 align-middle text-right">
                                <div className="inline-flex flex-col items-end gap-1.5 w-full max-w-[140px]">
                                  <span className="text-sm font-bold text-slate-950">
                                    {student.solvedCount} / {totalProblems}
                                  </span>
                                  
                                  {/* Progress bar in row */}
                                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/30">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        rank === 1 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                                        rank === 2 ? "bg-slate-400" :
                                        rank === 3 ? "bg-orange-400" :
                                        "bg-indigo-500"
                                      }`}
                                      style={{ width: `${studentPercentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium">{studentPercentage}% done</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
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
