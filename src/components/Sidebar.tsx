// src/Sidebar.tsx
import React, { useEffect, useState } from "react";
import { icons, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase.ts";

const mentorSidebarMenus = [
  {
    title: "Home",
    url: "/",
    icon: icons.House,
  },
  {
    title: "Profile",
    url: "/mentor/profile",
    icon: icons.User,
  },
  {
    title: "Mentees",
    url: "/mentor/mentees",
    icon: icons.Users,
  },
  {
    title: "Sessions",
    url: "/mentor/sessions",
    icon: icons.Calendar,
  },
  {
    title: "Resources",
    url: "/mentor/resources",
    icon: icons.Folder,
  },
  {
    title: "Settings",
    url: "/mentor/settings",
    icon: icons.Settings,
  },
];

const menteeSidebarMenus = [
  {
    title: "Home",
    url: "/",
    icon: icons.House,
  },
  {
    title: "Profile",
    url: "/mentee/profile",
    icon: icons.User,
  },
  {
    title: "Mentors",
    url: "/mentee/mentors",
    icon: icons.Users,
  },
  {
    title: "Sessions",
    url: "/mentee/sessions",
    icon: icons.Calendar,
  },
  {
    title: "Resources",
    url: "/mentee/resources",
    icon: icons.Folder,
  },
  {
    title: "Settings",
    url: "/mentee/settings",
    icon: icons.Settings,
  },
];

const Sidebar = () => {
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

  let menus = [];
  if (userRole === "mentor") {
    menus = mentorSidebarMenus;
  } else if (userRole === "mentee") {
    menus = menteeSidebarMenus;
  } else {
    menus = []; // or some default menu
  }

  return (
    <aside className="border-e bg-primary w-[300px] min-w-[300px] max-w-[300px] min-h-screen">
      {/*<div className="pb-5 border-b">*/}
      {/*  <h1 className="font-semibold text-xl text-primary">MentorConnect</h1>*/}
      {/*</div>*/}

      {loading ? (
        <div className="w-full p-5 flex items-center min-h-[200px] justify-center">
          <Loader className={"w-5 h-5 animate-spin"} />
        </div>
      ) : (
        <div className="w-full">
          <ul className="flex flex-col w-full py-3 px-3 gap-2">
            {menus.map((item, index) => (
              <li className="w-full" key={index}>
                <Link
                  to={item.url}
                  className="w-full px-2 py-3 group flex items-center border rounded border-transparent hover:border-primary hover:bg-muted transition-colors duration-300"
                >
                  <item.icon className="mr-2 w-6 h-6 text-primary-foreground group-hover:text-primary duration-300" />
                  <span className="text-primary-foreground group-hover:text-primary duration-300">
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
