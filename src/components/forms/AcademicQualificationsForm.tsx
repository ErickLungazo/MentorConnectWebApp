// AcademicQualificationsForm.tsx
import React, { useEffect, useState } from "react";
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
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button.tsx";
import { supabase } from "@/lib/supabase.ts";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import Select from "react-select"; // Import react-select for multi-select
import {
  Select as ShadCNSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { getAiResponseURL } from "@/lib/utils.ts";
import AddItemToArray from "@/components/dialog/AddItemToArray.tsx";

const formSchema = z.object({
  institutionName: z
    .string()
    .min(2, { message: "Institution name must be at least 2 characters." }),
  course: z
    .string()
    .min(2, { message: "Course must be at least 2 characters." }),
  specializations: z
    .array(z.string())
    .min(1, { message: "At least one specialization is required." }),
  award: z.string({ required_error: "Please select an award." }),
  graduationYear: z.coerce
    .number()
    .min(1900, { message: "Graduation year must be a valid year." }),
  certificate: z
    .string()
    .url({ message: "Certificate must be a valid URL." })
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

const AcademicQualificationsForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [awards, setAwards] = useState<{ id: string; name: string }[]>([]);
  const [generatedSpecializations, setGeneratedSpecializations] = useState<
    { value: string; label: string }[]
  >([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      institutionName: "",
      course: "",
      specializations: [],
      award: "",
      graduationYear: "",
      certificate: "",
    },
  });

  useEffect(() => {
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

    fetchAwards();
  }, []);

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
        .from("certificates")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading file:", error.message);
        toast.error(`Failed to upload file: ${error.message}`);
      } else {
        const { data: imageData, error: downloadError } = supabase.storage
          .from("certificates")
          .getPublicUrl(data.path);

        if (downloadError) {
          console.error("Error getting public URL:", downloadError.message);
          toast.error(`Failed to get public URL: ${downloadError.message}`);
        } else {
          form.setValue("certificate", imageData.publicUrl);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async (course: string) => {
    if (!course) return;
    setLoading(true);
    try {
      const response = await axios.post(`${getAiResponseURL()}`, {
        prompt: `Provide me specializations based on the course ${course}. Provide only the specialization name no need for any additional information`,
      });

      const specializations = JSON.parse(response.data.text.trim());
      const formattedSpecializations = specializations.map((spec: string) => ({
        value: spec,
        label: spec,
      }));

      setGeneratedSpecializations(formattedSpecializations);
    } catch (error) {
      console.error("Error fetching specializations:", error);
      toast.error("Failed to fetch specializations. Please try again.");
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

      // Insert the academic information into the academic-information table
      const { error } = await supabase.from("academic-information").insert([
        {
          user: userId,
          institution_name: data.institutionName,
          course: data.course,
          specialization: data.specializations.join(", "), // Join specializations into a comma-separated string
          award: data.award,
          graduation_year: data.graduationYear,
          certificate: data.certificate || "",
        },
      ]);

      if (error) {
        console.error("Error inserting academic information:", error.message);
        toast.error(`Failed to insert academic information: ${error.message}`);
      } else {
        toast.success("Academic information saved successfully");
        navigate("/on-boarding/employment-history");
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
        className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid gap-2"
      >
        <FormField
          control={form.control}
          name="institutionName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Institution Name</FormLabel>
              <FormControl>
                <Input placeholder="University of Example" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="course"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course/Career Aspiration</FormLabel>
              <FormControl>
                <Input
                  placeholder="Bachelor of Science"
                  {...field}
                  onBlur={() => fetchSpecializations(field.value)}
                />
              </FormControl>
              <FormDescription>
                For Primary/High school levels indicate your career aspiration.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full md:col-span-2 lg:col-span-3">
          <FormField
            control={form.control}
            name="specializations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specializations</FormLabel>
                <FormControl>
                  <div className="w-full flex flex-col md:flex-row md:items-center gap-2">
                    <div className="">
                      <AddItemToArray
                        title={"Add New"}
                        array={field.value}
                      />{" "}
                    </div>
                    <Controller
                      disabled={loading}
                      control={form.control}
                      name="specializations"
                      render={({ field }) => (
                        <Select
                          isMulti
                          options={generatedSpecializations}
                          value={field.value.map((value: string) => ({
                            value,
                            label: value,
                          }))}
                          onChange={(selectedOptions) =>
                            field.onChange(
                              selectedOptions.map(
                                (option: any) => option.value,
                              ),
                            )
                          }
                          className="basic-multi-select"
                          classNamePrefix="select"
                        />
                      )}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="award"
          render={({ field }) => (
            <FormItem className={""}>
              <FormLabel>Award</FormLabel>
              <FormControl>
                <ShadCNSelect
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an award" />
                  </SelectTrigger>
                  <SelectContent>
                    {awards.map((award) => (
                      <SelectItem key={award.id} value={award.id}>
                        {award.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </ShadCNSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="graduationYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Graduation Year</FormLabel>
              <FormControl>
                <Input type="number" placeholder="2023" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="certificate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certificate</FormLabel>
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
        <div className="hidden">
          <FormField
            control={form.control}
            name="certificate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificate URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/certificate.pdf"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex py-5 md:col-span-2 lg:col-span-3 justify-end">
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

export default AcademicQualificationsForm;
