import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Briefcase, FileText, GraduationCap, List, User } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

interface Mentee {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  address: string;
  profile: string; // Profile image URL
  pwd: boolean;
  pwd_description: string | null;
}

interface EmploymentHistory {
  id: string;
  designation: string;
  duties: string;
  recommendation_letter: string | null;
  start_date: string;
  end_date: string;
}

interface AcademicInformation {
  id: string;
  institution_name: string;
  course: string;
  specialization: string;
  award: string;
  graduation_year: number;
  certificate: string;
}

interface SkillsInterests {
  id: string;
  skills: string;
  interests: string;
}

interface BioInformation {
  id: string;
  bio: string;
}

const MenteeInfo = () => {
  const { id } = useParams<{ id: string }>();
  const [mentee, setMentee] = useState<Mentee | null>(null);
  const [employmentHistory, setEmploymentHistory] = useState<
    EmploymentHistory[] | null
  >(null);
  const [academicInformation, setAcademicInformation] = useState<
    AcademicInformation[] | null
  >(null);
  const [skillsInterests, setSkillsInterests] =
    useState<SkillsInterests | null>(null);
  const [bioInformation, setBioInformation] = useState<BioInformation | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("Invalid mentee ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch personal information
        const { data: menteeData, error: menteeError } = await supabase
          .from("personal-information")
          .select(
            "id, first_name, last_name, gender, address, profile, pwd, pwd_description",
          )
          .eq("id", id)
          .single();

        if (menteeError) throw new Error(menteeError.message);
        setMentee(menteeData);

        // Fetch employment history
        const { data: employmentData, error: employmentError } = await supabase
          .from("employment-history")
          .select("*")
          .eq("user", id);

        if (employmentError) throw new Error(employmentError.message);
        setEmploymentHistory(employmentData);

        // Fetch academic information
        const { data: academicData, error: academicError } = await supabase
          .from("academic-information")
          .select("*")
          .eq("user", id);

        if (academicError) throw new Error(academicError.message);
        setAcademicInformation(academicData);

        // Fetch skills and interests
        const { data: skillsInterestsData, error: skillsInterestsError } =
          await supabase
            .from("skills-interests")
            .select("*")
            .eq("id", id)
            .single();

        if (skillsInterestsError && skillsInterestsError.status !== 406)
          throw new Error(skillsInterestsError.message);
        setSkillsInterests(skillsInterestsData);

        // Fetch bio information
        const { data: bioData, error: bioError } = await supabase
          .from("bio-information")
          .select("*")
          .eq("id", id)
          .single();

        if (bioError) throw new Error(bioError.message);
        setBioInformation(bioData);
      } catch (err) {
        setError("Error fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!mentee) return <div>No mentee found.</div>;

  return (
    <section className="space-y-4">
      <Accordion type="single" collapsible className={"flex flex-col gap-3"}>
        {/* Personal Information */}
        <AccordionItem value="item-1" className={"bg-white p-3 rounded-xl"}>
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <User />
              Personal Information
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className={""}>
              <img
                src={mentee.profile}
                alt={`${mentee.first_name} ${mentee.last_name}`}
                className="w-24 h-24 rounded-full object-cover border mb-4"
              />
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Name</TableCell>
                    <TableCell>
                      {mentee.first_name} {mentee.last_name}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Gender</TableCell>
                    <TableCell>{mentee.gender}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Address</TableCell>
                    <TableCell>{mentee.address}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">PWD</TableCell>
                    <TableCell>{mentee.pwd ? "Yes" : "No"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      PWD Description
                    </TableCell>
                    <TableCell>{mentee.pwd_description || "N/A"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Employment History */}
        {employmentHistory && employmentHistory.length > 0 && (
          <AccordionItem value="item-2" className={"bg-white p-3 rounded-xl"}>
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <Briefcase />
                Employment History
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Designation</TableHead>
                    <TableHead>Duties</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Recommendation Letter</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employmentHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>{history.designation}</TableCell>
                      <TableCell>{history.duties}</TableCell>
                      <TableCell>
                        {new Date(history.start_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(history.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {history.recommendation_letter ? (
                          <a
                            href={history.recommendation_letter}
                            target={"_blank"}
                          >
                            <Button>Download</Button>
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Academic Information */}
        {academicInformation && academicInformation.length > 0 && (
          <AccordionItem value="item-3" className={"bg-white p-3 rounded-xl"}>
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <GraduationCap />
                Academic Information
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Institution Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Graduation Year</TableHead>
                    <TableHead>Certificate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {academicInformation.map((info) => (
                    <TableRow key={info.id}>
                      <TableCell>{info.institution_name}</TableCell>
                      <TableCell>{info.course}</TableCell>
                      <TableCell>{info.specialization}</TableCell>
                      <TableCell>{info.graduation_year}</TableCell>
                      <TableCell>
                        <a href={info.certificate} target={"_blank"}>
                          <Button>Download</Button>
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Skills and Interests */}
        {skillsInterests && (
          <AccordionItem value="item-4" className={"bg-white p-3 rounded-xl"}>
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <List />
                Skills and Interests
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Skills</TableCell>
                    <TableCell>{skillsInterests.skills}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Interests</TableCell>
                    <TableCell>{skillsInterests.interests}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Bio Information */}
        {bioInformation && (
          <AccordionItem value="item-5" className={"bg-white p-3 rounded-xl"}>
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <FileText />
                Bio Information
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className={""}>{bioInformation.bio}</div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </section>
  );
};

export default MenteeInfo;
