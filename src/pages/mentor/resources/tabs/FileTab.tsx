import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MediaUpload from "@/components/MediaUpload";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader } from "lucide-react";
import TrainingDialog from "@/pages/mentor/resources/TrainingDialog";

// Validation schema
const FormSchema = z.object({
  name: z.string().min(2, "Resource name must be at least 2 characters."),
  sourceUrl: z.string().url("Invalid URL format."),
});

type FormValues = z.infer<typeof FormSchema>;

const FileTab = () => {
  const [fileURL, setFileURL] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [waitingResponse, setWaitingResponse] = useState<boolean>(false);
  const [trainingSourceUrl, setTrainingSourceUrl] = useState<string | null>(
    null,
  );

  // Fetch user ID
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }
      setUserId(user?.id ?? null);
    };
    fetchUser();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: "", sourceUrl: "" },
  });

  useEffect(() => {
    if (fileURL) {
      form.setValue("sourceUrl", fileURL);
    }
  }, [fileURL, form]);

  const onSubmit = async (data: FormValues) => {
    if (!userId) {
      toast.error("User not authenticated.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("resources")
        .insert([
          {
            type: "file",
            source_url: data.sourceUrl,
            user_id: userId,
            name: data.name,
          },
        ]);
      if (error) throw error;

      toast.success("Resource uploaded successfully!");
      setTrainingSourceUrl(data.sourceUrl);
    } catch (error) {
      console.error("Error saving resource:", error);
      toast.error("Failed to save resource. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {trainingSourceUrl ? (
        <div className="w-full py-5 flex flex-col gap-3 px-3 items-center justify-center">
          {waitingResponse ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader className="animate-spin" /> Training...
            </div>
          ) : response ? (
            <div className="bg-gray-100 p-3 rounded text-sm">{response}</div>
          ) : null}

          {!waitingResponse && (
            <TrainingDialog
              sourceType={"file"}
              setWaitingResponse={setWaitingResponse}
              setResponse={setResponse}
              waitingResponse={waitingResponse}
              sourceUrl={trainingSourceUrl}
            />
          )}
        </div>
      ) : (
        <div className="w-full">
          <MediaUpload setFileURL={setFileURL} />

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-3"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter resource name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourceUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="hidden" readOnly {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={loading}
                type="submit"
                className="w-full flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin mr-2" /> Uploading...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </>
  );
};

export default FileTab;
