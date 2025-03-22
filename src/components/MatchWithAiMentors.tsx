// components/MatchWithAiMentors.js
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetchMentors } from "@/lib/fetchMentors";
import { fetchUserData } from "@/lib/fetchUserData";

const MatchWithAiMentors = ({ setMentorsList }) => {
  const [open, setOpen] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllMentors = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all mentor IDs
        const mentorIds = await fetchMentors();

        // Fetch detailed information for each mentor
        const detailedMentors = await Promise.all(
          mentorIds.map(async (mentorId) => {
            const userData = await fetchUserData(mentorId);
            return { id: mentorId, userData };
          }),
        );

        setMentors(detailedMentors);
      } catch (err) {
        setError("Error fetching mentors");
      } finally {
        setLoading(false);
      }
    };

    fetchAllMentors();
  }, []);

  console.log(mentors);

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Sparkles />
            Match with AI Mentors
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Match with AI Mentors</DialogTitle>
            <DialogDescription>
              {loading
                ? "Loading mentors..."
                : error
                  ? `Error: ${error}`
                  : mentors.length > 0
                    ? mentors.map((mentor) => (
                        <div key={mentor.id} style={{ marginBottom: "20px" }}>
                          <h3>
                            {mentor.userData.personalInfo
                              ? `${mentor.userData.personalInfo.first_name} ${mentor.userData.personalInfo.last_name}`
                              : "No personal info"}
                          </h3>
                          <pre>{JSON.stringify(mentor.userData, null, 2)}</pre>
                        </div>
                      ))
                    : "No mentors available"}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MatchWithAiMentors;
