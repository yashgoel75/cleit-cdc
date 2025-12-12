import "./page.css";
import Member from "./member/member";
import Header from "@/components/Header/page";
import Footer from "@/components/Footer/page";

import yashgoel from "@/assets/team/yash_goel.png";
import namanarora from "@/assets/team/naman_arora.png";
import urvashisharma from "@/assets/team/urvashi_sharma.png";
import vaibhavarya from "@/assets/team/vaibhav_arya.png";

export default function Team() {
  const teamMembers = [
    {
      imageSrc: yashgoel,
      name: "Yash Goel",
      role: "Founder | Frontend Lead",
      linkedin: "https://linkedin.com/in/yashgoel75",
      instagram: "",
    },
    {
      imageSrc: namanarora,
      name: "Naman Arora",
      role: "Backend Lead",
      linkedin: "https://linkedin.com/in/naman22a",
      instagram: "https://instagram.com/naman22a",
    },
    {
      imageSrc: urvashisharma,
      name: "Urvashi Sharma",
      role: "Head of Public Relations",
      linkedin: "https://linkedin.com/in/urvashi.shr",
      instagram: "https://instagram.com/urvashi.shr",
    },
    {
      imageSrc: vaibhavarya,
      name: "Vaibhav Arya",
      role: "Head of Social Media",
      linkedin: "https://linkedin.com/in/vaibhav-arya-737772324",
      instagram: "https://instagram.com/vaibhav.aryaa",
    },
  ];

  return (
    <>
      <Header />
      <div className="w-[95%] min-h-[85vh] lg:w-full max-w-6xl mx-auto py-10 md:py-20 px-4">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-10 lg:gap-35 justify-items-center">
          {teamMembers.map((member, index) => (
            <Member
              key={index}
              imageSrc={member.imageSrc}
              name={member.name}
              role={member.role}
              linkedin={member.linkedin}
              instagram={member.instagram}
            />
          ))}
        </div>
      </div>
      <div className="w-full bottom-0">
        <Footer />
      </div>
    </>
  );
}
