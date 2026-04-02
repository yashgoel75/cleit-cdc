"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Footer from "@/components/footer-login/page";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getFirebaseToken } from "@/utils";
import { ChevronDown, ChevronUp, CheckCircle, Circle, ExternalLink, Trophy } from "lucide-react";
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
      setDsaProgress(data.dsaProgress || []);
    } catch (error) {
      console.error("Error fetching DSA progress:", error);
    } finally {
      setLoading(false);
    }
  }

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

          {/* Topics List */}
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
        </div>
      </main>
      <Footer />
    </>
  );
}
