import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";

type UserRole = {
  role: number;
  name: string;
};

const CompleteOnBoarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [missingSteps, setMissingSteps] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserDataAndRole = async () => {
      setLoading(true);
      try {
        // Get the current user from Supabase
        const { data: userSession, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userSession.user) {
          console.error(
            "Error getting user session:",
            userError?.message || "User not found",
          );
          toast.error("Failed to get user session. Please log in first.");
          navigate("/login");
          return;
        }
        const userId = userSession.user.id;

        // Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from("user_role")
          .select(
            `
                        role,
                        roles (
                            name
                        )
                    `,
          )
          .eq("id", userId)
          .single();

        if (roleError) {
          console.error("Error fetching user role:", roleError.message);
          toast.error("Failed to fetch user role");
          return;
        }

        const userRole = {
          role: roleData.role,
          name: roleData.roles.name,
        };
        setUserRole(userRole);

        // Common required checks for all roles
        const commonChecks = await Promise.all([
          // Personal information check
          supabase
            .from("personal-information")
            .select()
            .eq("id", userId)
            .single(),
        ]);

        const [personalInfo] = commonChecks;

        // Initialize missing steps array
        const missingSteps: string[] = [];

        // Check for personal information
        if (!personalInfo.data) {
          missingSteps.push("Personal Information");
        }

        // Additional checks based on user role
        switch (userRole.name.toLowerCase()) {
          case "mentee":
            {
              const additionalChecks = await Promise.all([
                // Academic information check
                supabase
                  .from("academic-information")
                  .select()
                  .eq("user", userId),
                // Skills and interests check
                supabase
                  .from("skills-interests")
                  .select()
                  .eq("id", userId)
                  .single(),
                // Bio information check
                supabase
                  .from("bio-information")
                  .select()
                  .eq("id", userId)
                  .single(),
              ]);

              const [academicInfo, skillsInterests, bioInfo] = additionalChecks;

              // Check for academic information
              if (!academicInfo.data || academicInfo.data.length === 0) {
                missingSteps.push("Academic Qualifications");
              }

              // Check for skills and interests
              if (!skillsInterests.data) {
                missingSteps.push("Skills and Interests");
              }

              // Check for bio information
              if (!bioInfo.data) {
                missingSteps.push("My Bio");
              }
            }
            break;
          case "mentor":
            {
              const additionalChecks = await Promise.all([
                // Academic information check
                supabase
                  .from("academic-information")
                  .select()
                  .eq("user", userId),
                // Skills and interests check
                supabase
                  .from("skills-interests")
                  .select()
                  .eq("id", userId)
                  .single(),
                // Bio information check
                supabase
                  .from("bio-information")
                  .select()
                  .eq("id", userId)
                  .single(),
                // Employment history check
                supabase.from("employment-history").select().eq("user", userId),
              ]);

              const [
                academicInfo,
                skillsInterests,
                bioInfo,
                employmentHistoryData,
              ] = additionalChecks;

              // Check for academic information
              if (!academicInfo.data || academicInfo.data.length === 0) {
                missingSteps.push("Academic Qualifications");
              }

              // Check for skills and interests
              if (!skillsInterests.data) {
                missingSteps.push("Skills and Interests");
              }

              // Check for bio information
              if (!bioInfo.data) {
                missingSteps.push("My Bio");
              }

              // Check for employment history
              if (
                !employmentHistoryData.data ||
                employmentHistoryData.data.length === 0
              ) {
                missingSteps.push("Employment History");
              }
            }
            break;
          case "org":
            {
              const additionalChecks = await Promise.all([
                // Organisation information check
                supabase
                  .from("organisation-information")
                  .select()
                  .eq("user_id", userId)
                  .single(),
              ]);

              const [organisationInfo] = additionalChecks;

              // Check for organisation information
              if (!organisationInfo.data) {
                missingSteps.push("Organisation Information");
              }
            }
            break;
          default:
            console.error("Unknown user role:", userRole.name);
            toast.error("Unknown user role. Please contact support.");
            return;
        }

        // Set missing steps
        setMissingSteps(missingSteps);

        // Determine if all required steps are completed
        setIsComplete(missingSteps.length === 0);
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred. Please try again.");
        setIsComplete(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndRole();
  }, [navigate]);

  const completeOnBoarding = async () => {
    setLoading(true);
    try {
      const { data: userSession, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userSession.user) {
        toast.error("Failed to get user session. Please log in first.");
        return;
      }

      const { error } = await supabase
        .from("on-boarding-status")
        .insert([{ id: userSession.user.id }]);

      if (error) {
        console.error("Error marking onboarding as complete:", error.message);
        toast.error(`Failed to mark onboarding as complete: ${error.message}`);
      } else {
        toast.success("Onboarding completed successfully");
        navigate("/");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRequirementMessage = () => {
    if (missingSteps.length === 0) {
      return "All your information has been successfully filled out.";
    } else {
      return `Please ensure you have filled out the following steps: ${missingSteps.join(", ")}.`;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {loading ? (
        <div className="flex flex-col items-center">
          <Loader className="animate-spin h-10 w-10" />
          <p className="mt-2">Loading your onboarding information...</p>
        </div>
      ) : isComplete ? (
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold">Ready to Complete Onboarding</h1>
          <p className="text-lg">{getRequirementMessage()}</p>
          <p className="text-lg">
            Click the button below to finalize your onboarding process.
          </p>
          <Button onClick={completeOnBoarding} className="mt-4">
            Complete Process
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold">Incomplete Onboarding</h1>
          <p className="text-lg">
            It seems you haven't completed all the required steps.
          </p>
          <p className="text-lg">{getRequirementMessage()}</p>
        </div>
      )}
    </div>
  );
};

export default CompleteOnBoarding;
