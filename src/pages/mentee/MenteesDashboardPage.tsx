// src/pages/MenteesDashboardPage.tsx
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MentorCard from "@/components/MentorCard";
import { supabase } from "@/lib/supabase";
import MySessionsPage from "@/pages/mentee/MySessionsPage.tsx";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";

const MenteesDashboardPage = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get the current user
        const { data: user } = await supabase.auth.getUser();
        if (!user) {
          setError("User not logged in");
          setLoading(false);
          return;
        }
        const userId = user.user.id;

        // Fetch matches for the current user
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select("mentor_id")
          .eq("mentee_id", userId)
          .eq("is_approved", true); // Fetch only approved matches

        if (matchError) {
          console.error("Error fetching matches:", matchError);
          setError("Error fetching matches");
          setLoading(false);
          return;
        }

        // Extract mentor IDs from matches
        const mentorIds = matchData.map((match) => match.mentor_id);

        // Fetch detailed information for each matched mentor
        const { data: mentorsData, error: mentorsError } = await supabase
          .from("personal-information")
          .select("id, first_name, last_name, profile")
          .in("id", mentorIds);

        if (mentorsError) {
          console.error("Error fetching mentor details:", mentorsError);
          setError("Error fetching mentor details");
          setLoading(false);
          return;
        }

        // Format the data to match the expected structure for MentorCard
        const formattedMentors = mentorsData.map((mentor) => ({
          id: mentor.id,
          name: `${mentor.first_name} ${mentor.last_name}`,
          profile: mentor.profile,
          rating: 4.5, // Example rating, you can fetch this from another table if needed
          occupations: ["Software Engineer", "Teacher"], // Example occupations, you can fetch this from another table if needed
        }));

        setMentors(formattedMentors);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  return (
    <section className="flex flex-col gap-3 p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Find Your Mentor</CardTitle>
          <CardDescription>Mentors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full flex items-center justify-between">
            {/*<SearchMentors />*/}
            <Link to={"/mentee/mentors"}>
              <Button>Find Mentor</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>My Mentors</CardTitle>
          <CardDescription>Connect Now</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : mentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentors.map((mentor) => (
                <MentorCard key={mentor.id} data={mentor} />
              ))}
            </div>
          ) : (
            <p>No mentors found.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
  <section className="flex flex-col gap-3">
    <MySessionsPage />
  </section>;
};

export default MenteesDashboardPage;
