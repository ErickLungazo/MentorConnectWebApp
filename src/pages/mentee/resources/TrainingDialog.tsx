import { useState } from "react";
import axios from "axios";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getRagURL } from "@/lib/utils";

interface TrainingDialogProps {
  sourceType: "file" | "website" | "youtube";
  sourceUrl: string;
  setResponse: (response: string | null) => void;
  setWaitingResponse: (waiting: boolean) => void;
  waitingResponse: boolean;
}

const TrainingDialog: React.FC<TrainingDialogProps> = ({
  sourceType,
  sourceUrl,
  setResponse,
  setWaitingResponse,
  waitingResponse,
}) => {
  const [query, setQuery] = useState<string>("");

  const handleTrain = async () => {
    if (!query.trim()) {
      toast.error("Please enter a test query.");
      return;
    }

    setWaitingResponse(true);
    setResponse(null); // Reset previous responses

    try {
      const { data } = await axios.post<{ test_response?: string }>(
        `${getRagURL()}/train`,
        {
          type: sourceType,
          source_url: sourceUrl,
          query,
        },
      );

      setResponse(data.test_response || "Training completed.");
      toast.success("Training process started!");
    } catch (error) {
      console.error("Error triggering training:", error);
      toast.error("Failed to start training.");
    } finally {
      setWaitingResponse(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="default">Train your data source</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enter Test Query</AlertDialogTitle>
          <AlertDialogDescription>
            Provide a test query to validate the training process for{" "}
            {sourceType}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Query Input */}
        <Input
          placeholder="Enter test query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-4"
        />

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleTrain} disabled={waitingResponse}>
            {waitingResponse ? "Processing..." : "Submit"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TrainingDialog;
