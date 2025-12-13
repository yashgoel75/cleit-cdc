"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import axios from "axios";

interface AuthContextType {
  user: any;
  setUserData: any;
  userData: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user?.uid) {
        const cachedAdmin = localStorage.getItem("adminData");
        if (cachedAdmin) {
          setUserData(JSON.parse(cachedAdmin));
          setLoading(false);
        } else {
          fetchUserDetails(user.email || "")
            .then((data) => {
              console.log(data);
              setUserData(data);
              setSchoolData(data.school);

              // localStorage.setItem("adminData", JSON.stringify(data));
            })
            .finally(() => setLoading(false));
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   const cachedAdmin = localStorage.getItem("adminData");
  //   if (cachedAdmin) setUserData(JSON.parse(cachedAdmin));
  // }, []);

  // useEffect(() => {
  //   if (adminData) localStorage.setItem("adminData", JSON.stringify(adminData));
  // }, [adminData]);

  const fetchUserDetails = async (email: string) => {
    try {
      const res = await axios.get(
        `/api/user?email=${encodeURIComponent(email)}`
      );
      const data = res.data;
      console.log(data.data);
      console.log(data.data[0]);
      setUserData(data.data[0]);
      setSchoolData(data.data[0].school);
      // localStorage.setItem("adminData", JSON.stringify(data));

      return data.data[0];
    } catch (error) {
      console.error("Error fetching admin:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUserData, userData, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
