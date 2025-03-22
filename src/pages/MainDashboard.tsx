// MainDashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase.ts"; // Adjust the path as necessary
import { toast } from "sonner"; // Adjust the path as necessary

const MainDashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkUserRoleAndOnboardingStatus = async () => {
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
          setLoading(false);
          return;
        }

        const userId = userSession.user.id;

        // Fetch the user's role from the user_role table
        const { data: userRoleData, error: roleError } = await supabase
          .from("user_role")
          .select(`role(name)`)
          .eq("id", userId)
          .single();

        console.log(userRoleData);

        if (roleError) {
          console.error("Error fetching user role:", roleError.message);
        } else {
          setUserRole(userRoleData?.role?.name);
        }

        // Fetch the user's onboarding status from the on-boarding-status table
        const { data: onboardingData, error: onboardingError } = await supabase
          .from("on-boarding-status")
          .select()
          .eq("id", userId)
          .single();

        if (onboardingError) {
          console.error(
            "Error fetching onboarding status:",
            onboardingError.message,
          );
          setOnboardingComplete(false);
        } else {
          setOnboardingComplete(true);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setOnboardingComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserRoleAndOnboardingStatus();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log("Checking Errors", "Here we reached");

  if (!userRole) {
    navigate("/user-role");
    return null;
  }

  if (!onboardingComplete) {
    navigate("/on-boarding/personal-information");
    return null;
  }

  if (userRole) {
    navigate(`/${userRole}`);
    return null;
  }
};

export default MainDashboard;
