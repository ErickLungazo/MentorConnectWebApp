import React, { useEffect, useState } from "react";
import MentorCard from "@/components/MentorCard.tsx";
import { supabase } from "@/lib/supabase.ts";
import { Mentor } from "@/types/customTypes.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Loader } from "lucide-react";

const MentorsList: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        // Fetch roles to get the mentor role ID
        const { data: rolesData, error: rolesError } = await supabase
          .from("roles")
          .select("id")
          .eq("name", "mentor");

        if (rolesError) throw new Error(rolesError.message);
        const mentorRoleId = rolesData?.[0]?.id;
        if (!mentorRoleId) throw new Error("Mentor role not found");

        // Fetch users with the mentor role
        const { data: userRolesData, error: userRolesError } = await supabase
          .from("user_role")
          .select("id")
          .eq("role", mentorRoleId);

        if (userRolesError) throw new Error(userRolesError.message);
        const mentorUserIds = userRolesData.map((userRole) => userRole.id);

        // Fetch personal information
        const { data: personalInfoData, error: personalInfoError } =
          await supabase
            .from("personal-information")
            .select("*")
            .in("id", mentorUserIds);

        if (personalInfoError) throw new Error(personalInfoError.message);

        // Fetch employment history
        const { data: employmentHistoryData, error: employmentHistoryError } =
          await supabase
            .from("employment-history")
            .select("*")
            .in("user", mentorUserIds);

        if (employmentHistoryError)
          throw new Error(employmentHistoryError.message);

        // Fetch academic information
        const { data: academicInfoData, error: academicInfoError } =
          await supabase
            .from("academic-information")
            .select("*")
            .in("user", mentorUserIds);

        if (academicInfoError) throw new Error(academicInfoError.message);

        // Fetch skills and interests
        const { data: skillsInterestsData, error: skillsInterestsError } =
          await supabase
            .from("skills-interests")
            .select("*")
            .in("id", mentorUserIds);

        if (skillsInterestsError) throw new Error(skillsInterestsError.message);

        // Combine all data into a single array of mentors
        const formattedMentors: Mentor[] = personalInfoData.map(
          (personalInfo) => {
            const employmentHistory = employmentHistoryData.filter(
              (history) => history.user === personalInfo.id,
            );
            const academicInfo = academicInfoData.filter(
              (info) => info.user === personalInfo.id,
            );
            const skillsInterests = skillsInterestsData.find(
              (si) => si.id === personalInfo.id,
            );

            return {
              id: personalInfo.id,
              name: `${personalInfo.first_name} ${personalInfo.last_name}`,
              occupations: employmentHistory.map(
                (history) => history.designation,
              ),
              rating: 4.5, // Assuming a fixed rating for now
              companies: employmentHistory.map((history) => history.duties), // Adjust as needed
              profile: personalInfo.profile,
              skills: skillsInterests ? skillsInterests.skills.split(",") : [],
              interests: skillsInterests
                ? skillsInterests.interests.split(",")
                : [],
              education: academicInfo.map((info) => ({
                institution: info.institution_name,
                course: info.course,
                specialization: info.specialization,
                graduationYear: info.graduation_year,
              })),
            };
          },
        );

        setMentors(formattedMentors);
      } catch (err) {
        setError((err as Error).message);
        console.error("Error fetching mentors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {loading
        ? Array(6)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="w-full relative animate-pulse">
                <Skeleton className="w-full h-[150px] rounded-xl" />
                <div className="absolute top-0 flex items-center justify-center left-0 right-0 bottom-0 w-full h-full">
                  <Loader className={"animate-spin  text-muted-foreground"} />
                </div>
              </div>
            ))
        : mentors.map((mentor) => <MentorCard key={mentor.id} data={mentor} />)}
    </div>
  );
};

export default MentorsList;
