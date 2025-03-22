// AcademicInformationTable.tsx
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

const AcademicInformationTable = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [academicInfos, setAcademicInfos] = useState<
        {
            institution_name: string;
            course: string;
            specialization: string;
            award: string;
            graduation_year: number;
            certificate: string;
        }[]
    >([]);
    const [awards, setAwards] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchAcademicInfo = async () => {
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

                // Fetch the academic information from the academic-information table
                const { data: academicInfoData, error: academicInfoError } = await supabase
                    .from("academic-information")
                    .select()
                    .eq("user", userId);

                if (academicInfoError) {
                    if (academicInfoError.status === 404) {
                        // No record found, set academicInfos to an empty array
                        setAcademicInfos([]);
                    } else {
                        console.error("Error fetching academic information:", academicInfoError.message);
                        toast.error(`Failed to fetch academic information: ${academicInfoError.message}`);
                    }
                } else {
                    // Records found, set academicInfos
                    setAcademicInfos(academicInfoData);
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

        fetchAcademicInfo();
        fetchAwards();
    }, [navigate]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><Loader className="animate-spin" /></div>;
    }

    if (academicInfos.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>No academic information found.</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <Table>
                <TableCaption>Your Academic Information</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Institution Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Specializations</TableHead>
                        <TableHead>Award</TableHead>
                        <TableHead>Graduation Year</TableHead>
                        <TableHead>Certificate</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {academicInfos.map((info) => {
                        const awardName = awards.find((award) => award.id === info.award)?.name || "N/A";
                        return (
                            <TableRow key={info.id}>
                                <TableCell className="font-medium">{info.institution_name}</TableCell>
                                <TableCell>{info.course}</TableCell>
                                <TableCell>{info.specialization}</TableCell>
                                <TableCell>{awardName}</TableCell>
                                <TableCell>{info.graduation_year}</TableCell>
                                <TableCell>
                                    <a href={info.certificate} target="_blank" rel="noopener noreferrer">
                                        View Certificate
                                    </a>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default AcademicInformationTable;