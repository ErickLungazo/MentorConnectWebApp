import React from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";
import { Mentor } from "@/types/customTypes.ts"; // Import type
import { Badge } from "@/components/ui/badge";

// Define props interface
interface MentorCardProps {
  data: Mentor;
}

const MentorCard: React.FC<MentorCardProps> = ({ data }) => {
  return (
    <div className="w-full flex flex-col gap-2 items-center justify-center rounded-xl border p-3">
      <div className="flex w-full items-center justify-center">
        <img
          src={data.profile} // Assuming profile contains the image URL
          alt={`${data.name}'s profile`}
          className="w-20 h-20 rounded-full object-cover"
        />
      </div>
      <h1 className="font-semibold">{data.name}</h1>

      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-yellow-500" />
        <span>4.5</span>
      </div>
      {/*<p className="text-sm text-center w-full font-medium">Occupations:</p>*/}
      <div className="relative w-full ">
        <div
          className={"flex w-full flex-wrap gap-2 items-center justify-center"}
        >
          {data.occupations.map((occupation, index) => (
            <div key={index} className={""}>
              <Badge>{occupation}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full flex justify-center mt-4">
        <Link to={`/mentee/mentors/${data.id}`}>
          <Button>View Profile</Button>
        </Link>
      </div>
    </div>
  );
};

export default MentorCard;
