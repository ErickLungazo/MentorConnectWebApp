import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DownloadCloud, Loader } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button.tsx";

interface AppliedJob {
  id: string;
  created_at: string;
  submitted_documents: string;
  opportunity: {
    id: string;
    title: string;
    description: string;
    organisation: {
      name: string;
      logo: string;
    } | null;
  } | null;
}

const AppliedJobs: React.FC = () => {
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      setLoading(true);
      try {
        // Get the logged-in user
        const { data: userSession, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userSession?.user) {
          toast.error("You need to be logged in.");
          return;
        }

        const userId = userSession.user.id;

        // Fetch applications with related opportunity data
        const { data, error } = await supabase
          .from("applications")
          .select(
            `id, created_at, submitted_documents, 
             opportunity:oppo_id (id, title, description, organisation:org (name, logo))`,
          )
          .eq("mentee_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setAppliedJobs(data);
      } catch (error) {
        toast.error("Failed to fetch applied jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, []);

  return (
    <div className="">
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle>My Applied Jobs</CardTitle>
          <CardDescription>
            List of all the jobs you have applied for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader className="animate-spin mx-auto" />
          ) : appliedJobs.length === 0 ? (
            <p className="text-gray-600 text-center">
              No job applications found.
            </p>
          ) : (
            <Table className="w-full  ">
              <TableCaption>List of all your applied jobs.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>SNo</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Submitted Document</TableHead>
                  <TableHead>Applied Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appliedJobs.map((job, index) => (
                  <TableRow key={job.id}>
                    <TableCell>{index + 1}</TableCell>{" "}
                    <TableCell className="font-medium">
                      {job.opportunity?.title}
                    </TableCell>
                    <TableCell className="flex items-center space-x-2">
                      {job.opportunity?.organisation?.logo && (
                        <img
                          src={job.opportunity.organisation.logo}
                          alt={job.opportunity.organisation.name}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <span>{job.opportunity?.organisation?.name}</span>
                    </TableCell>
                    <TableCell className="truncate max-w-xs">
                      {job.opportunity?.description}
                    </TableCell>
                    <TableCell>
                      <a
                        href={job.submitted_documents}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size={"sm"}>
                          Download <DownloadCloud />
                        </Button>
                      </a>
                    </TableCell>
                    <TableCell>
                      {new Date(job.created_at).toDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppliedJobs;
