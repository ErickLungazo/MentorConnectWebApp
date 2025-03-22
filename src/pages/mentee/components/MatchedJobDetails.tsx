import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader } from "lucide-react";

const MatchedJobDetails = ({ id }: { id: string }) => {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("opportunities")
          .select("title, type, due_date, description")
          .eq("id", id)
          .single();

        if (error) throw error;
        setJob(data);
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  if (loading) return <Loader className="animate-spin mx-auto" />;
  if (!job) return <p className="text-red-500">Job details not found.</p>;

  return (
    <div className="border-b pb-2 mb-2">
      <p className="text-lg font-semibold">{job.title}</p>
      <p className="text-sm text-gray-500">Type: {job.type}</p>
      <p className="text-sm text-gray-500">Due Date: {job.due_date}</p>
    </div>
  );
};

export default MatchedJobDetails;
