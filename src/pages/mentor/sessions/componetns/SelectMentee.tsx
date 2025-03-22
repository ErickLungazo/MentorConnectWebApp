import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase.ts";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { ScheduleMeetingForm } from "@/pages/mentor/my-mentees/components/ScheduleMeeting.tsx"; // Import Button component
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button.tsx";

interface SelectMenteeProps {
  mentorId: string;
}

const SelectMentee: React.FC<SelectMenteeProps> = ({ mentorId }) => {
  const [mentees, setMentees] = useState<any[]>([]);
  const [selectedMentees, setSelectedMentees] = useState<string[]>([]); // State for selected mentees
  const [loadingMentees, setLoadingMentees] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  // Fetch mentees from the matches table
  useEffect(() => {
    if (!mentorId) {
      setError("Mentor ID is missing.");
      return;
    }

    const fetchMentees = async () => {
      setLoadingMentees(true);
      try {
        // Step 1: Fetch mentee IDs from matches table
        const { data: matches, error } = await supabase
          .from("matches")
          .select("mentee_id")
          .eq("mentor_id", mentorId)
          .eq("is_approved", true); // Only approved mentees

        if (error) throw new Error(`Failed to fetch matches: ${error.message}`);
        if (!matches.length) return setMentees([]);

        // Extract mentee IDs
        const menteeIds = matches.map((match) => match.mentee_id);

        // Step 2: Fetch mentee details from personal_information table
        const { data: menteeDetails, error: menteeError } = await supabase
          .from("personal-information") // ✅ Fixed table name (was "personal-information")
          .select("id, first_name, last_name, profile")
          .in("id", menteeIds);

        if (menteeError)
          throw new Error(`Failed to fetch mentees: ${menteeError.message}`);

        setMentees(menteeDetails);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingMentees(false);
      }
    };

    fetchMentees();
  }, [mentorId]);

  // Handle checkbox selection
  const toggleMenteeSelection = (menteeId: string) => {
    setSelectedMentees(
      (prevSelected) =>
        prevSelected.includes(menteeId)
          ? prevSelected.filter((id) => id !== menteeId) // Remove if already selected
          : [...prevSelected, menteeId], // Add if not selected
    );
  };

  // Log selected mentees when "Schedule Meeting" is clicked
  const handleScheduleMeeting = () => {
    console.log("Selected Mentees:", selectedMentees);
  };

  return (
    <section className="flex flex-col gap-3">
      <h1 className="font-semibold text-xl">My Mentees</h1>

      {/* Display Loading or Error */}
      {loadingMentees ? (
        <div className="flex justify-center py-5">
          <Loader2 className="animate-spin w-6 h-6" />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : mentees.length === 0 ? (
        <p className="text-gray-500">No mentees assigned yet.</p>
      ) : (
        <>
          <Table>
            <TableCaption>List of your mentees.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Select</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mentees.map((mentee) => (
                <TableRow key={mentee.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedMentees.includes(mentee.id)}
                      onCheckedChange={() => toggleMenteeSelection(mentee.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <img
                      src={mentee.profile || "/default-avatar.png"}
                      alt={`${mentee.first_name} ${mentee.last_name}`}
                      className="w-10 h-10 rounded-full"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {mentee.first_name} {mentee.last_name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Display "Schedule Meeting" Button if at least one mentee is selected */}
          {selectedMentees.length > 0 && (
            <React.Fragment key={selectedMentees.length + 1}>
              <Dialog
                open={isScheduleDialogOpen}
                onOpenChange={setIsScheduleDialogOpen}
              >
                <DialogTrigger>
                  <Button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
                    Schedule Meeting
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Meeting</DialogTitle>
                    <DialogDescription>Schedule</DialogDescription>
                  </DialogHeader>{" "}
                  <ScheduleMeetingForm
                    setIsScheduleDialogOpen={setIsScheduleDialogOpen}
                    mentorId={mentorId}
                    menteeId={selectedMentees}
                  />
                </DialogContent>
              </Dialog>
            </React.Fragment>
          )}
        </>
      )}
    </section>
  );
};

export default SelectMentee;
