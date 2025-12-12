"use client";

import "./page.css";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Header from "@/components/Header/page";
import Footer from "@/components/Footer/page";

export default function Home() {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    if (window.innerWidth > 768) {
      setIsMobile(false);
    }
  }, []);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Header/>
      <main className="min-h-[85vh] flex justify-center items-center px-4 bg-gradient-to-br from-white via-gray-50 to-white onest-normal">
        <div className="max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
            Take the next step towards your career —
            <br />
            <span className="bg-indigo-100 px-2 rounded-md text-gray-900">
              join placement drives, attempt online tests,
            </span>
            &nbsp; and&nbsp;
            <span className="text-indigo-600 underline underline-offset-4 decoration-2">
              unlock opportunities.
            </span>
          </h1>

          <p className="mt-6 text-gray-500 text-lg md:text-xl">
            {isMobile
              ? "Cleit is your one-stop platform for career development."
              : "Cleit is your one-stop platform for career development — register for placement activities, practice aptitude tests, stay updated with upcoming recruitment events, and connect with hiring companies."}
          </p>

          <div className="mt-8">
            <a
              href={user ? "/account" : "/auth/login"}
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition transform hover:scale-105"
            >
              Get Started
            </a>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
}
