"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut,
  Menu,
  X,
  User as UserIcon,
  BriefcaseBusiness,
  NotepadText,
  Ticket,
  Home,
} from "lucide-react";
import logo from "../../assets/cleit.png";
import { getAuth, signOut, onAuthStateChanged, User } from "firebase/auth";
import "../page.css";

import { auth } from "../../lib/firebase";
import { useTheme } from "../context/theme";
import axios from "axios";
import { getFirebaseToken } from "@/index";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      try {
        const token = await getFirebaseToken();
        const res = await axios.get(`/api/user?email=${user.email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfileComplete(res.data?.user?.isProfileComplete ?? false);
      } catch (error) {
        console.error("Failed to fetch user details", error);
      } finally {
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;

    if (profileComplete === false && pathname !== "/account") {
      router.replace("/account");
    }
  }, [pathname, profileComplete, authChecked, router]);

  const menuItems = [
    { icon: Home, label: "Home", route: "/dashboard" },
    { icon: BriefcaseBusiness, label: "Jobs", route: "/jobs" },
    { icon: NotepadText, label: "Tests", route: "/tests" },
    { icon: Ticket, label: "Webinar", route: "/webinars" },
    { icon: UserIcon, label: "Account", route: "/account" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      localStorage.clear();
      router.replace("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div
      className={`min-h-screen max-h-screen flex inter-normal transition-colors ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 lg:w-[22%]
          border-r
          flex flex-col justify-between p-4 lg:p-8
          lg:mx-2 lg:my-2 lg:rounded-3xl shadow-sm
          transform transition-all duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }
        `}
      >
        <div>
          <button
            className={`lg:hidden absolute top-4 right-4 p-2 rounded-lg ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-10">
            <Image src={logo} width={140} alt="Cleit Logo" />
          </div>

          <p
            className={`text-xs font-semibold mb-4 uppercase tracking-wider transition-colors ${
              theme == "dark" ? "text-gray-500" : "text-gray-500"
            }`}
          >
            Main Menu
          </p>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li
                key={item.label}
                onClick={() => {
                  router.push(item.route);
                  setIsSidebarOpen(false);
                }}
                className={`
                  px-4 py-2.5 rounded-lg font-medium cursor-pointer
                  flex items-center gap-3
                  ${
                    pathname === item.route
                      ? "bg-indigo-600 text-white"
                      : theme === "dark"
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleLogout}
          className={`px-4 py-2.5 rounded-lg font-medium flex items-center gap-3 ${
            theme === "dark"
              ? "text-red-400 hover:bg-red-900/30"
              : "text-red-500 hover:bg-red-50"
          }`}
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </aside>

      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <button
          className={`lg:hidden mb-4 p-2 rounded-lg ${
            theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
          }`}
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {children}
      </main>
    </div>
  );
}
