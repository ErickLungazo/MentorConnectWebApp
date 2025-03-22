import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";

const RESOURCE_ICONS = {
  file: "📄",
  website: "🌐",
  youtube: "🎥",
};

const MyMentorsResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("User not authenticated.");
        setLoading(false);
        return;
      }

      // Step 1: Get the mentor(s) matched to the current mentee
      const { data: matches, error: matchError } = await supabase
        .from("matches")
        .select("mentor_id")
        .eq("mentee_id", user.id)
        .eq("is_approved", true);

      if (matchError) {
        console.error("Error fetching mentor matches:", matchError.message);
        setLoading(false);
        return;
      }

      if (!matches || matches.length === 0) {
        console.warn("No matched mentors found.");
        setLoading(false);
        return;
      }

      const mentorIds = matches.map((match) => match.mentor_id);

      // Step 2: Fetch resources uploaded by these mentors
      const { data: resourcesData, error: resourcesError } = await supabase
        .from("resources")
        .select("id, type, source_url, name, created_at, user_id")
        .in("user_id", mentorIds)
        .order("created_at", { ascending: false });

      if (resourcesError) {
        console.error("Error fetching resources:", resourcesError.message);
      } else {
        setResources(resourcesData || []);
      }
      setLoading(false);
    };

    fetchResources();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mentor's Shared Resources</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-5">
            <Loader className="animate-spin" />
          </div>
        ) : resources.length === 0 ? (
          <p className="text-center py-5">
            No resources found from your mentor(s).
          </p>
        ) : (
          <Table>
            <TableCaption>Resources uploaded by your mentor(s).</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Source URL</TableHead>
                <TableHead className="text-right">Date Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>{RESOURCE_ICONS[resource.type] || "📁"}</TableCell>
                  <TableCell>{resource.name || "Untitled"}</TableCell>
                  <TableCell>
                    <a
                      href={resource.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {resource.source_url}
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(resource.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MyMentorsResources;
