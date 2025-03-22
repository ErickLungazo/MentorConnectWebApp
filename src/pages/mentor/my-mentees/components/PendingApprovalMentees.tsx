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
import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";

interface Mentee {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  address: string;
}

const PendingApprovalMentees = () => {
  const [pendingMentees, setPendingMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingMentees = async () => {
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

      const mentorId = user.id;

      // Fetch mentees with pending approval
      const { data: matches, error: matchError } = await supabase
        .from("matches")
        .select("mentee_id")
        .eq("mentor_id", mentorId)
        .eq("is_approved", false);

      if (matchError) {
        setError("Error fetching pending approval mentees.");
        setLoading(false);
        return;
      }

      if (!matches.length) {
        setPendingMentees([]);
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
        setPendingMentees(mentees || []);
      }

      setLoading(false);
    };

    fetchPendingMentees();
  }, []);

  const approveMentee = async (menteeId: string) => {
    // Get the logged-in user (mentor ID)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Failed to fetch user authentication details.");
      return;
    }

    const mentorId = user.id;

    // Update the match record to set is_approved to true
    const { error: updateError } = await supabase
      .from("matches")
      .update({ is_approved: true })
      .eq("mentee_id", menteeId)
      .eq("mentor_id", mentorId);

    if (updateError) {
      setError("Error approving mentee.");
    } else {
      // Refetch pending mentees after approval
      setPendingMentees((prevMentees) =>
        prevMentees.filter((mentee) => mentee.id !== menteeId),
      );
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (pendingMentees.length === 0) return <div>No pending mentees.</div>;

  return (
    <Table>
      <TableCaption>List of mentees awaiting approval.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>SNo</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pendingMentees.map((mentee, index) => (
          <TableRow key={mentee.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell className="font-medium">
              <Link to={`${mentee.id}`}>
                <Button className={"p-0"} variant={"link"}>
                  {mentee.first_name} {mentee.last_name}
                </Button>
              </Link>
            </TableCell>
            <TableCell>{mentee.gender}</TableCell>
            <TableCell>{mentee.address}</TableCell>
            <TableCell>
              <Button onClick={() => approveMentee(mentee.id)}>Approve</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5}>
            Total Pending Mentees: {pendingMentees.length}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default PendingApprovalMentees;
