"use client";

import "./page.css";
import logo from "@/assets/cleit.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Footer() {
  const router = useRouter();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 px-6 py-10 pt-10 onest-normal">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link className="focus:outline-none" href={"/"}>
            <Image src={logo} width={150} alt="Cleit"></Image>
          </Link>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">About Us</h3>
          <p className="text-sm text-gray-400">
            A unified platform for all career opportunities — explore jobs,
            internships, placement drives, skill tests, and apply directly
            without missing a deadline.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li
              className="hover:cursor-pointer"
              onClick={() => router.push("/")}
            >
              Home
            </li>
            <li
              className="hover:cursor-pointer"
              onClick={() => router.push("/quick-links/about")}
            >
              About Us
            </li>
            <li
              className="hover:cursor-pointer"
              onClick={() => router.push("/quick-links/team")}
            >
              Our Team
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Connect</h3>
          <ul className="space-y-2 text-sm">
            {/* <li>
              <a
                href="mailto:connect@cleit.in"
                className="hover:text-gray-700 transition"
              >
                connect@cleit.in
              </a>
            </li> */}
            <li
              className="hover:cursor-pointer"
              onClick={() => router.push("/quick-links/contact")}
            >
              Contact Us
            </li>
            {/* <li>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-gray-700 transition"
              >
                Instagram
              </a>
            </li>
             */}
            <li>
              <a
                href="https://linkedin.com/company/cleit"
                target="_blank"
                rel="noreferrer"
                className="hover:text-gray-700 transition"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-sm md:text-base mt-10 border-t border-gray-300 pt-5">
        © {year} Cleit. All rights reserved.
      </div>
    </footer>
  );
}
