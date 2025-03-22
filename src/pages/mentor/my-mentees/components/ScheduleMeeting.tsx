import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import { getZoomURL } from "@/lib/utils.ts";
import axios from "axios";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// Validation Schema
const FormSchema = z.object({
  topic: z.string().min(3, { message: "Topic is required." }),
  agenda: z
    .string()
    .min(10, { message: "Agenda must be at least 10 characters." }),
  date: z.string().min(1, { message: "Date is required." }),
  startTimeHour: z.string().min(1),
  startTimeMinute: z.string().min(1),
  durationHour: z.string().min(1),
  durationMinute: z.string().min(1),
});

interface ScheduleMeetingFormProps {
  menteeId: string | string[];
  mentorId: string;
  setIsScheduleDialogOpen: (open: boolean) => void;
}

type FormData = z.infer<typeof FormSchema>;

export const ScheduleMeetingForm: React.FC<ScheduleMeetingFormProps> = ({
  menteeId,
  mentorId,
  setIsScheduleDialogOpen,
}) => {
  const [loading, setLoading] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      topic: "",
      agenda: "",
      date: "",
      startTimeHour: "10",
      startTimeMinute: "00",
      durationHour: "1",
      durationMinute: "00",
    },
  });

  const RESEND_API_KEY = "re_HBN1sS1i_K9iwypGgNztz4kDup1zKAzEr"; // Replace with your actual Resend API Key
  const ADMIN_EMAIL = "saitah@proton.me"; // Default recipient email

  async function scheduleMeeting(menteeId: string, data: FormData) {
    const startDate = new Date(data.date);
    startDate.setHours(parseInt(data.startTimeHour, 10));
    startDate.setMinutes(parseInt(data.startTimeMinute, 10));
    const duration =
      parseInt(data.durationHour, 10) * 60 + parseInt(data.durationMinute, 10);
    const meetingDetails = {
      topic: data.topic,
      agenda: data.agenda,
      start_time: startDate.toISOString(),
      duration,
      timezone: "Africa/Nairobi",
    };

    try {
      // Step 1: Schedule the meeting
      const response = await axios.post(getZoomURL(), meetingDetails, {
        headers: { "Content-Type": "application/json" },
      });
      const {
        topic,
        agenda,
        start_time,
        duration,
        join_url,
        start_url,
        password,
      } = response.data;

      // Step 2: Save to Supabase
      const { error } = await supabase.from("sessions").insert([
        {
          topic,
          agenda,
          start_time,
          duration,
          join_url,
          start_url,
          password,
          mentor_id: mentorId,
          mentee_id: menteeId,
        },
      ]);

      if (error) {
        console.error("Error saving to Supabase:", error);
        toast.error("Database Error");
        return;
      }

      // Step 3: Send Email Notification
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `New Meeting Scheduled: ${topic}`,
        html: `
          <h2>New Meeting Scheduled</h2>
          <p><strong>Topic:</strong> ${topic}</p>
          <p><strong>Agenda:</strong> ${agenda}</p>
          <p><strong>Start Time:</strong> ${new Date(start_time).toLocaleString(
            "en-US",
            { timeZone: "Africa/Nairobi" },
          )}</p>
          <p><strong>Duration:</strong> ${duration} minutes</p>
          <p><strong>Join URL:</strong> <a href="${join_url}" target="_blank">Click here to join</a></p>
          <p><strong>Meeting Password:</strong> ${password}</p>
        `,
      });
      toast.success(`Meeting Scheduled for mentee ${menteeId}`);
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("Error creating meeting. Please try again.");
    }
  }

  // Helper function to send an email using Resend API
  async function sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const options = {
      method: "POST",
      url: "https://api.resend.com/emails",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "insomnia/11.0.0",
        Authorization: `Bearer ${RESEND_API_KEY}`, // Corrected the Authorization header
      },
      data: {
        from: "MentorConnect <no-reply@mentorconnect.com>",
        to,
        subject,
        html,
      },
    };

    try {
      const response = await axios.request(options);
      if (response.status === 200) {
        console.log("Email sent successfully!");
      } else {
        console.error("Error sending email:", response.data);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  // Handle the form submission and schedule meetings for multiple mentees
  async function onSubmit(data: FormData, menteeId: string | string[]) {
    setLoading(true);
    const menteeIds = Array.isArray(menteeId) ? menteeId : [menteeId];
    for (const id of menteeIds) {
      await scheduleMeeting(id, data);
    }
    setLoading(false);
    setIsScheduleDialogOpen(false);
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => onSubmit(data, menteeId))}
        className="flex flex-col gap-3"
      >
        {/* Meeting Topic */}
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Topic</FormLabel>
              <FormControl>
                <Input placeholder="Enter meeting topic" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Meeting Agenda */}
        <FormField
          control={form.control}
          name="agenda"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Agenda</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter meeting agenda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Meeting Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Start Time - Hour & Minute */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTimeHour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time (Hour)</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(24)].map((_, i) => (
                        <SelectItem key={i} value={String(i).padStart(2, "0")}>
                          {String(i).padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTimeMinute"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time (Minute)</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Minute" />
                    </SelectTrigger>
                    <SelectContent>
                      {["00", "15", "30", "45"].map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        {/* Duration - Hour & Minute */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="durationHour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (Hour)</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hours" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(6)].map((_, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {i} hr
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durationMinute"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (Minute)</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Minutes" />
                    </SelectTrigger>
                    <SelectContent>
                      {["00", "15", "30", "45"].map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          {minute} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        {/* Submit Button */}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Scheduling..." : "Schedule Meeting"}
        </Button>
      </form>
    </Form>
  );
};
