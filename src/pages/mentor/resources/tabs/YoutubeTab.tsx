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
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader } from "lucide-react";
import TrainingDialog from "@/pages/mentor/resources/TrainingDialog";

const FormSchema = z.object({
  name: z.string().min(2, "Video title must be at least 2 characters."),
  sourceUrl: z.string().url("Invalid URL format."),
});

type FormValues = z.infer<typeof FormSchema>;

const YoutubeTab = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [waitingResponse, setWaitingResponse] = useState<boolean>(false);
  const [trainingSourceUrl, setTrainingSourceUrl] = useState<string | null>(
    null,
  );

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

  const onSubmit = async (data: FormValues) => {
    if (!userId) {
      toast.error("User not authenticated.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("resources").insert([
        {
          type: "youtube",
          source_url: data.sourceUrl,
          user_id: userId,
          name: data.name,
        },
      ]);
      if (error) throw error;

      toast.success("YouTube resource added successfully!");
      setTrainingSourceUrl(data.sourceUrl);
    } catch (error) {
      console.error("Error saving YouTube resource:", error);
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
              sourceType={"youtube"}
              setWaitingResponse={setWaitingResponse}
              setResponse={setResponse}
              waitingResponse={waitingResponse}
              sourceUrl={trainingSourceUrl}
            />
          )}
        </div>
      ) : (
        <div className="w-full">
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
                    <FormLabel>Video Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter video title" {...field} />
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
                    <FormLabel>YouTube URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter YouTube video URL" {...field} />
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

export default YoutubeTab;
