import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input.tsx";

interface SubmitApplicationProps {
  oppo_id: string; // Opportunity ID
}

const SubmitApplicationDocuments: React.FC<SubmitApplicationProps> = ({
  oppo_id,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Function to get logged-in user ID
  const getUserId = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      toast.error("Failed to get user ID");
      return null;
    }
    return data?.user?.id;
  };

  // Handle file upload and form submission
  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);
    try {
      const userId = await getUserId();
      if (!userId) return;

      // Upload the file to Supabase Storage
      const filePath = `${userId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("applications")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Insert application details into the database
      const { error: insertError } = await supabase
        .from("applications")
        .insert([
          {
            oppo_id,
            mentee_id: userId,
            submitted_documents: filePath,
          },
        ]);

      if (insertError) throw insertError;

      toast.success("Application submitted successfully!");
      setFile(null);
    } catch (error) {
      toast.error("Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 border p-4 rounded-md">
      <Input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2 w-full"
      />
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Submitting..." : "Apply Now"}
      </Button>
    </div>
  );
};

export default SubmitApplicationDocuments;
