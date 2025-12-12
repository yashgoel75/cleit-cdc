import "../page.css";
import Image from "next/image";
import linkedinIcon from "@/assets/LinkedIn.png";
import instagramIcon from "@/assets/Instagram.png";
import type { StaticImageData } from "next/image";

type MemberProps = {
  imageSrc: string | StaticImageData;
  name: string;
  role: string;
  linkedin: string;
  instagram: string;
};

export default function Member({
  imageSrc,
  name,
  role,
  linkedin,
  instagram,
}: MemberProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl transition-transform transform hover:-translate-y-2 hover:shadow-2xl w-72 text-center flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-center mb-4">
          <div className="relative w-[150px] h-[150px] rounded-full overflow-hidden border-4 border-indigo-500 shadow-md hover:scale-105 transition-transform duration-300">
            <Image src={imageSrc} fill alt={name} className="object-cover" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800">{name}</h3>
        <p className="text-indigo-600 font-medium">{role}</p>
      </div>

      <div className="flex justify-center gap-6 mt-6">
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform duration-300"
        >
          <Image src={linkedinIcon} alt="LinkedIn" className="w-6 h-6" />
        </a>
        <a
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          className={`hover:scale-110 transition-transform duration-300 ${instagram == "" ? "hidden" : null}`}
        >
          <Image src={instagramIcon} alt="Instagram" className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
}
