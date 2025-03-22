// utils/fetchMentors.js
import { supabase } from "@/lib/supabase";

export const fetchMentors = async () => {
  try {
    const { data, error } = await supabase
      .from("user_role")
      .select(
        `
        id,
        roles (
          name
        ),role
      `,
      )
      .eq("role", 1);

    console.log("Some Data", data);

    if (error) throw new Error(`Error fetching mentors: ${error.message}`);

    // Extract user IDs from the fetched data
    const mentorIds = data.map((mentor) => mentor.id);

    return mentorIds;
  } catch (error) {
    console.error("Error fetching mentors:", error);
    throw error;
  }
};
