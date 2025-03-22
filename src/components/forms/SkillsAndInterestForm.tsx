// SkillsAndInterestForm.tsx
import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button.tsx";
import { supabase } from "@/lib/supabase.ts";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader, RefreshCcw } from "lucide-react";
import axios from "axios";
import { getAiResponseURL } from "@/lib/utils.ts";

const formSchema = z.object({
  skills: z
    .array(z.string())
    .min(1, { message: "At least one skill is required." }),
  interests: z
    .array(z.string())
    .min(1, { message: "At least one interest is required." }),
});

type FormData = z.infer<typeof formSchema>;

const SkillsAndInterestForm = () => {
  const [globalUserId, setGlobalUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFetchingAI, setIsFetchingAI] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skills: [],
      interests: [],
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
          toast.error("Failed to get user session. Please log in first.");
          navigate("/login");
          return;
        }
        const userId = userSession.user.id;
        setGlobalUserId(userSession.user.id);

        // Fetch skills and interests from the skills-interests table
        const { data: skillsInterestsData, error: skillsInterestsError } =
          await supabase
            .from("skills-interests")
            .select()
            .eq("id", userId)
            .single();

        if (skillsInterestsError) {
          // No existing records found, fetch from AI
          setIsUpdating(false);
          await fetchSkillsAndInterestsFromAI(userId);
        } else {
          // Existing records found, populate the form
          setIsUpdating(true);
          form.reset({
            skills: skillsInterestsData.skills.split(", "),
            interests: skillsInterestsData.interests.split(", "),
          });
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

  const stillFetchFromAI = async (userId: string) => {
    await fetchSkillsAndInterestsFromAI(userId);
  };

  const fetchSkillsAndInterestsFromAI = async (userId: string) => {
    setIsFetchingAI(true);
    try {
      // Fetch academic information from the academic-information table
      const { data: academicInfoData, error: academicInfoError } =
        await supabase
          .from("academic-information")
          .select("course, specialization")
          .eq("user", userId);

      if (academicInfoData == null || academicInfoError) {
        toast.error(
          "No academic information found. Please complete your academic information first.",
        );
        navigate("/on-boarding/academic-qualifications");
        return;
      }

      // Fetch employment history from the employment-history table
      const { data: employmentHistoryData, error: employmentHistoryError } =
        await supabase
          .from("employment-history")
          .select("designation")
          .eq("user", userId);

      if (employmentHistoryError) {
        console.error(
          "Error fetching employment history:",
          employmentHistoryError.message,
        );
      }

      // Generate skills and interests using AI
      const academicInfo = academicInfoData.map((info: any) => ({
        course: info.course,
        specialization: info.specialization,
      }));

      const employmentHistory =
        employmentHistoryData &&
        employmentHistoryData.map((history: any) => ({
          designation: history.designation,
        }));

      const prompt = `
        Provide me relevant skills and interests based on the following user records:
        Academic Information: ${JSON.stringify(academicInfo)}
        Employment History: ${JSON.stringify(employmentHistory)}
        Return the top most relevant 8 skills and 8 interests.
        Return the response in JSON format in this format:
        {
            "skills": ["skill 1", "skill 2", ...],
            "interests": ["interest 1", "interest 2", ...]
        }
      `;

      const response = await axios.post(getAiResponseURL(), {
        prompt,
      });

      const parsedResponse = JSON.parse(response.data.text.trim());
      if (parsedResponse.skills && parsedResponse.interests) {
        form.setValue("skills", parsedResponse.skills);
        form.setValue("interests", parsedResponse.interests);
      } else {
        console.error("Unexpected response format:", parsedResponse);
        toast.error("Failed to parse skills and interests. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      toast.error("Failed to fetch skills and interests. Please try again.");
    } finally {
      setIsFetchingAI(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    try {
      // Get the current user from Supabase
      const { data: userSession, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userSession.user) {
        toast.error("Failed to get user session. Please log in first.");
        return;
      }
      const userId = userSession.user.id;

      if (isUpdating) {
        // Update the skills and interests in the skills-interests table
        const { error } = await supabase
          .from("skills-interests")
          .update({
            skills: data.skills.join(", "),
            interests: data.interests.join(", "),
          })
          .eq("id", userId);

        if (error) {
          toast.error(
            `Failed to update skills and interests: ${error.message}`,
          );
        } else {
          toast.success("Skills and interests updated successfully");
          navigate("/on-boarding/my-bio");
        }
      } else {
        // Insert the skills and interests into the skills-interests table
        const { error } = await supabase.from("skills-interests").insert([
          {
            id: userId,
            skills: data.skills.join(", "),
            interests: data.interests.join(", "),
          },
        ]);

        if (error) {
          toast.error(
            `Failed to insert skills and interests: ${error.message}`,
          );
        } else {
          toast.success("Skills and interests saved successfully");
          navigate("/on-boarding/my-bio");
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your skills here"
                  value={field.value.join(", ")}
                  onChange={(e) =>
                    field.onChange(e.target.value.split(", ").filter(Boolean))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interests</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your interests here"
                  value={field.value.join(", ")}
                  onChange={(e) =>
                    field.onChange(e.target.value.split(", ").filter(Boolean))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          {globalUserId && (
            <div className="w-fit me-2">
              <Button
                size={"icon"}
                variant={"secondary"}
                type={"button"}
                onClick={() => stillFetchFromAI(globalUserId)}
              >
                <RefreshCcw
                  disabled={isFetchingAI}
                  className={`${isFetchingAI && "animate-spin"}`}
                />
              </Button>
            </div>
          )}

          <Button
            disabled={loading || isFetchingAI}
            type="submit"
            className="w-full"
          >
            {loading ? (
              <Loader className="animate-spin" />
            ) : (
              <span>{isUpdating ? "Update" : "Create"}</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SkillsAndInterestForm;
