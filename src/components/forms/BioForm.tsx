// BioForm.tsx
import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import axios from "axios";
import { getAiResponseURL } from "@/lib/utils";

const formSchema = z.object({
  bio: z.string().min(20, { message: "Bio must be at least 20 characters." }),
});

type FormData = z.infer<typeof formSchema>;

const BioForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: "",
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
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
          navigate("/login");
          return;
        }
        const userId = userSession.user.id;

        // Fetch bio information from the bio-information table
        const { data: bioInfoData, error: bioInfoError } = await supabase
          .from("bio-information")
          .select()
          .eq("id", userId)
          .single();

        if (bioInfoError) {
          console.error(
            "Error fetching bio information:",
            bioInfoError.message,
          );
        } else {
          // Record found, set to update mode and populate form fields
          setIsUpdating(true);
          form.setValue("bio", bioInfoData.bio || "");
          setLoading(false);
          return;
        }

        // Fetch personal information from the personal-information table
        const { data: personalInfoData, error: personalInfoError } =
          await supabase
            .from("personal-information")
            .select()
            .eq("id", userId)
            .single();

        if (personalInfoError) {
          toast.error(
            "No personal information found. Please complete your personal information first.",
          );
          navigate("/on-boarding/personal-information");
          console.error(
            "Error fetching personal information:",
            personalInfoError.message,
          );
          return;
        }

        // Fetch academic information from the academic-information table
        const { data: academicInfoData, error: academicInfoError } =
          await supabase
            .from("academic-information")
            .select("course, specialization,award(name)")
            .eq("user", userId);

        console.log("academicInfoData", academicInfoData);

        if (academicInfoError) {
          // No record found, set to creation mode
          toast.error(
            "No academic information found. Please complete your academic information first.",
          );
          navigate("/on-boarding/academic-qualifications");
          console.error(
            "Error fetching academic information:",
            academicInfoError.message,
          );
          return;
        }

        // Fetch employment history from the employment-history table
        const { data: employmentHistoryData, error: employmentHistoryError } =
          await supabase
            .from("employment-history")
            .select("designation, duties, start_date, end_date")
            .eq("user", userId);

        if (employmentHistoryError) {
          // No record found, set to creation mode
          toast.error(
            "No employment history found. Please complete your employment history first.",
          );
          navigate("/on-boarding/employment-history");
          console.error(
            "Error fetching employment history:",
            employmentHistoryError.message,
          );

          return;
        }

        // Fetch skills and interests from the skills-interests table
        const { data: skillsInterestsData, error: skillsInterestsError } =
          await supabase
            .from("skills-interests")
            .select()
            .eq("id", userId)
            .single();

        if (skillsInterestsError) {
          // No record found, set to creation mode
          setIsUpdating(false);
          console.error(
            "Error fetching skills and interests:",
            skillsInterestsError.message,
          );
          return;
        }

        // If no bio record found, generate it using AI
        if (
          !isUpdating &&
          personalInfoData &&
          academicInfoData &&
          employmentHistoryData &&
          skillsInterestsData
        ) {
          const personalInfo = {
            firstName: personalInfoData.first_name,
            lastName: personalInfoData.last_name,
          };

          const academicInfo = academicInfoData.map((info: any) => ({
            course: info.course,
            specialization: info.specialization,
            award: info.award.name,
          }));

          const employmentHistory = employmentHistoryData.map(
            (history: any) => ({
              designation: history.designation,
              duties: history.duties,
              startDate: history.start_date,
              endDate: history.end_date,
            }),
          );

          const prompt = `
            Generate a professional biography for the following user in the reported format, limited to 200 words. 
            The biography should highlight key aspects of the user's education, work experience, and interests. 
            In addition if the users Highest level of education is Primary or High school level, this is means the user is
            just admiring that career path and meaning the user is not actually studying something relating to that course, they have
            just liked the course somehow. and also in the his/her skills and interest this user is not having those skills and interest
            but that what they just having the aspiration, imagining what they could do in future.
            
            Here are the details:
            
            Personal Information:
            - First Name: ${personalInfo.firstName}
            - Last Name: ${personalInfo.lastName}
            
            Academic Information:
            ${academicInfo.map((info, index) => `- Course: ${info.course}, Specialization: ${info.specialization} Level of Education:${info.award}`).join("\n")}
            
            Employment History:
            ${employmentHistory.map((history, index) => `- Designation: ${history.designation}`).join("\n")}
            
            Skills and Interests:
            - Skills: ${skillsInterestsData.skills}
            - Interests: ${skillsInterestsData.interests}
            
            Return the response in JSON format in this format:
            {
              "biography": "Your biography here"
            }
          `;

          const response = await axios.post(getAiResponseURL(), {
            prompt,
          });

          try {
            const parsedResponse = JSON.parse(response.data.text.trim());
            if (
              parsedResponse.biography &&
              typeof parsedResponse.biography === "string"
            ) {
              form.setValue("bio", parsedResponse.biography);
            } else {
              console.error("Unexpected response format:", parsedResponse);
              toast.error("Failed to parse biography. Please try again.");
            }
          } catch (parseError) {
            console.error("Error parsing response:", parseError);
            toast.error("Failed to parse response. Please try again.");
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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

      if (isUpdating) {
        // Update the bio in the bio-information table
        const { error } = await supabase
          .from("bio-information")
          .update({
            bio: data.bio,
          })
          .eq("id", userId);

        if (error) {
          console.error("Error updating bio:", error.message);
          toast.error(`Failed to update bio: ${error.message}`);
        } else {
          toast.success("Bio updated successfully");
          navigate("/on-boarding/complete");
        }
      } else {
        // Insert the bio into the bio-information table
        const { error } = await supabase.from("bio-information").insert([
          {
            id: userId,
            bio: data.bio,
          },
        ]);

        if (error) {
          console.error("Error inserting bio:", error.message);
          toast.error(`Failed to insert bio: ${error.message}`);
        } else {
          toast.success("Bio saved successfully");
          navigate("/on-boarding/complete");
        }
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your biography here..."
                  className="resize-none"
                  rows={10}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isUpdating ? "Update" : "Create"}
        </Button>
      </form>
    </Form>
  );
};

export default BioForm;
