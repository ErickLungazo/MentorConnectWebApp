import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OpportunitiesList from "@/pages/mentee/components/OpportunitiesList.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AppliedJobs from "@/pages/mentee/components/AppliedJobs.tsx";
import MatchJobsWithAI from "@/pages/mentee/components/MatchJobsWithAI.tsx";

const JobsPage = () => {
  return (
    <div className={"flex w-full flex-col gap-5"}>
      <MatchJobsWithAI />

      <AppliedJobs />

      <Card>
        <CardHeader>
          <CardTitle>Posted Opportunities</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="jobs" className="w-full">
            <TabsList>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="internships">Internships</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>
            <TabsContent value="jobs">
              <OpportunitiesList type={"jobs"} />
            </TabsContent>{" "}
            <TabsContent value="internships">
              <OpportunitiesList type={"internships"} />
            </TabsContent>{" "}
            <TabsContent value="attachments">
              <OpportunitiesList type={"attachments"} />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JobsPage;
