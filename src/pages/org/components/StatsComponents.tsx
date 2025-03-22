import React, { useEffect, useState } from "react";
import { Briefcase, GraduationCap, Paperclip } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Ensure this path is correct
import { toast } from "sonner";

// Define types for stats
interface Stat {
  title: string;
  count: number;
  href: string;
  icon: React.ElementType;
}

const StatsComponent: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([
    { title: "Jobs Posted", count: 0, href: "/org/jobs", icon: Briefcase },
    {
      title: "Internships Posted",
      count: 0,
      href: "/org/internships",
      icon: GraduationCap,
    },
    {
      title: "Attachments Posted",
      count: 0,
      href: "/org/attachments",
      icon: Paperclip,
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get logged-in user
        const { data: userSession, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userSession?.user) {
          toast.error("User not authenticated.");
          return;
        }
        const userId = userSession.user.id;

        // Fetch organization ID
        const { data: orgData, error: orgError } = await supabase
          .from("organisation-information")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (orgError || !orgData) {
          toast.error("Organization not found.");
          return;
        }

        const orgId = orgData.id;

        // Fetch counts from database
        const queries = [
          supabase
            .from("opportunities")
            .select("id", { count: "exact" })
            .eq("org", orgId)
            .eq("type", "job"),
          supabase
            .from("opportunities")
            .select("id", { count: "exact" })
            .eq("org", orgId)
            .eq("type", "internship"),
          supabase
            .from("opportunities")
            .select("id", { count: "exact" })
            .eq("org", orgId)
            .eq("type", "attachment"),
        ];

        const results = await Promise.all(queries);
        const [jobs, internships, attachments] = results.map(
          (res) => res.count || 0,
        );

        // Update state with fetched counts
        setStats([
          {
            title: "Jobs Posted",
            count: jobs,
            href: "/org/jobs",
            icon: Briefcase,
          },
          {
            title: "Internships Posted",
            count: internships,
            href: "/org/internships",
            icon: GraduationCap,
          },
          {
            title: "Attachments Posted",
            count: attachments,
            href: "/org/attachments",
            icon: Paperclip,
          },
        ]);
      } catch (error) {
        toast.error("An error occurred while fetching stats.");
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <a
          key={index}
          href={stat.href}
          className="bg-white rounded-xl p-5 flex flex-col items-center border-[1.5px] text-center hover:bg-gray-100 transition"
        >
          <stat.icon className="h-8 w-8 text-blue-500 mb-3" />
          <h3 className="text-xl font-semibold">{stat.count}</h3>
          <p className="text-gray-600">{stat.title}</p>
        </a>
      ))}
    </div>
  );
};

export default StatsComponent;
