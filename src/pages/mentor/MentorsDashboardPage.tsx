import ManageSessionsPage from "@/pages/mentor/sessions/ManageSessionsPage.tsx";
import ApprovedMentees from "@/pages/mentor/my-mentees/components/ApprovedMentees.tsx";

const MentorsDashboardPage = () => {
  return (
    <div>
      <ApprovedMentees />
      <ManageSessionsPage />
    </div>
  );
};

export default MentorsDashboardPage;
