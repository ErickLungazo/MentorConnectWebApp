import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import SearchMentors from "@/components/SearchMentors.tsx";
import MatchWithAi from "@/components/MatchWithAI.tsx";
import MentorsList from "@/components/MentorsList.tsx";

const MentorsPage = () => {
  return (
    <section className={"flex flex-col gap-3"}>
      <Card>
        <CardHeader>
          <CardTitle>Find Your Mentor</CardTitle>
          <CardDescription>Mentors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full flex items-center justify-between">
            <SearchMentors />
            <MatchWithAi />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Mentors</CardTitle>
          <CardDescription>Connect Now</CardDescription>
        </CardHeader>
        <CardContent>
          <MentorsList />
        </CardContent>
      </Card>
    </section>
  );
};

export default MentorsPage;
