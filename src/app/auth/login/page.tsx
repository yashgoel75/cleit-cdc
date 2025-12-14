"use client";
import Image from "next/image";
import campus from "../../../../public/assets/campus.jpg";
import vipsLogo from "../../../../public/assets/vips-logo.jpeg";
import vipsLogoMobile from "../../../../public/assets/vipsLogoMobile.jpeg";
import logo from "../../../assets/cleit.png";

import "../../page.css";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { auth } from "../../../lib/firebase";
import Link from "next/link";

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>("");
  const [resetMessage, setResetMessage] = useState<string>("");
  const [isEmailEmpty, setIsEmailEmpty] = useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
  const [falseEmailFormat, setFalseEmailFormat] = useState(false);
  const [falsePasswordFormat, setFalsePasswordFormat] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      if (user.emailVerified) {
        router.replace("/dashboard");
        return;
      }
      setUser(user);
      setEmailNotVerified(true);

      await auth.signOut();
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 630);

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (formData.email === "" || formData.password === "") {
      setIsEmailEmpty(formData.email === "");
      setIsPasswordEmpty(formData.password === "");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      if (!userCred.user.emailVerified) {
        setEmailNotVerified(true);
        await auth.signOut();
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.replace("/dashboard"), 1500);
    } catch (err) {
      setError("Error");
      console.error(err);
    }
  };

  const sendVerification = async () => {
    setVerificationError("");
    setVerificationSent(false);

    try {
      if (user) {
        await sendEmailVerification(user);
        setVerificationSent(true);
      }
    } catch (err) {
      setVerificationError("Failed to send verification email.");
    }
  };

  useEffect(() => {
    const { email, password } = formData;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(vips\.edu|vipstc\.edu\.in)$/;
    setFalseEmailFormat(email ? !emailRegex.test(email) : false);

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    setFalsePasswordFormat(password ? !passwordRegex.test(password) : false);
  }, [formData]);

  const handleSignInWithGoogle = async () => {
    setLoading(true);
    setError("");

    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup closed before completing sign-in.");
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetMessage("");
    setError("");

    if (!resetEmail) {
      setError("Please enter your email address");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("Password reset email sent! Check your inbox.");
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail("");
        setResetMessage("");
      }, 3000);
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else {
        setError("Failed to send reset email. Please try again");
      }
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row min-h-screen max-h-screen inter-normal">
        <div className="hidden lg:block relative lg:w-[60%] shadow-lg ml-5 my-5 rounded-xl clip-trapezium overflow-hidden">
          <Image
            src={campus}
            alt="Campus"
            fill
            className="object-cover object-center shadow-xl"
            priority
          />
        </div>

        <div className="w-full lg:w-[40%] px-5 py-8 lg:mr-5 lg:my-5 lg:rounded-e-xl flex flex-col items-center justify-center inter-normal">
          <div className="flex justify-center items-center gap-4 sm:gap-0">
            <Image
              src={logo}
              width={150}
              height={150}
              alt="logo"
              className="sm:w-[200px]"
            />
            <div className="block h-15 w-[1px] bg-gray-400 mx-2 md:mx-5"></div>
            <Image
              src={isMobile ? vipsLogoMobile : vipsLogo}
              width={isMobile ? 100 : 200}
              alt="logo"
              className="pt-2 sm:pt-3"
            />
          </div>

          <div className="my-5 lg:my-7 font-bold text-2xl sm:text-3xl text-center">
            Sign In
          </div>

          <div className="text-base sm:text-lg text-center px-4">
            Welcome to <b>Cleit</b>, the official CDC platform of VIPS
          </div>

          {!showForgotPassword ? (
            <div className="w-full max-w-md px-4">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col mt-6 sm:mt-8 w-full space-y-4 sm:space-y-5"
              >
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                    placeholder="username@vips.edu"
                    disabled={loading}
                  />
                  {isEmailEmpty ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#8C1A10"
                      >
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                      &nbsp; Please enter your email
                    </div>
                  ) : null}
                  {falseEmailFormat && (
                    <div className="flex text-sm justify-center items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="22px"
                        viewBox="0 -960 960 960"
                        width="22px"
                        fill="#992B15"
                      >
                        <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                      </svg>
                      &nbsp; Please enter a valid email address
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                    placeholder="••••••••••••"
                    disabled={loading}
                  />
                  {isPasswordEmpty ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#8C1A10"
                      >
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                      &nbsp; Please enter password
                    </div>
                  ) : null}
                  {falsePasswordFormat ? (
                    <div className="flex text-sm md:text-base justify-center md:items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="22px"
                        viewBox="0 -960 960 960"
                        width="22px"
                        fill="#992B15"
                      >
                        <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                      </svg>
                      &nbsp; Please enter a valid password format
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-right text-indigo-500 hover:text-indigo-700 underline transition-colors duration-200 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {error && (
                  <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || success}
                  className={`px-4 py-3 bg-indigo-500 text-white font-semibold hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                    loading || success
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }`}
                >
                  {loading
                    ? "Signing in..."
                    : success
                    ? "Redirecting... Please Wait"
                    : "Login"}
                </button>
              </form>
              {emailNotVerified && (
                <div className="flex justify-center text-sm mt-2 bg-red-300 text-red-800 rounded px-3 py-2 text-sm md:text-base items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height={isMobile ? "20px" : "20px"}
                    width={isMobile ? "20px" : "20px"}
                    viewBox="0 -960 960 960"
                    fill="#992B15"
                    className="flex items-start"
                  >
                    <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                  </svg>

                  <div className="flex text-sm flex-wrap gap-1">
                    <span>Your email is not verified.</span>
                    <button
                      onClick={sendVerification}
                      className="underline cursor-pointer"
                    >
                      Send Verification Email
                    </button>
                  </div>
                </div>
              )}
              {verificationSent && (
                <div className="flex items-center text-green-700 mt-1 text-sm">
                  Verification email sent!
                </div>
              )}

              {verificationError && (
                <div className="text-red-800 mt-1">{verificationError}</div>
              )}
              <div className="flex w-full justify-center items-center my-4">
                <div className="border-b border-gray-300 w-full mx-3"></div>
                <span className="text-gray-500 text-sm whitespace-nowrap">
                  or
                </span>
                <div className="border-b border-gray-300 w-full mx-3"></div>
              </div>

              <div className="flex justify-center items-center gap-3 sm:gap-4 rounded-lg transition-colors duration-200">
                <span className="text-sm sm:text-base">
                  Don't have an account?{" "}
                  <span className="underline cursor-pointer">
                    <Link href={"/auth/register"}>Create one now.</Link>
                  </span>
                </span>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleForgotPassword}
              className="flex flex-col mt-6 sm:mt-8 w-full max-w-md px-4 space-y-4 sm:space-y-5"
            >
              <div className="text-center mb-2">
                <h3 className="text-xl font-semibold">Reset Password</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Enter your email to receive a password reset link
                </p>
              </div>

              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="resetEmail"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setError("");
                  }}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                  placeholder="username@vips.edu"
                />
              </div>

              {error && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {resetMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {resetMessage}
                </div>
              )}

              <button
                type="submit"
                className="px-4 py-3 bg-indigo-500 text-white font-semibold hover:bg-indigo-600 cursor-pointer rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Send Reset Link
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail("");
                  setError("");
                  setResetMessage("");
                }}
                className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors duration-200 cursor-pointer"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
