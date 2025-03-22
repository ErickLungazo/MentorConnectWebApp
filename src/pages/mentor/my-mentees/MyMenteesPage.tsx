import React from "react";
import ApprovedMentees from "./components/ApprovedMentees.tsx";
import PendingApprovalMentees from "./components/PendingApprovalMentees.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MyMenteesPage = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Pending Approval Mentees</CardTitle>
          <CardDescription>List of mentees awaiting approval.</CardDescription>
        </CardHeader>
        <CardContent>
          <PendingApprovalMentees />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approved Mentees</CardTitle>
          <CardDescription>List of approved mentees.</CardDescription>
        </CardHeader>
        <CardContent>
          <ApprovedMentees />
        </CardContent>
      </Card>
    </div>
  );
};

export default MyMenteesPage;
