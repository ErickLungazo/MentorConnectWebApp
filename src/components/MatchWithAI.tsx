import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { fetchUserData } from "@/lib/fetchUserData";
import { fetchMentors } from "@/lib/fetchMentors";
import axios from "axios";
import { getAiResponseURL } from "@/lib/utils";
import { toast } from "sonner";
import MatchedMentorDetailsCard from "@/components/MatchedMentorDetailsCard";

// ✅ Type definitions for better type safety
interface Mentor {
  id: string;
  userData: any;
}

interface Match {
  mentor_id: string;
  score: number;
  reason: string;
}

const MatchWithAi: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Function to fetch data when the dialog opens
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setError("User not found");
        setLoading(false);
        return;
      }

      const userId = user.user.id;
      const combinedData = await fetchUserData(userId);
      setUserData(combinedData);

      const mentorIds = await fetchMentors();
      const detailedMentors = await Promise.all(
        mentorIds.map(async (mentorId) => {
          const mentorData = await fetchUserData(mentorId);
          return { id: mentorId, userData: mentorData };
        }),
      );

      setMentors(detailedMentors);

      // ✅ AI Matching Process
      const scoredMentors = await Promise.all(
        detailedMentors.map(async (mentor) => {
          const prompt = `
            Evaluate the match between the following mentee and mentor based on their profiles:
            Mentee Profile:
            Academic Info: ${JSON.stringify(combinedData.academicInfo)}
            Employment History: ${JSON.stringify(combinedData.employmentHistory)}
            Skills & Interests: ${JSON.stringify(combinedData.skillsAndInterestsInfo)}

            Mentor Profile:
            Academic Info: ${JSON.stringify(mentor.userData.academicInfo)}
            Employment History: ${JSON.stringify(mentor.userData.employmentHistory)}
            Skills & Interests: ${JSON.stringify(mentor.userData.skillsAndInterestsInfo)}

  Provide a score (1-10) along with a reason in JSON format. The reason should be written as if addressing the mentee directly, starting with "You...":
            {
                "mentor_id": "${mentor.id}",
                "score": <score>,
                "reason":"<reason>"
            }
          `;

          try {
            const response = await axios.post(getAiResponseURL(), { prompt });
            const parsedResponse: Match = JSON.parse(response.data.text.trim());

            if (parsedResponse.mentor_id && parsedResponse.score) {
              return parsedResponse;
            } else {
              console.error("Unexpected AI response format:", parsedResponse);
              toast.error("Failed to parse AI match. Try again.");
              return null;
            }
          } catch (error) {
            console.error("AI matching error:", error);
            toast.error("Error connecting to AI service.");
            return null;
          }
        }),
      );

      const validMatches = scoredMentors
        .filter(Boolean)
        .sort((a, b) => b.score - a.score);
      setMatches(validMatches);
    } catch (err) {
      setError("Error fetching data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Trigger data fetch only when dialog opens
  useEffect(() => {
    if (open) fetchData();
  }, [open, fetchData]);

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Sparkles />
            Match with AI
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Match with AI</DialogTitle>
            <DialogDescription>
              {loading
                ? "Loading user and mentor data..."
                : error
                  ? `Error: ${error}`
                  : userData
                    ? "Top mentor matches based on your profile."
                    : "No user data available"}
            </DialogDescription>
          </DialogHeader>

          <div className="h-[70vh] overflow-y-auto">
            {matches.length > 0 ? (
              matches
                .slice(0, 5) // Only show top 5 matches
                .map((item, index) => (
                  <MatchedMentorDetailsCard
                    key={index}
                    score={Number(item.score)}
                    userId={item.mentor_id}
                    reason={item.reason}
                  />
                ))
            ) : (
              <p>No mentors available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MatchWithAi;
