// EmploymentHistoryForm.tsx
import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button.tsx";
import { supabase } from "@/lib/supabase.ts";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, Loader } from "lucide-react";
import axios from "axios";
import { cn, getAiResponseURL } from "@/lib/utils.ts";
import { Calendar } from "@/components/ui/calendar.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { format } from "date-fns";

const formSchema = z.object({
  designation: z
    .string()
    .min(2, { message: "Designation must be at least 2 characters." }),
  duties: z
    .string()
    .min(10, { message: "Duties must be at least 10 characters." }),
  recommendationLetter: z
    .string({ message: "Recommendation letter must be a valid URL." })
    .optional(),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
});

type FormData = z.infer<typeof formSchema>;

const EmploymentHistoryForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatedDuties, setGeneratedDuties] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      designation: "",
      duties: "",
      recommendationLetter: "",
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      // Get the current user from Supabase
      const { data: userSession, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userSession.user) {
        console.error(
          "Error getting user session:",
          userError?.message || "User not found",
        );
        toast.error("Failed to get user session. Please log in first.");
        return;
      }
      const userId = userSession.user.id;

      // Define the path for the file in the user-specific folder
      const filePath = `${userId}/${file.name.replace(/[\[\]{}<>"'\\:*?%~#$&+=!@^`|]+/g, "_")}`; // Replace problematic characters with underscores

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("recommendation-letters")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading file:", error.message);
        toast.error(`Failed to upload file: ${error.message}`);
      } else {
        const { data: imageData, error: downloadError } = supabase.storage
          .from("recommendation-letters")
          .getPublicUrl(data.path);

        if (downloadError) {
          console.error("Error getting public URL:", downloadError.message);
          toast.error(`Failed to get public URL: ${downloadError.message}`);
        } else {
          form.setValue("recommendationLetter", imageData.publicUrl);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDuties = async (designation: string) => {
    if (!designation) return;
    setLoading(true);
    try {
      const response = await axios.post(getAiResponseURL(), {
        prompt: `
    Provide me duties based on the designation ${designation}. 
    Provide only the duties description no need for any additional information. 
    Provide me the various duties separated by commas.
    And pick  the most important top most 6 duties
    Return the response in JSON format in this format:
    ["duty 1", "duty 2", ...]
    `,
      });

      // const duties = response.data.text.trim();
      // setGeneratedDuties(duties);
      // form.setValue("duties", duties);
      // Parse the response and join the duties into a single string
      try {
        const parsedDuties = JSON.parse(response.data.text.trim());
        if (Array.isArray(parsedDuties)) {
          const duties = parsedDuties.join(", ");
          setGeneratedDuties(duties);
          form.setValue("duties", duties);
        } else {
          console.error("Unexpected response format:", parsedDuties);
          toast.error("Failed to parse duties. Please try again.");
        }
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        toast.error("Failed to parse response. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching duties:", error);
      toast.error("Failed to fetch duties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    try {
      // Get the current user from Supabase
      const { data: userSession, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userSession.user) {
        console.error(
          "Error getting user session:",
          userError?.message || "User not found",
        );
        toast.error("Failed to get user session. Please log in first.");
        return;
      }
      const userId = userSession.user.id;

      // Insert the employment information into the employment-history table
      const { error } = await supabase.from("employment-history").insert([
        {
          user: userId,
          designation: data.designation,
          duties: data.duties,
          recommendation_letter: data.recommendationLetter || null,
          start_date: data.startDate.toISOString().split("T")[0],
          end_date: data.endDate.toISOString().split("T")[0],
        },
      ]);

      if (error) {
        console.error("Error inserting employment information:", error.message);
        toast.error(
          `Failed to insert employment information: ${error.message}`,
        );
      } else {
        toast.success("Employment information saved successfully");
        navigate("/on-boarding/skills-and-interests");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className=" grid grid-cols-1 md:grid-cols-2 gap-2"
      >
        <FormField
          control={form.control}
          name="designation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Designation</FormLabel>
              <FormControl>
                <Input
                  placeholder="Software Engineer"
                  {...field}
                  onBlur={() => fetchDuties(field.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="md:col-span-2 lg:col-span-3">
          <FormField
            control={form.control}
            name="duties"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duties</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your duties here"
                    {...field}
                    defaultValue={generatedDuties}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="recommendationLetter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recommendation Letter</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:col-span-2 lg:col-span-3 ">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a start date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Start date of your employment.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick an end date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>End date of your employment.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end py-5 md:col-span-2 lg:col-span-3">
          <Button disabled={loading} type="submit" className="">
            {loading ? (
              <Loader className="animate-spin" />
            ) : (
              <span>Create</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmploymentHistoryForm;
