import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { DownloadCloud, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button.tsx";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  job_details: string | null;
  due_date: string;
  vacancies: number;
  status: string;
  organisation: {
    name: string;
    about: string;
    logo: string;
  } | null;
}

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("opportunities")
          .select(
            `id, title, description, job_details, due_date, vacancies, status, 
             organisation:org (name, about, logo)`,
          )
          .eq("id", id)
          .single();

        if (error) throw error;
        setJob(data);
      } catch (error) {
        toast.error("Failed to fetch job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  return (
    <div className="p-4 space-y-4">
      {loading ? (
        <Loader className="animate-spin mx-auto" />
      ) : job ? (
        <>
          {/* Job Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              {job.organisation?.logo && (
                <img
                  src={job.organisation.logo}
                  alt={job.organisation.name}
                  className="h-16 w-16 rounded-full"
                />
              )}
            </CardHeader>
            <CardContent className={"flex flex-column gap-3 flex-col"}>
              <p className="text-lg font-semibold">{job.organisation?.name}</p>
              <p className="text-gray-600">{job.organisation?.about}</p>

              {job.job_details && (
                <a href={job.job_details} className="" target={"_blank"}>
                  <Button size={"sm"} variant={"secondary"}>
                    <DownloadCloud />
                    Download
                  </Button>
                </a>
              )}
              <p className="text-sm mt-2 text-gray-500">
                Due Date: {new Date(job.due_date).toDateString()}
              </p>
              <p className="text-sm">Vacancies: {job.vacancies}</p>
              <p
                className={`text-sm font-bold ${
                  job.status === "OPEN" ? "text-green-600" : "text-red-600"
                }`}
              >
                {job.status}
              </p>
            </CardContent>
          </Card>

          {/* Job Description Card */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-full">
                <ReactMarkdown>{job.description}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-center">Job not found.</p>
      )}
    </div>
  );
};

export default JobDetails;
