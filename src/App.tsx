import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainDashboard from "@/pages/MainDashboard.tsx";
import NotFoundPage from "@/pages/NotFoundPage.tsx";
import RegisterPage from "@/pages/auth/RegisterPage.tsx";
import LoginPage from "@/pages/auth/LoginPage.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import ProtectedRoute from "@/layout/ProtectedRoute.tsx";
import UserRolePage from "@/pages/UserRolePage.tsx";
import OnBoardingPage from "@/pages/OnBoarding/OnBoardingPage.tsx";
import MainLayout from "@/layout/MainLayout.tsx";
import ManageSessionsPage from "@/pages/mentor/sessions/ManageSessionsPage.tsx";
import MentorsDashboardPage from "@/pages/mentor/MentorsDashboardPage.tsx";
import UserRoleValidation from "@/layout/UserRoleValidation.tsx";
import MenteesDashboardPage from "@/pages/mentee/MenteesDashboardPage.tsx";
import MySessionsPage from "@/pages/mentee/MySessionsPage.tsx";
import MentorsPage from "@/pages/mentee/MentorsPage.tsx";
import MentorDetailsPage from "@/pages/mentee/MentorDetailsPage.tsx";
import MyMenteesPage from "@/pages/mentor/my-mentees/MyMenteesPage.tsx";
import MenteeInfo from "@/pages/mentor/my-mentees/components/MenteeInfo.tsx";
import MessagesPage from "@/pages/MessagesPage.tsx";
import OrganisationDashboardPage from "@/pages/org/OrganisationDashboardPage.tsx";
import OpportunitiesPage from "@/pages/org/OpportunitiesPage.tsx";
import JobsPage from "@/pages/mentee/JobsPage.tsx";
import JobDetails from "@/pages/mentee/JobDetails.tsx";
import ManageResourcesPage from "@/pages/mentor/resources/ManageResourcesPage.tsx";
import ResourcesPage from "@/pages/mentee/resources/ResourcesPage.tsx";

const App = () => {
  return (
    <div>
      <Toaster richColors position={"top-right"} />
      <Router>
        <Routes>
          <Route path={"/login"} element={<LoginPage />} />
          <Route path={"/register"} element={<RegisterPage />} />
          <Route path={"*"} element={<NotFoundPage />} />
          <Route
            path={"/"}
            element={
              <MainLayout>
                <ProtectedRoute />
              </MainLayout>
            }
          >
            <Route index element={<MainDashboard />} />
            <Route path={"user-role"} element={<UserRolePage />} />
            <Route path={"on-boarding/:step"} element={<OnBoardingPage />} />

            {/*MENTOR ROUTES*/}
            <Route
              path={"mentor"}
              element={<UserRoleValidation role={"mentor"} />}
            >
              <Route index element={<MentorsDashboardPage />} />
              <Route path={"sessions"} element={<ManageSessionsPage />} />
              <Route path={"my-mentees"} element={<MyMenteesPage />} />
              <Route path={"my-mentees/:id"} element={<MenteeInfo />} />
              <Route path={"messages"} element={<MessagesPage />} />
              <Route path={"resources"} element={<ManageResourcesPage />} />
              <Route path={"settings"} element={<ManageResourcesPage />} />
            </Route>

            {/*MENTEE ROUTES*/}
            <Route
              path={"mentee"}
              element={<UserRoleValidation role={"mentee"} />}
            >
              <Route index element={<MenteesDashboardPage />} />
              <Route path={"sessions"} element={<MySessionsPage />} />
              <Route path={"mentors"} element={<MentorsPage />} />
              <Route path={"mentors/:id"} element={<MentorDetailsPage />} />
              <Route path={"messages"} element={<MessagesPage />} />
              <Route path={"jobs"} element={<JobsPage />} />
              <Route path={"resources"} element={<ResourcesPage />} />

              <Route path={"jobs/:id"} element={<JobDetails />} />
            </Route>

            {/*ORG ROUTES*/}
            <Route path={"org"} element={<UserRoleValidation role={"org"} />}>
              <Route index element={<OrganisationDashboardPage />} />
              <Route
                path={"opportunities/:type"}
                element={<OpportunitiesPage />}
              />
            </Route>
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
