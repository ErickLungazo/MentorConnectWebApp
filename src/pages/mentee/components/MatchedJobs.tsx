import React, { useEffect, useState } from "react";
import MatchedJobDetails from "./MatchedJobDetails.tsx";
import { supabase } from "@/lib/supabase"; // Ensure Supabase is correctly configured
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import SubmitApplicationDocuments from "@/components/SubmitApplicationDocuments.tsx";
import { Link } from "react-router-dom";

const MatchedJobs = ({ matches }: { matches: any[] }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingApplications, setPendingApplications] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: userSession, error } = await supabase.auth.getUser();
      if (error || !userSession?.user) return;
      setUserId(userSession.user.id);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchPendingApplications = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("oppo_id")
        .eq("mentee_id", userId)
        .eq("status", "PENDING");

      if (error) {
        console.error("Error fetching applications:", error);
        return;
      }

      // Store pending applications as a Set for quick lookup
      setPendingApplications(new Set(data.map((app) => app.oppo_id)));
    };

    fetchPendingApplications();
  }, [userId]);

  // Filter matches where score >= 5
  const filteredMatches = matches.filter((match) => match.score >= 1);

  return (
    <div>
      {filteredMatches.length === 0 ? (
        <p className="text-gray-600 text-center">No suitable matches found.</p>
      ) : (
        <ul className="space-y-2">
          {filteredMatches.map((match) => {
            const hasPendingApplication = pendingApplications.has(match.job_id);

            return (
              <li key={match.job_id} className="border p-3 rounded-md">
                <MatchedJobDetails id={match.job_id} />
                <p className="font-semibold">
                  Score: {(match.score / 10) * 100}%
                </p>
                <p className="text-sm text-gray-700">{match.reason}</p>
                <div className="pt-3 w-full flex gap-3 items-center justify-end">
                  <Link to={`${match.job_id}`}>
                    <Button variant={"secondary"}>More Details</Button>
                  </Link>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button disabled={hasPendingApplication}>
                        {hasPendingApplication
                          ? "Application Pending"
                          : "Apply"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Your Application</DialogTitle>
                        <DialogDescription>
                          Please confirm before applying for this position.
                        </DialogDescription>
                      </DialogHeader>
                      <SubmitApplicationDocuments oppo_id={match.job_id} />
                    </DialogContent>
                  </Dialog>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MatchedJobs;
