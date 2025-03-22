import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button.tsx";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { onMatch } from "@/lib/matchUtils"; // Import the extracted function

const MatchedMentorDetailsCard = ({ userId, score, reason }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("personal-information")
          .select("*")
          .eq("id", userId);

        if (error) {
          throw new Error(`Error fetching user data: ${error.message}`);
        }

        if (data && data.length > 0) {
          setUserData(data[0]);
        } else {
          setError("User data not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!userData) return <div>No user data available</div>;

  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="flex items-center gap-3">
        <img src={userData.profile} alt="" className="w-12 h-12 rounded-full" />
        <div className="flex w-full flex-col text-sm">
          <h3 className="font-semibold">
            {userData.first_name} {userData.last_name}
          </h3>
          {userData.pwd_description && (
            <p className="">PWD: {userData.pwd_description}</p>
          )}
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Reason for the match</AccordionTrigger>
              <AccordionContent>{reason}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="border shadow-sm rounded-xl bg-primary text-primary-foreground p-3 max-w-[80px] max-h-[80px] w-[80px] h-[80px] min-w-[80px] min-h-[80px] flex items-center justify-center">
          <p className="font-semibold text-3xl">{(score / 10) * 100}%</p>
        </div>
      </div>
      <div className="w-full flex items-center justify-end border-b pb-2">
        <Button onClick={() => onMatch(userId, score, reason)}>Match</Button>
      </div>
    </div>
  );
};

export default MatchedMentorDetailsCard;
