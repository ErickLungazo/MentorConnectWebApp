import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserDetails } from "@/lib/fetchUserData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { onMatch } from "@/lib/matchUtils"; // Import the reusable match function

const MentorDetailsPage = () => {
  const { id } = useParams(); // Get userId from URL params
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const data = await getUserDetails(id!);
      setUserData(data);
      setLoading(false);
    };

    fetchUserData();
  }, [id]);

  if (loading) return <Loader className="mx-auto animate-spin my-10" />;

  if (!userData)
    return <p className="text-center text-red-500">User not found</p>;

  const {
    personalInfo,
    academicInfo,
    employmentHistory,
    skillsInterests,
    bioInfo,
  } = userData;

  // Function to handle match initiation
  const handleMatch = async () => {
    try {
      // Call the reusable onMatch function with default values
      await onMatch(id, 10, "User Initiated");
    } catch (error) {
      console.error("Error during match:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="flex justify-end lg:col-span-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="default">Connect with Mentor</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Connection</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to connect with this mentor? This action
                will register a match with a score of 10 and the reason "User
                Initiated".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleMatch}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row items-center">
            {/* Profile Image */}
            <img
              src={personalInfo.profile}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border"
            />
            {/* Personal Details */}
            <div>
              <p>
                <strong>Name:</strong> {personalInfo.first_name}{" "}
                {personalInfo.last_name}
              </p>
              <p>
                <strong>Gender:</strong> {personalInfo.gender}
              </p>
              <p>
                <strong>Address:</strong> {personalInfo.address}
              </p>
              <p>
                <strong>PWD:</strong> {personalInfo.pwd ? "Yes" : "No"}
              </p>
              {personalInfo.pwd && (
                <p>
                  <strong>PWD Description:</strong>{" "}
                  {personalInfo.pwd_description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Information */}
      <Card>
        <CardHeader>
          <CardTitle>Bio</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{bioInfo.bio}</p>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Graduation Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academicInfo.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.institution_name}</TableCell>
                  <TableCell>{entry.course}</TableCell>
                  <TableCell>{entry.specialization}</TableCell>
                  <TableCell>{entry.graduation_year}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Employment History */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Employment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Designation</TableHead>
                <TableHead>Duties</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employmentHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.designation}</TableCell>
                  <TableCell>{entry.duties}</TableCell>
                  <TableCell>
                    {new Date(entry.start_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(entry.end_date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Skills & Interests */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Skills & Interests</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Skills:</strong> {skillsInterests.skills}
          </p>
          <p>
            <strong>Interests:</strong> {skillsInterests.interests}
          </p>
        </CardContent>
      </Card>

      {/* Match Confirmation Dialog */}
    </div>
  );
};

export default MentorDetailsPage;
