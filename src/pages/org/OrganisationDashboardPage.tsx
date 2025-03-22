import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import OpportunityForm from "@/pages/org/forms/OpportunityForm.tsx";

const OrganisationDashboardPage = () => {
  return (
    <div className={"flex flex-col gap-3"}>
      {/*<section className="">*/}
      {/*  <StatsComponents />*/}
      {/*</section>*/}
      <section className="">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>Welcome to Organisation Dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger>
                <Button>Create Opportunity</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Opportunity</DialogTitle>
                  <DialogDescription>
                    Provide details about the opportunity, including the title,
                    type, description, and any relevant documents.
                  </DialogDescription>
                </DialogHeader>
                <OpportunityForm />
              </DialogContent>
            </Dialog>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
};

export default OrganisationDashboardPage;
