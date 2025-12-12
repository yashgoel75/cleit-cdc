"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut, onAuthStateChanged, User } from "firebase/auth";
import logo from "@/assets/cleit.png";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getFirebaseToken } from "@/utils";

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isLogoutConfirmationMessage, setIsLogoutConfirmationMessage] =
    useState(false);
  const router = useRouter();

  useEffect(() => {
    const resizeHandler = () => setIsMobile(window.innerWidth <= 768);
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user?.email) fetchUserName(user.email);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserName = async (email: string) => {
    try {
      const token = await getFirebaseToken();
      const response = await fetch(
        `/api/user?email=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch user name");
      setDisplayName(data.user.name);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoutConfirmation = () => {
    setIsLogoutConfirmationMessage(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      setUser(null);
      router.replace("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const AuthButtons = () => (
    <div className="flex gap-3">
      <button
        onClick={() => router.push("/auth/login")}
        className="text-sm md:text-base px-4 py-1.5 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition hover:cursor-pointer"
      >
        Login
      </button>
      <button
        onClick={() => router.push("/auth/register")}
        className="text-sm md:text-base px-4 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 transition hover:cursor-pointer"
      >
        Register
      </button>
    </div>
  );

  const UserMenu = () => (
    <div className="flex items-center gap-5">
      {isLogoutConfirmationMessage ? (
        <div className="flex-1">
          <span className="text-red-500 text-base">
            Are you sure you want to logout?
          </span>
          <div className="flex gap-4 mt-2">
            <button
              className="hover:cursor-pointer text-red-700"
              onClick={handleLogout}
            >
              Yes
            </button>
            <button
              className="hover:cursor-pointer"
              onClick={() => setIsLogoutConfirmationMessage(false)}
            >
              No
            </button>
          </div>
        </div>
      ) : (
        <button
          title="Logout"
          onClick={handleLogoutConfirmation}
          className="text-gray-600 hover:text-red-500 transition hover:cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
          >
            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
          </svg>
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Nav */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-40 px-5 py-3">
          <div className="flex justify-between items-center mb-6 relative">
            <Link className="focus:outline-none relative" href={"/"}>
              <Image src={logo} width={140} alt="Cleit" />
            </Link>
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="text-2xl relative text-gray-800 hover:cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="space-y-5 text-lg">
            {user ? (
              <>
                <p className="font-semibold cursor-pointer">
                  Career Development Centre - Vivekananda Institute of Professional
              Studies
                </p>
                <p
                  onClick={() => router.replace("/account")}
                  className="font-semibold cursor-pointer"
                >
                  {displayName}
                </p>

                <p
                  onClick={() => router.replace("/account/jobs")}
                  className="cursor-pointer hover:underline"
                >
                  Jobs
                </p>
                <p
                  onClick={() => router.replace("/account/tests")}
                  className="cursor-pointer hover:underline"
                >
                  Tests
                </p>
                <p
                  onClick={() => router.replace("/account/webinars")}
                  className="cursor-pointer hover:underline"
                >
                  Webinars
                </p>

                {isLogoutConfirmationMessage ? (
                  <div className="flex-1">
                    <span className="text-red-500">
                      Are you sure you want to logout?
                    </span>
                    <div className="flex gap-4 mt-2">
                      <button
                        className="hover:cursor-pointer text-red-700"
                        onClick={handleLogout}
                      >
                        Yes
                      </button>
                      <button
                        className="hover:cursor-pointer"
                        onClick={() => setIsLogoutConfirmationMessage(false)}
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleLogoutConfirmation}
                    className="text-red-600 font-medium underline hover:cursor-pointer"
                  >
                    Logout
                  </button>
                )}
              </>
            ) : (
              <>
                <p className="font-semibold cursor-pointer">
                  Career Development Centre - Vivekananda Institute of Professional
              Studies
                </p>
                <AuthButtons />
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="w-full px-5 py-10 relative flex items-center justify-center bg-white border-b border-gray-300 sticky top-0 z-30">
        <div className="flex items-center gap-4 absolute left-0 px-5">
          <Link className="focus:outline-none" href={"/"}>
            <Image src={logo} width={isMobile ? 140 : 200} alt="Cleit" />
          </Link>
        </div>
        <div className="hidden lg:flex flex-1 justify-center items-center font-bold text-xl">
          <button>
            <a href="https://vips.edu">
              Career Development Centre - Vivekananda Institute of Professional
              Studies
            </a>
          </button>
        </div>
        <div className="hidden lg:flex items-center gap-6 absolute right-0 px-5">
          {user ? (
            <>
              <button
                onClick={() => router.push("/account")}
                className={`font-semibold text-lg hover:text-indigo-700 transition hover:cursor-pointer ${
                  isLogoutConfirmationMessage ? "hidden" : null
                }`}
              >
                {displayName}
              </button>
              <UserMenu />
            </>
          ) : (
            <AuthButtons />
          )}
        </div>
        <div className="block lg:hidden absolute right-0 px-5">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="hover:cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="26px"
              viewBox="0 -960 960 960"
              width="26px"
              fill="#333"
            >
              <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
            </svg>
          </button>
        </div>
      </header>

      {!isMobile && user && (
        <div className="hidden lg:flex w-full border-b border-gray-300 py-2 justify-center">
          <nav className="flex gap-2 font-medium">
            {user ? (
              <Link href={"/account"}>
                <button
                  className={`cursor-pointer px-4 py-1 rounded-md transition ${
                    pathname.endsWith("/account")
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 hover:bg-indigo-50"
                  }`}
                >
                  Account
                </button>
              </Link>
            ) : null}
            <Link href={"/account/jobs"}>
              <button
                className={`cursor-pointer px-4 py-1 rounded-md transition ${
                  pathname.endsWith("/jobs")
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
              >
                Jobs
              </button>
            </Link>
            <Link href={"/account/tests"}>
              <button
                className={`cursor-pointer px-4 py-1 rounded-md transition ${
                  pathname.endsWith("/tests")
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
              >
                Tests
              </button>
            </Link>
            <Link href={"/account/webinars"}>
              <button
                className={`cursor-pointer px-4 py-1 rounded-md transition ${
                  pathname.endsWith("/webinars")
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
              >
                Webinars
              </button>
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
