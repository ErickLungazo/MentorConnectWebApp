import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";

import { Loader2, Play } from "lucide-react";
import { supabase } from "@/lib/supabase.ts";
import SelectMentee from "@/pages/mentor/sessions/componetns/SelectMentee.tsx";

const ManageSessionsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        console.log("data", data);
        if (error) throw error;
        setUser(data?.user);
      } catch (err: any) {
        setError(err.message);
        console.log(err.message);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  // Fetch sessions once the user is retrieved
  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      setLoadingSessions(true);
      try {
        const { data, error } = await supabase
          .from("sessions")
          .select("*")
          .eq("mentor_id", user.id) // Filter by logged-in mentor
          .order("created_at", { ascending: false });

        if (error) throw error;

        setSessions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [user]);

  return (
    <section className="flex flex-col gap-3">
      {/* Header */}
      <div className="bg-white p-5 border rounded-xl flex items-center justify-between gap-3">
        <h1 className="font-semibold text-xl">Manage Sessions</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button>Create Session</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Select Mentor(s)</SheetTitle>
              <SheetDescription>Create a session</SheetDescription>
            </SheetHeader>

            <SelectMentee mentorId={user?.id} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Created Sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUser ? (
            <div className="flex justify-center py-5">
              <Loader2 className="animate-spin w-6 h-6" />
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : loadingSessions ? (
            <div className="flex justify-center py-5">
              <Loader2 className="animate-spin w-6 h-6" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-gray-500">No sessions found.</p>
          ) : (
            <Table>
              <TableCaption>List of your scheduled sessions.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead>Agenda</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Duration (mins)</TableHead>
                  <TableHead>Start Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {session.topic}
                    </TableCell>
                    <TableCell>{session.agenda}</TableCell>
                    <TableCell>
                      {new Date(session.start_time).toLocaleString()}
                    </TableCell>
                    <TableCell>{session.duration}</TableCell>
                    <TableCell>
                      <a
                        href={session.start_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 flex items-center  hover:underline"
                      >
                        Start Session
                        <Play className={"w-4 h-4 ms-2"} />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <p>Manage your mentorship sessions effectively.</p>
        </CardFooter>
      </Card>
    </section>
  );
};

export default ManageSessionsPage;
