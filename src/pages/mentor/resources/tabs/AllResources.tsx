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

const AllResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("User not authenticated.");
        return;
      }

      const { data, error } = await supabase
        .from("resources")
        .select("id, type, source_url, name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching resources:", error.message);
      } else {
        setResources(data || []);
      }
      setLoading(false);
    };

    fetchResources();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Uploaded Resources</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-5">
            <Loader className="animate-spin" />
          </div>
        ) : resources.length === 0 ? (
          <p className="text-center py-5">No resources found.</p>
        ) : (
          <Table>
            <TableCaption>List of your uploaded resources.</TableCaption>
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

export default AllResources;
