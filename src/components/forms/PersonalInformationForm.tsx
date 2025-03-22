"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useUserRoleStore } from "@/store/useUserRoleStore";

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters." }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters." }),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Please select a gender.",
  }),
  address: z.string().optional(),
  pwd: z.boolean().default(false),
  pwdDescription: z.string().optional(),
  profile: z
    .string()
    .url({ message: "Profile must be a valid URL." })
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

const InputForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { role: loggedInUserRole } = useUserRoleStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "Male",
      address: "",
      pwd: false,
      pwdDescription: "",
      profile: "",
    },
  });

  useEffect(() => {
    const fetchPersonalInfo = async () => {
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
        // Fetch the personal information from the personal-information table
        const { data: personalInfoData, error: personalInfoError } =
          await supabase
            .from("personal-information")
            .select()
            .eq("id", userId)
            .single();
        if (personalInfoError) {
          if (personalInfoError.status === 404) {
            // No record found, set to creation mode
            setIsUpdating(false);
          } else {
            console.error(
              "Error fetching personal information:",
              personalInfoError.message,
            );
            toast.error(
              `Failed to fetch personal information: ${personalInfoError.message}`,
            );
          }
        } else {
          // Record found, set to update mode and populate form fields
          setIsUpdating(true);
          form.reset({
            firstName: personalInfoData.first_name,
            lastName: personalInfoData.last_name,
            gender: personalInfoData.gender,
            address: personalInfoData.address,
            pwd: personalInfoData.pwd,
            pwdDescription: personalInfoData.pwd_description,
            profile: personalInfoData.profile,
          });
          setProfileImageUrl(personalInfoData.profile);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPersonalInfo();
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
        .from("profile-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });
      if (error) {
        console.error("Error uploading file:", error.message);
        toast.error(`Failed to upload file: ${error.message}`);
      } else {
        const { data: imageData, error: downloadError } = supabase.storage
          .from("profile-images")
          .getPublicUrl(data.path);
        if (downloadError) {
          console.error("Error getting public URL:", downloadError.message);
          toast.error(`Failed to get public URL: ${downloadError.message}`);
        } else {
          setProfileImageUrl(imageData.publicUrl);
          form.setValue("profile", imageData.publicUrl);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
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
      if (isUpdating) {
        // Update the personal information in the personal-information table
        const { error } = await supabase
          .from("personal-information")
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            gender: data.gender,
            address: data.address,
            pwd: data.pwd,
            pwd_description: data.pwdDescription,
            profile:
              data.profile ||
              "https://mighty.tools/mockmind-api/content/human/97.jpg",
          })
          .eq("id", userId);
        if (error) {
          console.error("Error updating personal information:", error.message);
          toast.error(
            `Failed to update personal information: ${error.message}`,
          );
        } else {
          toast.success("Personal information updated successfully");
          navigate(
            `/on-boarding/${loggedInUserRole === "org" ? "organisation-information" : "academic-qualifications"}`,
          );
        }
      } else {
        // Insert the personal information into the personal-information table
        const { error } = await supabase.from("personal-information").insert([
          {
            id: userId,
            first_name: data.firstName,
            last_name: data.lastName,
            gender: data.gender,
            address: data.address,
            pwd: data.pwd,
            pwd_description: data.pwdDescription,
            profile:
              data.profile ||
              "https://mighty.tools/mockmind-api/content/human/97.jpg",
          },
        ]);
        if (error) {
          console.error("Error inserting personal information:", error.message);
          toast.error(
            `Failed to insert personal information: ${error.message}`,
          );
        } else {
          toast.success("Personal information saved successfully");
          navigate("/on-boarding/academic-qualifications");
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full"
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {loggedInUserRole !== "org" && (
          <div className="lg:col-span-3">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="123 Main St, Anytown, USA"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        {loggedInUserRole !== "org" && (
          <>
            <FormField
              control={form.control}
              name="pwd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physical Disability</FormLabel>
                  <FormControl>
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span>Yes, I have a physical disability</span>
                    </label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="lg:col-span-2">
              <FormField
                control={form.control}
                name="pwdDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disability Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your disability"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}
        <div className="lg:col-span-3 md:col-span-2 col-span-1">
          <FormField
            control={form.control}
            name="profile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Image</FormLabel>
                <FormControl>
                  <div className="flex flex-col items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {profileImageUrl && (
                      <div>
                        <img
                          src={profileImageUrl}
                          alt="Profile"
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
        </div>
        <div className="md:col-span-2 pt-5 lg:col-span-3 gap-3 flex justify-end items-center">
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
                navigate("/on-boarding/academic-qualifications");
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

export default InputForm;
