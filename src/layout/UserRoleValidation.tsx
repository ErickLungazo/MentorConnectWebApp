// src/UserRoleValidation.js
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { supabase } from "@/lib/supabase.ts";

const UserRoleValidation = ({ role }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        setLoading(false);
        return;
      }

      const userId = sessionData.session?.user.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_role")
        .select("role(name)")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        setLoading(false);
        return;
      }

      setUserRole(data.role.name);
      setLoading(false);
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return (
      <div className={"min-h-screen flex items-center justify-center p-5"}>
        Loading...
      </div>
    );
  }

  if (userRole !== role) {
    return (
      <div className={"min-h-screen p-5 flex items-center justify-center"}>
        You are not allowed
      </div>
    );
  }

  return (
    <div className={""}>
      <Outlet />
    </div>
  );
};

export default UserRoleValidation;
