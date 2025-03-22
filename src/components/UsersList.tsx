import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";

// Define User Type
interface User {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  address: string;
  profile: string;
  role?: string; // Role is optional since it’s fetched separately
}

interface UsersListProps {
  setActiveUserId: (id: string | null) => void;
  activeUserId: string;
}

const UsersList: React.FC<UsersListProps> = ({
  setActiveUserId,
  activeUserId,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      try {
        // 1️⃣ Get the logged-in user's ID
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError || !sessionData.session?.user.id) {
          throw new Error("Failed to retrieve logged-in user's ID");
        }
        const loggedInUserId = sessionData.session.user.id;

        // 2️⃣ Query the matches table for relevant entries
        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select("mentee_id, mentor_id")
          .or(`mentee_id.eq.${loggedInUserId},mentor_id.eq.${loggedInUserId}`);

        if (matchesError || !matchesData) {
          throw new Error("Failed to fetch matches data");
        }

        // Extract unique user IDs (both mentees and mentors)
        const userIdsSet = new Set<string>();
        matchesData.forEach((match) => {
          userIdsSet.add(match.mentee_id);
          userIdsSet.add(match.mentor_id);
        });

        const userIdsArray = Array.from(userIdsSet);

        // 3️⃣ Fetch personal information for the retrieved user IDs
        const { data: personalInfo, error: personalError } = await supabase
          .from("personal-information")
          .select("id, first_name, last_name, gender, address, profile")
          .in("id", userIdsArray);

        if (personalError || !personalInfo) {
          throw new Error("Failed to fetch personal information");
        }

        // 4️⃣ Fetch roles for the retrieved users
        const { data: userRoles, error: roleError } = await supabase
          .from("user_role")
          .select("id, roles(name)")
          .in("id", userIdsArray);

        if (roleError || !userRoles) {
          throw new Error("Failed to fetch user roles");
        }

        // Create a mapping of user IDs to roles
        const roleMap = userRoles.reduce(
          (acc, userRole) => {
            acc[userRole.id] = userRole.roles?.name || "Unknown";
            return acc;
          },
          {} as Record<string, string>,
        );

        // Merge role data into personal information
        const mergedUsers = personalInfo.map((user) => ({
          ...user,
          role: roleMap[user.id] || "No Role Assigned",
        }));

        setUsers(mergedUsers);
      } catch (error) {
        console.error("Error fetching users:", error.message);
        toast.error("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <section className="p-2 bg-white rounded-xl">
      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div>
          <ul className={"flex flex-col gap-1"}>
            {users.map((user) => (
              <li
                className={
                  "flex py-2 border hover:bg-muted cursor-pointer rounded-xl p-2 items-center gap-2"
                }
                key={user.id}
                onClick={() =>
                  setActiveUserId(activeUserId === user.id ? null : user.id)
                }
              >
                <Avatar>
                  <AvatarImage src={user.profile} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className={"text-sm font-semibold"}>
                    {user.first_name} {user.last_name}
                  </span>
                  <div className="">
                    <Badge>{user.role}</Badge>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default UsersList;
