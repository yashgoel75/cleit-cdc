"use client";
import Image from "next/image";
import campus from "../../../../public/assets/campus.jpg";
import vipsLogo from "../../../../public/assets/vips-logo.jpeg";
import vipsLogoMobile from "../../../../public/assets/vipsLogoMobile.jpeg";
import logo from "../../../assets/cleit.png";
import axios from "axios";
import "../../page.css";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
} from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import Link from "next/link";

export default function Register() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        router.replace("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 630);

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    collegeEmail: "",
    password: "",
    confirmPassword: "",
  });

  const [isMobile, setIsMobile] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [falseEmailFormat, setFalseEmailFormat] = useState(false);
  const [falsePasswordFormat, setFalsePasswordFormat] = useState(false);
  const [falseConfirmPassword, setFalseConfirmPassword] = useState(false);

  const [emailAlreadyTaken, setEmailAlreadyTaken] = useState(false);

  const [isNameEmpty, setIsNameEmpty] = useState(false);
  const [isEmailEmpty, setIsEmailEmpty] = useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
  const [isConfirmPasswordEmpty, setIsConfirmPasswordEmpty] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [checkingMail, setCheckingMail] = useState(false);
  const [isBasicDetails, setIsBasicDetails] = useState(true);
  const [isPasswordDetails, setIsPasswordDetails] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");

    if (name == "name") {
      setIsNameEmpty(false);
    }
    if (name === "collegeEmail") {
      setIsEmailEmpty(false);
      setEmailAlreadyTaken(false);
    }
    if (name == "password") {
      setIsPasswordEmpty(false);
    }
    if (name == "confirmPassword") {
      setIsConfirmPasswordEmpty(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password === "" || formData.confirmPassword === "") {
      setIsPasswordEmpty(formData.password === "");
      setIsConfirmPasswordEmpty(formData.confirmPassword === "");
      return;
    }

    if (falsePasswordFormat || falseConfirmPassword) return;

    setIsSubmitting(true);
    setError("");

    try {
      await createUserWithEmailAndPassword(
        auth,
        formData.collegeEmail,
        formData.password
      );

      await axios.post("/api/register/user", {
        name: formData.name,
        collegeEmail: formData.collegeEmail,
      });

      router.push("/auth/login");
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        setEmailAlreadyTaken(true);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const { collegeEmail, password, confirmPassword } = formData;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(vips\.edu|vipstc\.edu\.in)$/;
    setFalseEmailFormat(collegeEmail ? !emailRegex.test(collegeEmail) : false);

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    setFalsePasswordFormat(password ? !passwordRegex.test(password) : false);

    setFalseConfirmPassword(
      !!confirmPassword && !!password && confirmPassword !== password
    );
  }, [formData]);

  async function handleNextToPasswordDetails() {
    if (formData.name == "" || formData.collegeEmail == "") {
      setIsNameEmpty(formData.name == "");
      setIsEmailEmpty(formData.collegeEmail == "");
      return;
    }
    if (falseEmailFormat) return;
    setCheckingMail(true);
    const res = await axios.get(
      `/api/register/user?email=${formData.collegeEmail}`
    );
    setCheckingMail(false);
    if (res.data.emailExists) {
      setEmailAlreadyTaken(true);
      return;
    }
    setIsBasicDetails(false);
    setIsPasswordDetails(true);
  }

  function handlePrevToBasicDetails() {
    setIsPasswordDetails(false);
    setIsBasicDetails(true);
  }

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

        <div className="w-full overflow-auto lg:w-[40%] px-5 py-8 lg:mr-5 lg:my-5 lg:rounded-e-xl flex flex-col items-center justify-center inter-normal">
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
            Register
          </div>

          <div className="text-base sm:text-lg text-center px-4">
            Welcome to <b>Cleit</b>, the official CDC platform of VIPS
          </div>

          {!showForgotPassword && (
            <div className="w-full max-w-md px-4">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col mt-6 sm:mt-8 w-full space-y-4 sm:space-y-5"
              >
                {isBasicDetails && (
                  <>
                    <div className="flex flex-col space-y-2">
                      <label
                        htmlFor="name"
                        className="text-[15px] font-medium text-gray-700"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                        placeholder="Enter your name"
                      />
                      {isNameEmpty ? (
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
                          &nbsp; Please enter your name
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col space-y-2">
                      <label
                        htmlFor="Phone"
                        className="text-[15px] font-medium text-gray-700"
                      >
                        VIPS Email ID
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="collegeEmail"
                        value={formData.collegeEmail}
                        onChange={handleChange}
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                        placeholder="you@vips.edu / you@vipstc.edu.in"
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
                      {emailAlreadyTaken ? (
                        <div className="flex text-sm md:text-base justify-center items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="22px"
                            viewBox="0 -960 960 960"
                            width="22px"
                            fill="#992B15"
                          >
                            <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                          </svg>
                          &nbsp; Email ID already in use
                        </div>
                      ) : null}
                      {falseEmailFormat ? (
                        <div className="flex text-sm md:text-base justify-center items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
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
                      ) : null}
                    </div>

                    {error && (
                      <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleNextToPasswordDetails}
                      className={`px-4 py-3 bg-indigo-500 text-white font-semibold hover:bg-indigo-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                        checkingMail
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      {checkingMail ? "Verifying" : "Next"}
                    </button>
                  </>
                )}

                {isPasswordDetails && (
                  <>
                    <div className="flex flex-col space-y-2">
                      <label
                        htmlFor="password"
                        className="text-[15px] font-medium text-gray-700"
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                        placeholder="••••••"
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
                    </div>

                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <label className="text-[15px] font-medium text-gray-700">
                          Confirm Password&nbsp;
                        </label>
                        <svg
                          onClick={() =>
                            setIsPasswordVisible(!isPasswordVisible)
                          }
                          xmlns="http://www.w3.org/2000/svg"
                          height="20px"
                          viewBox="0 -960 960 960"
                          width="20px"
                          fill="#000000"
                        >
                          <path
                            d={
                              isPasswordVisible
                                ? "M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"
                                : "m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"
                            }
                          />
                        </svg>
                      </div>
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder={
                          isPasswordVisible ? "superstrongpassword" : "••••••"
                        }
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                      />
                      {falseConfirmPassword ? (
                        <div className="flex justify-center items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="22px"
                            viewBox="0 -960 960 960"
                            width="22px"
                            fill="#992B15"
                          >
                            <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                          </svg>
                          &nbsp; Passwords do not match.
                        </div>
                      ) : null}
                      {isConfirmPasswordEmpty ? (
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
                          &nbsp; Please enter confirm password
                        </div>
                      ) : null}
                    </div>

                    {error && (
                      <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                    <div className="w-full gap-3 flex">
                      <button
                        type="button"
                        onClick={handlePrevToBasicDetails}
                        className="w-full px-4 py-3 bg-indigo-500 text-white font-semibold hover:bg-indigo-600 cursor-pointer rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className={`flex justify-center items-center w-full bg-indigo-500 outline-none text-white px-6 py-2 rounded-md font-semibold transition hover:bg-indigo-700 ${
                          isSubmitting
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:cursor-pointer"
                        }`}
                      >
                        {isSubmitting ? "Submitting" : "Submit"}
                      </button>
                    </div>
                  </>
                )}
              </form>
              <div className="flex w-full justify-center items-center my-4">
                <div className="border-b border-gray-300 w-full mx-3"></div>
                <span className="text-gray-500 text-sm whitespace-nowrap">
                  or
                </span>
                <div className="border-b border-gray-300 w-full mx-3"></div>
              </div>

              <div className="flex justify-center items-center gap-3 sm:gap-4 rounded-lg transition-colors duration-200">
                <span className="text-sm sm:text-base">
                  Already have an account?{" "}
                  <span className="underline cursor-pointer">
                    <Link href={"/auth/login"}>Login now.</Link>
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
