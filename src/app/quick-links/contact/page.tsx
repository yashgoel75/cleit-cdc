"use client";

import "./page.css";
import { useState, useEffect } from "react";
import Image from "next/image";
import instagram from "@/assets/Instagram.png";
import linkedin from "@/assets/LinkedIn.png";
import Header from "@/components/Header/page";
import Footer from "@/components/Footer/page";

export default function Contact() {
  const [isNameEmpty, setIsNameEmpty] = useState(false);
  const [isEmailEmpty, setIsEmailEmpty] = useState(false);
  const [isSubjectEmpty, setIsSubjectEmpty] = useState(false);
  const [isBodyEmpty, setIsBodyEmpty] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    body: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);

    if (name == "name") {
      setIsNameEmpty(false);
    }
    if (name === "email") {
      setIsEmailEmpty(false);
    }
    if (name == "subject") {
      setIsSubjectEmpty(false);
    }
    if (name === "body") {
      setIsBodyEmpty(false);
    }
  };

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nameEmpty = formData.name.trim() === "";
    const emailEmpty = formData.email.trim() === "";
    const subjectEmpty = formData.subject.trim() === "";
    const bodyEmpty = formData.body.trim() === "";

    setIsNameEmpty(nameEmpty);
    setIsEmailEmpty(emailEmpty);
    setIsSubjectEmpty(subjectEmpty);
    setIsBodyEmpty(bodyEmpty);

    if (nameEmpty || emailEmpty || subjectEmpty || bodyEmpty) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        body: "",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Contact form error:", error.message);
        alert("Failed to send your message. Please try again later.");
      } else {
        console.error("Error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="w-full min-h-[80vh] bg-gray-50 flex items-center py-10 md:py-20 px-4">
        <div className="max-w-5xl w-full mx-auto grid md:grid-cols-2 gap-12">
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Talk to our team
            </h2>
            <p className="md:text-lg text-gray-500">
              Experiencing a technical issue or need support? Fill out the form,
              and our team will respond shortly.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-4 md:p-8">
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="md:text-lg font-medium text-gray-700 block mb-1"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none hover:border-indigo-200 focus:ring focus:ring-indigo-200 focus:shadow-md transition"
                />
                {isNameEmpty ? (
                  <div className="text-sm flex text-[#8C1A10] mt-2">
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

              <div>
                <label
                  htmlFor="email"
                  className="md:text-lg font-medium text-gray-700 block mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none hover:border-indigo-200 focus:ring focus:ring-indigo-200 focus:shadow-md transition"
                />
                {isEmailEmpty ? (
                  <div className="text-sm flex text-[#8C1A10] mt-2">
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
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="md:text-lg font-medium text-gray-700 block mb-1"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none hover:border-indigo-200 focus:ring focus:ring-indigo-200 focus:shadow-md transition"
                />
                {isSubjectEmpty ? (
                  <div className="text-sm flex text-[#8C1A10] mt-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="18px"
                      viewBox="0 -960 960 960"
                      width="18px"
                      fill="#8C1A10"
                    >
                      <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                    </svg>
                    &nbsp; Please enter the subject
                  </div>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="body"
                  className="md:text-lg font-medium text-gray-700 block mb-1"
                >
                  Message
                </label>
                <textarea
                  id="body"
                  name="body"
                  rows={4}
                  required
                  value={formData.body}
                  onChange={handleChange}
                  placeholder="Your message..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none hover:border-indigo-200 focus:ring focus:ring-indigo-200 focus:shadow-md transition resize-none"
                />
                {isBodyEmpty ? (
                  <div className="text-sm flex text-[#8C1A10] mt-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="18px"
                      viewBox="0 -960 960 960"
                      width="18px"
                      fill="#8C1A10"
                    >
                      <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                    </svg>
                    &nbsp; Please enter the message
                  </div>
                ) : null}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading || success}
                  className={`w-full py-3 rounded-lg font-semibold transition text-white ${
                    loading || success
                      ? "bg-indigo-300 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] cursor-pointer"
                  }`}
                >
                  {loading
                    ? "Sending..."
                    : success
                      ? "Message Sent"
                      : "Talk to Cleit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 py-6 px-4">
        <div className="text-center mb-6">
          <h3 className="text-gray-800 md:text-lg font-medium">
            Prefer socials? Let&apos;s connect there too.
          </h3>
        </div>
        <div className="flex justify-center gap-4 md:gap-6">
          <a
            href="https://www.linkedin.com/company/cleit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-indigo-600 transition transform hover:scale-110"
            aria-label="LinkedIn"
          >
            <Image
              className="hover:shadow-lg"
              src={linkedin}
              width={isMobile ? 30 : 35}
              alt="Linkedin Logo"
            ></Image>
          </a>
          {/* <a
            href="https://instagram.com/yourprofile"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-indigo-600 transition transform hover:scale-110"
            aria-label="Instagram"
          >
            <Image
              className="rounded-md hover:shadow-lg"
              src={instagram}
              width={isMobile ? 30 : 35}
              alt="Instagram Logo"
            ></Image>
          </a> */}
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}
