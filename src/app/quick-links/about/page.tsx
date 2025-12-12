import Header from "@/components/Header/page";
import Footer from "@/components/Footer/page";
import logo from "@/assets/cleitVips.png";
import Image from "next/image";

export default function About() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
        <div className="flex justify-center mb-8">
          <Image src={logo} width={280} alt="Cleit x VIPS" priority />
        </div>

        <p className="text-lg leading-relaxed mb-6">
          Cleit is the official, college-recognized platform of&nbsp;
          <span className="font-semibold">
            Vivekananda Institute of Professional Studies
          </span>
          , built in collaboration with the&nbsp;
          <span className="font-semibold">Career Development Centre (CDC)</span>.
        </p>

        <p className="text-lg leading-relaxed mb-6">
          It provides a single space where students can explore and participate
          in all career-related opportunities — including placement drives,
          internships, skill-based assessments, and job openings — without the
          need to go through multiple emails or scattered announcements.
        </p>

        <p className="text-lg leading-relaxed mb-6">
          Through Cleit, students can directly check eligibility, apply to
          companies, stay updated on deadlines, and engage with opportunities
          that shape their professional growth.
        </p>

        <p className="text-lg leading-relaxed">
          Our vision is to make career opportunities&nbsp;
          <span className="font-medium text-indigo-600">
            organized, accessible, and empowering
          </span>
          &nbsp;for every student at VIPS — and eventually across campuses
          nationwide.
        </p>
      </main>
      <Footer />
    </>
  );
}
