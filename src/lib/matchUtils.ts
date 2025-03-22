import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Function to handle matching between a mentee and a mentor.
 * @param {string} mentorId - The ID of the mentor to match with.
 * @param {number} score - The match score.
 * @param {string} reason - The reason for the match.
 */
export const onMatch = async (mentorId, score, reason) => {
  try {
    // Get the logged-in user's ID (mentee_id)
    const user = await supabase.auth.getUser();
    const menteeId = user.data.user?.id;

    if (!menteeId) {
      throw new Error("User not logged in");
    }

    // Check if a match already exists between the mentee and mentor
    const { data: existingMatch, error: checkError } = await supabase
      .from("matches")
      .select("*")
      .eq("mentee_id", menteeId)
      .eq("mentor_id", mentorId);

    if (checkError) {
      throw new Error(
        `Failed to check existing matches: ${checkError.message}`,
      );
    }

    if (existingMatch && existingMatch.length > 0) {
      throw new Error("A match with this mentor already exists.");
    }

    // Insert the match into the database
    const { error: insertError } = await supabase.from("matches").insert({
      mentee_id: menteeId,
      mentor_id: mentorId,
      score: Math.round(score * 10), // Convert score to integer
      reason: reason || null, // Include the reason for matching
    });

    if (insertError) {
      throw new Error(`Failed to register match: ${insertError.message}`);
    }

    // Show success toast message
    toast.success("Match registered successfully!");
  } catch (err) {
    // Show error toast message
    toast.error(err.message);
  }
};
