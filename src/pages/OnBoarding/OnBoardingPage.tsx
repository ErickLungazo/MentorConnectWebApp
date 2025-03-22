import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PersonalInformationScreen from "@/components/onboarding/PersonalInformationScreen.tsx";
import AcademicQualificationsScreen from "@/components/onboarding/AcademicQualificationsScreen.tsx";
import EmploymentHistoryScreen from "@/components/onboarding/EmploymentHistoryScreen.tsx";
import SkillsAndInterestsScreen from "@/components/onboarding/SkillsAndInterestsScreen.tsx";
import MyBioScreen from "@/components/onboarding/MyBioScreen.tsx";
import CompleteOnBoarding from "@/components/onboarding/CompleteOnBoarding.tsx";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUserRoleStore } from "@/store/useUserRoleStore.ts";
import OrganisationInformationScreen from "@/components/onboarding/OrganisationInformationScreen.tsx";

interface OnBoardingStep {
  key: string;
  value: string;
  component: React.FC;
}

const onBoardingStepsMM: OnBoardingStep[] = [
  {
    key: "personal-information",
    value: "Personal Information",
    component: PersonalInformationScreen,
  },
  {
    key: "academic-qualifications",
    value: "Academic Qualifications",
    component: AcademicQualificationsScreen,
  },
  {
    key: "employment-history",
    value: "Employment History",
    component: EmploymentHistoryScreen,
  },
  {
    key: "skills-and-interests",
    value: "Skills and Interests",
    component: SkillsAndInterestsScreen,
  },
  { key: "my-bio", value: "My Bio", component: MyBioScreen },
  {
    key: "complete",
    value: "Complete on Process",
    component: CompleteOnBoarding,
  },
];

const onBoardingStepsOrg: OnBoardingStep[] = [
  {
    key: "personal-information",
    value: "Personal Information",
    component: PersonalInformationScreen,
  },
  {
    key: "organisation-information",
    value: "Organisation Information",
    component: OrganisationInformationScreen,
  },
  {
    key: "complete",
    value: "Complete on Process",
    component: CompleteOnBoarding,
  },
];

const OnBoardingPage: React.FC = () => {
  const { role: loggedInUserRole } = useUserRoleStore();
  const { step } = useParams<{ step: string }>();

  const [onBoardingSteps, setOnBoardingSteps] = useState<OnBoardingStep[]>([]);
  const [currentStep, setCurrentStep] = useState<OnBoardingStep | null>(null);

  useEffect(() => {
    setOnBoardingSteps(
      loggedInUserRole === "org" ? onBoardingStepsOrg : onBoardingStepsMM,
    );
  }, [loggedInUserRole]); // Added dependency

  useEffect(() => {
    if (step && onBoardingSteps.length > 0) {
      const foundStep =
        onBoardingSteps.find((s) => s.key === step) || onBoardingSteps[0];
      setCurrentStep(foundStep);
    }
  }, [step, onBoardingSteps]); // Ensure steps are ready

  if (!currentStep) return <div>Loading...</div>;

  const CurrentComponent = currentStep.component;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 p-2 py-5 md:py-10 w-full">
      <div className="bg-white rounded p-5 h-full w-full flex justify-center px-2">
        <Accordion type="single" collapsible className="w-full sm:hidden">
          <AccordionItem value="item-1">
            <AccordionTrigger>Onboarding Process</AccordionTrigger>
            <AccordionContent>
              <ul className="flex h-fit sticky top-16 left-0 right-0 w-full flex-col">
                {onBoardingSteps.map((s) => (
                  <li key={s.key} className="py-5 border-b border-amber-400">
                    <Link to={`/on-boarding/${s.key}`}>{s.value}</Link>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <ul className="hidden sm:flex h-fit sticky top-16 left-0 right-0 w-full flex-col">
          {onBoardingSteps.map((s) => (
            <li key={s.key} className="py-5 border-b border-amber-400">
              <Link to={`/on-boarding/${s.key}`}>{s.value}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full bg-white gap-5 p-5 rounded flex-col flex mx-auto md:col-span-2 lg:col-span-3">
        <div className="border-b pb-5 w-full">
          <h1 className="text-xl font-semibold">{currentStep.value}</h1>
        </div>

        <CurrentComponent />
      </div>
    </section>
  );
};

export default OnBoardingPage;
