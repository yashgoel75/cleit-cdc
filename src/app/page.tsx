"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import logo from "@/assets/cleit.png";
import Image from "next/image";

import "./page.css";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isMobile, setIsMobile] = useState<Boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user?.email) {
        const timer = setTimeout(() => {
          router.replace("/dashboard");
        }, 1500);
      } else {
        const timer = setTimeout(() => {
          router.replace("/auth/login");
        }, 1500);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  })

  return (
    <main className="main-container flex flex-col items-center justify-center min-h-screen max-h-screen p-4">
      <span className="text-4xl dm-serif-display-regular-italic">
        Welcome to
      </span>

      <Image className="mt-2" src={logo} width={isMobile ? 200 : 350} alt="Cleit Logo"></Image>

      {loading && (
        <div className="loader mt-8">
          <div></div>
          <div></div>
          <div></div>
        </div>
      )}
    </main>
  );
}