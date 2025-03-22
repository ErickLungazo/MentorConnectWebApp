import React, { useState } from "react";
import axios from "axios";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button.tsx";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Loader } from "lucide-react";
import { getAiResponseURL } from "@/lib/utils.ts";
import MatchedJobs from "@/pages/mentee/components/MatchedJobs.tsx";

// AI Matching Component
const MatchJobsWithAi = () => {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  // Function to fetch user bio and job postings, then send to AI
  const handleAiMatching = async () => {
    setLoading(true);
    try {
      // Get logged-in user ID
      const { data: userSession, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userSession?.user) {
        toast.error("You need to be logged in.");
        return;
      }
      const userId = userSession.user.id;

      // Fetch user bio from Supabase
      const { data: userBio, error: bioError } = await supabase
        .from("bio-information")
        .select("bio")
        .eq("id", userId)
        .single();

      if (bioError) throw bioError;

      // Fetch job postings from Supabase
      const { data: jobPostings, error: jobsError } = await supabase
        .from("opportunities")
        .select("id, title, type, description")
        .eq("status", "OPEN");

      if (jobsError) throw jobsError;
      if (!jobPostings || jobPostings.length === 0) {
        toast.info("No job opportunities available.");
        setLoading(false);
        return;
      }

      // Process job postings one by one
      const jobMatches = [];
      for (const job of jobPostings) {
        const jobSummary =
          job.description.split(" ").slice(0, 30).join(" ") + "..."; // Limit description length

        // Construct AI prompt for each job
        const prompt = `
  Given the following user bio, evaluate how well they match the job opportunity below.  
  Your response should be in the **first-person point of view (e.g., "You have a strong background in...")**.  

  **User Bio:**  
  ${userBio.bio}

  **Job Title:** ${job.title}  
  **Job Type:** ${job.type}  
  **Job Summary:** ${jobSummary}

  Provide a match score (1-10) and a brief explanation in JSON format:  

  {
    "job_id": "${job.id}",
    "score": <score>,
    "reason": "You <reason in first person>."
  }
`;

        // Query AI for job match
        const response = await axios.post(getAiResponseURL(), { prompt });
        const parsedMatch = JSON.parse(response.data.text.trim());

        if (parsedMatch && parsedMatch.job_id && parsedMatch.score) {
          jobMatches.push(parsedMatch);
        }
      }

      setMatches(jobMatches);
      toast.success("Matching complete!");
    } catch (error) {
      console.error("AI matching error:", error);
      toast.error("Error connecting to AI service.");
    } finally {
      setLoading(false);
    }
  };

  console.log(matches);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>AI Job Matching</CardTitle>
          <CardDescription>
            Find the best job match based on your bio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Drawer>
            <DrawerTrigger asChild>
              <Button onClick={handleAiMatching} disabled={loading}>
                {loading ? "Matching..." : "Match with AI"}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Matching Results</DrawerTitle>
                <DrawerDescription>
                  These are the top job matches for you.
                </DrawerDescription>
              </DrawerHeader>
              <div className={"max-h-[50vh] overflow-y-auto"}>
                <CardContent>
                  {loading ? (
                    <Loader className="animate-spin mx-auto" />
                  ) : matches.length === 0 ? (
                    <p className="text-gray-600 text-center">
                      No matches found.
                    </p>
                  ) : (
                    <MatchedJobs matches={matches} />
                  )}
                </CardContent>
              </div>

              <DrawerFooter>
                <DrawerClose>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </CardContent>
        <CardFooter>
          <p>Let AI help you find the perfect job match.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MatchJobsWithAi;
