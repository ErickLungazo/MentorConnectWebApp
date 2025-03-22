// EmploymentHistoryTable.tsx
import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const SkillsAndInterestTable = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [employmentHistories, setEmploymentHistories] = useState<
        {
            id: string;
            designation: string;
            duties: string;
            recommendation_letter: string | null;
            start_date: string;
            end_date: string;
        }[]
    >([]);
    const [awards, setAwards] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchEmploymentHistory = async () => {
            setLoading(true);
            try {
                // Get the current user from Supabase
                const { data: userSession, error: userError } = await supabase.auth.getUser();
                if (userError || !userSession.user) {
                    console.error("Error getting user session:", userError?.message || "User not found");
                    toast.error("Failed to get user session. Please log in first.");
                    navigate("/login");
                    return;
                }
                const userId = userSession.user.id;

                // Fetch the employment history from the employment-history table
                const { data: employmentData, error: employmentError } = await supabase
                    .from("employment-history")
                    .select()
                    .eq("user", userId);

                if (employmentError) {
                    if (employmentError.status === 404) {
                        // No record found, set employmentHistories to an empty array
                        setEmploymentHistories([]);
                    } else {
                        console.error("Error fetching employment history:", employmentError.message);
                        toast.error(`Failed to fetch employment history: ${employmentError.message}`);
                    }
                } else {
                    // Records found, set employmentHistories
                    setEmploymentHistories(employmentData);
                }
            } catch (error) {
                console.error("Unexpected error:", error);
                toast.error("An unexpected error occurred. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        const fetchAwards = async () => {
            try {
                const { data, error } = await supabase.from("awards").select("*");
                if (error) {
                    console.error("Error fetching awards:", error.message);
                    toast.error(`Failed to fetch awards: ${error.message}`);
                } else {
                    setAwards(data);
                }
            } catch (error) {
                console.error("Unexpected error fetching awards:", error);
                toast.error("An unexpected error occurred while fetching awards.");
            }
        };

        fetchEmploymentHistory();
        fetchAwards();
    }, [navigate]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><Loader className="animate-spin" /></div>;
    }

    if (employmentHistories.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>No employment history found.</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <Table>
                <TableCaption>Your Employment History</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Designation</TableHead>
                        <TableHead>Duties</TableHead>
                        <TableHead>Recommendation Letter</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employmentHistories.map((history) => (
                        <TableRow key={history.id}>
                            <TableCell className="font-medium">{history.designation}</TableCell>
                            <TableCell>{history.duties}</TableCell>
                            <TableCell>
                                {history.recommendation_letter ? (
                                    <a href={history.recommendation_letter} target="_blank" rel="noopener noreferrer">
                                        View Recommendation Letter
                                    </a>
                                ) : (
                                    "N/A"
                                )}
                            </TableCell>
                            <TableCell>{format(new Date(history.start_date), "PPP")}</TableCell>
                            <TableCell>{format(new Date(history.end_date), "PPP")}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default SkillsAndInterestTable;