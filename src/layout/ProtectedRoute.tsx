import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase.ts";
import { toast } from "sonner"; // Adjust path if necessary
import { useUserRoleStore } from "@/store/useUserRoleStore";
import { UserRole } from "@/types/customTypes.ts"; // Import Zustand store

const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const { setRole, role: loggedInUserRole } = useUserRoleStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Get the session
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const session = sessionData.session;
        console.log("session", session);
        setIsAuthenticated(!!session);

        if (session) {
          const userId: string = session.user.id;

          console.log("userId", userId);

          // Fetch user role with strict typing
          const { data: userRoleData, error: roleError } = await supabase
            .from("user_role")
            .select("role(name)")
            .eq("id", userId)
            .single<UserRole>(); // Type assertion for strict typing

          console.log("userRoleData", userRoleData);
          // const { data: userRoleData, error: roleError } = await supabase
          //   .from("user_role")
          //   .select("role(name)"); // Fetch all records, no filter applied
          //
          // if (roleError) {
          //   console.error("Error fetching roles:", roleError);
          // } else {
          //   console.log("All roles:", userRoleData);
          // }

          // if (roleError) throw roleError;

          setRole(userRoleData?.role?.name ?? "Guest"); // Default to "Guest" if no role is found
          console.log("role", loggedInUserRole);
        }
      } catch (error) {
        console.error("Error checking authentication or fetching role:", error);
        toast.error("Login to continue");
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, [setRole]);

  if (isAuthenticated === null) {
    // Loading state
    return <div>Loading...</div>;
  }
  // return <Outlet />;
  return isAuthenticated ? (
    children ? (
      children
    ) : (
      <Outlet />
    )
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;
