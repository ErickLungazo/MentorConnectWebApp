import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import SubmitApplicationDocuments from "@/components/SubmitApplicationDocuments.tsx";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  due_date: string;
  vacancies: number;
  status: string;
}

interface OpportunitiesListProps {
  type: "internships" | "attachments" | "jobs";
}

const OpportunitiesList: React.FC<OpportunitiesListProps> = ({ type }) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [pendingApplications, setPendingApplications] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch logged-in user's ID
  useEffect(() => {
    const fetchUserId = async () => {
      const { data: user, error } = await supabase.auth.getUser();
      if (error || !user?.user) {
        toast.error("Failed to fetch user details.");
        return;
      }
      setUserId(user.user.id);
    };
    fetchUserId();
  }, []);

  // Fetch pending applications
  useEffect(() => {
    if (!userId) return;
    const fetchPendingApplications = async () => {
      try {
        const { data, error } = await supabase
          .from("applications")
          .select("oppo_id")
          .eq("mentee_id", userId)
          .eq("status", "PENDING");

        if (error) throw error;
        setPendingApplications(new Set(data.map((app) => app.oppo_id)));
      } catch (error) {
        toast.error("Failed to fetch pending applications.");
      }
    };
    fetchPendingApplications();
  }, [userId]);

  // Fetch opportunities
  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("opportunities")
          .select("id, title, description, due_date, vacancies, status")
          .eq("type", type)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOpportunities(data || []);
      } catch (error) {
        toast.error("Failed to fetch opportunities.");
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [type]);

  return (
    <div className="p-4">
      {loading ? (
        <Loader className="animate-spin mx-auto" />
      ) : opportunities.length === 0 ? (
        <p className="text-center">No opportunities found.</p>
      ) : (
        <Table>
          <TableCaption>List of {type} opportunities.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>SNo.</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Vacancies</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Apply</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((opportunity, index) => {
              const hasPendingApplication = pendingApplications.has(
                opportunity.id,
              );

              return (
                <TableRow key={opportunity.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    <Link to={opportunity.id}>
                      <Button variant={"link"}>{opportunity.title}</Button>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {new Date(opportunity.due_date).toDateString()}
                  </TableCell>
                  <TableCell>{opportunity.vacancies}</TableCell>
                  <TableCell
                    className={`font-bold ${
                      opportunity.status === "OPEN"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {opportunity.status}
                  </TableCell>
                  <TableCell>
                    {hasPendingApplication ? (
                      <p className="text-sm text-red-600">
                        Pending application
                      </p>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>Apply</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Are you sure you want to apply?
                            </DialogTitle>
                            <DialogDescription>
                              Ensure all details are correct before submitting.
                            </DialogDescription>
                          </DialogHeader>
                          <SubmitApplicationDocuments
                            oppo_id={opportunity.id}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default OpportunitiesList;
