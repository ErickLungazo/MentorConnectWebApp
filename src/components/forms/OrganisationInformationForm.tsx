import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button.tsx";
import { supabase } from "@/lib/supabase.ts";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader } from "lucide-react";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useUserRoleStore } from "@/store/useUserRoleStore.ts";
import { z } from "zod";

const organisationFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  about: z
    .string()
    .min(10, { message: "About must be at least 10 characters." }),
  logo: z.string().url({ message: "Logo must be a valid URL." }),
});

type OrganisationFormData = z.infer<typeof organisationFormSchema>;

const OrganisationInformationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoImageUrl, setLogoImageUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { role: loggedInUserRole } = useUserRoleStore();

  const form = useForm<OrganisationFormData>({
    resolver: zodResolver(organisationFormSchema),
    defaultValues: {
      name: "",
      about: "",
      logo: "",
    },
  });

  useEffect(() => {
    const fetchOrganisationInfo = async () => {
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
        // Fetch the organization information from the organisation-information table
        const { data: organisationInfoData, error: organisationInfoError } =
          await supabase
            .from("organisation-information")
            .select()
            .eq("user_id", userId)
            .single();
        if (organisationInfoError) {
          if (organisationInfoError.status === 404) {
            // No record found, set to creation mode
            setIsUpdating(false);
          } else {
            console.error(
              "Error fetching organization information:",
              organisationInfoError.message,
            );
            toast.error(
              `Failed to fetch organization information: ${organisationInfoError.message}`,
            );
          }
        } else {
          // Record found, set to update mode and populate form fields
          setIsUpdating(true);
          form.reset({
            name: organisationInfoData.name,
            about: organisationInfoData.about,
            logo: organisationInfoData.logo,
          });
          setLogoImageUrl(organisationInfoData.logo);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrganisationInfo();
  }, [form]);

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
      const filePath = `${userId}/${file.name}`;
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("organisation-logos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });
      if (error) {
        console.error("Error uploading file:", error.message);
        toast.error(`Failed to upload file: ${error.message}`);
      } else {
        const { data: imageData, error: downloadError } = supabase.storage
          .from("organisation-logos")
          .getPublicUrl(data.path);
        if (downloadError) {
          console.error("Error getting public URL:", downloadError.message);
          toast.error(`Failed to get public URL: ${downloadError.message}`);
        } else {
          setLogoImageUrl(imageData.publicUrl);
          form.setValue("logo", imageData.publicUrl);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<OrganisationFormData> = async (data) => {
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
        // Update the organization information in the organisation-information table
        const { error } = await supabase
          .from("organisation-information")
          .update({
            name: data.name,
            about: data.about,
            logo: data.logo,
          })
          .eq("user_id", userId);
        if (error) {
          console.error(
            "Error updating organization information:",
            error.message,
          );
          toast.error(
            `Failed to update organization information: ${error.message}`,
          );
        } else {
          toast.success("Organization information updated successfully");
          navigate("/on-boarding/complete"); // Replace with the actual next step
        }
      } else {
        // Insert the organization information into the organisation-information table
        const { error } = await supabase
          .from("organisation-information")
          .insert([
            {
              name: data.name,
              about: data.about,
              logo: data.logo,
              user_id: userId,
            },
          ]);
        if (error) {
          console.error(
            "Error inserting organization information:",
            error.message,
          );
          toast.error(
            `Failed to insert organization information: ${error.message}`,
          );
        } else {
          toast.success("Organization information saved successfully");
          navigate("/on-boarding/complete"); // Replace with the actual next step
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid-cols-1  gap-3 grid w-full"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Corp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your organization..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo Image</FormLabel>
              <FormControl>
                <div className="flex flex-col items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {logoImageUrl && (
                    <div>
                      <img
                        src={logoImageUrl}
                        alt="Logo"
                        className="mt-2 h-24 w-24 rounded-full"
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className=" gap-3 flex justify-end items-center">
          <Button disabled={loading} type="submit" className="">
            {loading ? (
              <Loader className="animate-spin" />
            ) : (
              <span>{isUpdating ? "Update" : "Next"}</span>
            )}
          </Button>
          {isUpdating && (
            <Button
              onClick={() => {
                navigate("/on-boarding/complete"); // Replace with the actual next step
              }}
              disabled={loading}
              type={"button"}
              variant={"default"}
            >
              Next
              <ArrowRight />
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default OrganisationInformationForm;
