import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase"; // Ensure this path is correct
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

// Define the structure of an Opportunity
interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: string;
}

// Define the expected parameters in the URL
interface RouteParams {
  type?: string;
}

const OpportunitiesPage: React.FC = () => {
  const { type } = useParams<RouteParams>(); // Type-safe params
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]); // Typed state

  useEffect(() => {
    const fetchOpportunities = async (): Promise<void> => {
      try {
        // Get the logged-in user
        const { data: userSession, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userSession?.user?.id) {
          toast.error("User not authenticated.");
          return;
        }
        const userId: string = userSession.user.id;

        // Fetch the organization linked to the user
        const { data: orgData, error: orgError } = await supabase
          .from("organisation-information")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (orgError || !orgData) {
          toast.error("Organization not found.");
          return;
        }
        const orgId: string = orgData.id;

        // Ensure `type` is defined before querying
        if (!type) {
          toast.error("Invalid opportunity type.");
          return;
        }

        // Fetch opportunities associated with the organization and type
        const { data: opportunitiesData, error: oppError } = await supabase
          .from("opportunities")
          .select("*")
          .eq("org", orgId)
          .eq("type", type);

        if (oppError) {
          toast.error("Failed to fetch opportunities.");
          return;
        }

        setOpportunities(opportunitiesData as Opportunity[]);
      } catch (error) {
        toast.error("An error occurred while fetching opportunities.", error);
      }
    };

    fetchOpportunities();
  }, [type]);

  // Format the card title and description based on the opportunities
  const cardTitle = type ? `Opportunities for ${type}` : "Opportunities";
  const cardDescription =
    opportunities.length > 0
      ? `Showing ${opportunities.length} opportunities for ${type}.`
      : "No opportunities available for this category.";

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of available opportunities.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.length > 0 ? (
                opportunities.map((opp) => (
                  <TableRow key={opp.id}>
                    <TableCell className="font-medium">{opp.title}</TableCell>
                    <TableCell>{opp.description}</TableCell>
                    <TableCell>{opp.type}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No opportunities found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <p>End of List</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OpportunitiesPage;
