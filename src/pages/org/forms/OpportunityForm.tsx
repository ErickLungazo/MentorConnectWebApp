"use client";

import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Loader } from "lucide-react";

// Update validation schema
const opportunitySchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  type: z.enum(["internships", "attachments", "jobs"]),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." }),
  jobDetails: z.string().optional(),
  vacancies: z.coerce
    .number()
    .min(1, { message: "Vacancies must be at least 1." })
    .max(1000, { message: "Too many vacancies." }),
  dueDate: z.date({ required_error: "Due date is required." }),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

const OpportunityForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  // Update form default values
  const form = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: "",
      type: "internships",
      description: "",
      jobDetails: "",
      vacancies: 1,
      dueDate: new Date(),
    },
  });

  // Function to handle PDF upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const userSession = await supabase.auth.getUser();
      if (!userSession.data.user) {
        toast.error("You need to be logged in.");
        return;
      }
      const orgId = userSession.data.user.id;
      const filePath = `${orgId}/${file.name}`;
      const { data, error } = await supabase.storage
        .from("opportunities")
        .upload(filePath, file);
      if (error) throw error;
      const { data: fileData } = supabase.storage
        .from("opportunities")
        .getPublicUrl(data.path);
      setPdfUrl(fileData.publicUrl);
      form.setValue("jobDetails", fileData.publicUrl);
    } catch (error) {
      toast.error("Failed to upload file.");
    } finally {
      setLoading(false);
    }
  };

  // Form submit handler
  const onSubmit: SubmitHandler<OpportunityFormData> = async (data) => {
    setLoading(true);
    try {
      const userSession = await supabase.auth.getUser();
      if (!userSession.data.user) {
        toast.error("You need to be logged in.");
        return;
      }
      const userId = userSession.data.user.id;
      // Fetch organization ID for the logged-in user
      const { data: orgData, error: orgError } = await supabase
        .from("organisation-information")
        .select("id")
        .eq("user_id", userId)
        .single();
      if (orgError || !orgData) {
        toast.error("Your organization was not found. Please contact support.");
        return;
      }
      const orgId = orgData.id;
      // Insert data into the database
      const { error } = await supabase.from("opportunities").insert([
        {
          title: data.title,
          type: data.type,
          description: data.description,
          job_details: data.jobDetails || null,
          vacancies: data.vacancies,
          due_date: data.dueDate.toISOString().split("T")[0], // Convert date to ISO string and take the date part
          org: orgId,
        },
      ]);
      if (error) throw error;
      toast.success("Opportunity created successfully!");
      navigate(`/org/opportunities/${data.type.toLowerCase()}`);
    } catch (error) {
      toast.error("Failed to create opportunity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter job title..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Type Selection */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select opportunity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internships">Internship</SelectItem>
                    <SelectItem value="attachments">Attachment</SelectItem>
                    <SelectItem value="jobs">Job</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the opportunity..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Number of Vacancies */}
          <FormField
            control={form.control}
            name="vacancies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Vacancies</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={1000} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Due Date */}
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={
                      field.value ? field.value.toISOString().split("T")[0] : ""
                    }
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* PDF Upload for Job Details */}
          <FormField
            control={form.control}
            name="jobDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Details (PDF)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                  />
                </FormControl>
                {pdfUrl && (
                  <div className="mt-2 text-sm text-blue-500">
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                      View uploaded document
                    </a>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <Loader className="animate-spin" />
            ) : (
              "Create Opportunity"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default OpportunityForm;
