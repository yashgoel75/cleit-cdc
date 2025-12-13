"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Footer from "@/components/footer-login/page";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirebaseToken } from "@/index";

interface UserProfile {
  name: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setCurrentUser(user);
        getName(user.email);
      } else {
        setCurrentUser(null);
        setUserData(null);
        setLoading(false);
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {}, []);

  async function getName(email: String) {
    try {
      const token = await getFirebaseToken();
      const res = await axios.get(`/api/user?email=${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = res.data;
      console.log(data);
      setUserData(data.user);
    } catch (error) {
      console.error("Error");
    }
  }
  return (
    <>
      <main className={`min-h-screen p-4 md:p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <h1 className={`text-3xl font-bold transition-colors`}>
                Welcome, {userData?.name} 👋
              </h1>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
