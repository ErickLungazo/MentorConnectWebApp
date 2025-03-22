import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase.ts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { MessageCircle, Video } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScheduleMeetingForm } from "@/pages/mentor/my-mentees/components/ScheduleMeeting.tsx";
import { useUserRoleStore } from "@/store/useUserRoleStore.ts";

interface Mentee {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  address: string;
}

const ApprovedMentees = () => {
  const [approvedMentees, setApprovedMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const { role: loggedInUserRole } = useUserRoleStore();

  useEffect(() => {
    const fetchApprovedMentees = async () => {
      setLoading(true);
      setError(null);

      // Get the logged-in user (mentor ID)
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Failed to fetch user authentication details.");
        setLoading(false);
        return;
      }

      setMentorId(user.id);

      // Fetch mentees with approved status

      const { data: matches, error: matchError } = await supabase
        .from("matches")
        .select("mentee_id")
        .eq("mentor_id", user.id)
        .eq("is_approved", true);

      if (matchError) {
        setError("Error fetching approved mentees.");
        setLoading(false);
        return;
      }

      if (!matches.length) {
        setApprovedMentees([]);
        setLoading(false);
        return;
      }

      // Fetch personal details of mentees
      const menteeIds = matches.map((match) => match.mentee_id);

      const { data: mentees, error: menteeError } = await supabase
        .from("personal-information")
        .select("id, first_name, last_name, gender, address")
        .in("id", menteeIds);

      if (menteeError) {
        setError("Error fetching mentees' personal information.");
      } else {
        setApprovedMentees(mentees || []);
      }

      setLoading(false);
    };

    fetchApprovedMentees();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (approvedMentees.length === 0) return <div>No approved mentees.</div>;

  return (
    <Table>
      <TableCaption>List of approved mentees.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>SNo</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Address</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {approvedMentees.map((mentee, index) => (
          <TableRow key={mentee.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell className="font-medium">
              <Link to={`${mentee.id}`}>
                <button className="text-blue-500 hover:underline focus:outline-none">
                  {mentee.first_name} {mentee.last_name}
                </button>
              </Link>
            </TableCell>
            <TableCell>{mentee.gender}</TableCell>
            <TableCell>{mentee.address}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Link to={`/${loggedInUserRole}/messages`}>
                  <Button size={"icon"} variant={"ghost"}>
                    <MessageCircle />
                  </Button>{" "}
                </Link>

                <Dialog
                  open={isScheduleDialogOpen}
                  onOpenChange={setIsScheduleDialogOpen}
                >
                  <DialogTrigger asChild={true}>
                    <Button size={"icon"} variant={"ghost"}>
                      <Video />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule a zoom meeting</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </DialogDescription>
                    </DialogHeader>
                    <ScheduleMeetingForm
                      menteeId={mentee.id}
                      mentorId={mentorId}
                      setIsScheduleDialogOpen={setIsScheduleDialogOpen}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5}>
            Total Approved Mentees: {approvedMentees.length}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default ApprovedMentees;
