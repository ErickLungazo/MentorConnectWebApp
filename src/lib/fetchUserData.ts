// utils/fetchUserData.js
import { supabase } from "@/lib/supabase";

export const fetchUserData = async (userId) => {
  try {
    // Fetch data from different tables
    const { data: personalInfo, error: personalError } = await supabase
      .from("personal-information")
      .select("first_name, last_name, gender, pwd, pwd_description")
      .eq("id", userId);

    const { data: employmentHistory, error: employmentError } = await supabase
      .from("employment-history")
      .select("designation, duties")
      .eq("user", userId);

    const { data: academicInfo, error: academicError } = await supabase
      .from("academic-information")
      .select("course, specialization")
      .eq("user", userId);

    const { data: skillsAndInterestsInfo, error: skillsAndInterestsError } =
      await supabase
        .from("skills-interests")
        .select("skills, interests")
        .eq("id", userId);

    // Check for errors
    if (personalError)
      throw new Error(`Error fetching personal info: ${personalError.message}`);
    if (employmentError)
      throw new Error(
        `Error fetching employment history: ${employmentError.message}`,
      );
    if (academicError)
      throw new Error(`Error fetching academic info: ${academicError.message}`);
    if (skillsAndInterestsError)
      throw new Error(
        `Error fetching skills and interests: ${skillsAndInterestsError.message}`,
      );

    // Combine the data into a single object
    const combinedData = {
      personalInfo: personalInfo[0],
      employmentHistory: employmentHistory,
      academicInfo: academicInfo,
      skillsAndInterestsInfo: skillsAndInterestsInfo[0],
    };

    return combinedData;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Function to fetch user details
export async function getUserDetails(userId: string) {
  try {
    // Fetching personal information
    const { data: personalInfo, error: personalError } = await supabase
      .from("personal-information")
      .select("*")
      .eq("id", userId)
      .single();

    if (personalError) throw personalError;

    // Fetching academic information
    const { data: academicInfo, error: academicError } = await supabase
      .from("academic-information")
      .select("*")
      .eq("user", userId);

    if (academicError) throw academicError;

    // Fetching employment history
    const { data: employmentHistory, error: employmentError } = await supabase
      .from("employment-history")
      .select("*")
      .eq("user", userId);

    if (employmentError) throw employmentError;

    // Fetching skills & interests
    const { data: skillsInterests, error: skillsError } = await supabase
      .from("skills-interests")
      .select("*")
      .eq("id", userId)
      .single();

    if (skillsError) throw skillsError;

    // Fetching bio information
    const { data: bioInfo, error: bioError } = await supabase
      .from("bio-information")
      .select("*")
      .eq("id", userId)
      .single();

    if (bioError) throw bioError;

    return {
      personalInfo,
      academicInfo,
      employmentHistory,
      skillsInterests,
      bioInfo,
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
}
