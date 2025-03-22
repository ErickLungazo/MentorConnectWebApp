import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Play } from "lucide-react";

// Define types for session and user
interface Session {
  id: number;
  topic: string;
  agenda: string;
  start_time: string;
  duration: number;
  mentor_id: string;
  join_url: string;
  created_at: string;
}

interface User {
  id: string;
}

// Component
const MySessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        toast.error("Failed to fetch user");
        console.error("Error fetching user:", error);
        return;
      }
      setUser({ id: data.user.id });
    };

    fetchUser();
  }, []);

  // Fetch sessions for logged-in mentee
  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("mentee_id", user.id)
        .order("created_at", { ascending: false }); // Order by latest first

      if (error) {
        toast.error("Failed to fetch sessions");
        console.error("Error fetching sessions:", error);
      } else {
        setSessions(data as Session[]);
      }
      setLoading(false);
    };

    fetchSessions();
  }, [user]);

  return (
    <section className="">
      <div className="bg-white rounded-xl p-5 border">
        <h2 className="text-xl font-semibold mb-4">My Sessions</h2>
        {loading ? (
          <p>Loading...</p>
        ) : !user ? (
          <p>Error fetching user. Please log in.</p>
        ) : sessions.length === 0 ? (
          <p>No sessions found.</p>
        ) : (
          <Table>
            <TableCaption>Your scheduled mentorship sessions.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>SNo</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Agenda</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Join Session</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session, index) => (
                <TableRow key={session.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className={"font-semibold"}>
                    {session.topic}
                  </TableCell>
                  <TableCell>{session.agenda}</TableCell>
                  <TableCell>
                    {new Date(session.start_time).toLocaleString()}
                  </TableCell>{" "}
                  <TableCell>{session.duration} mins</TableCell>{" "}
                  <TableCell>
                    {new Date(session.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <a
                      href={session.join_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      <Button>
                        Join
                        <Play />
                      </Button>
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="text-right font-semibold">
                  Total Sessions: {sessions.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </div>
    </section>
  );
};

export default MySessionsPage;
