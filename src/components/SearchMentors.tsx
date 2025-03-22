import React from "react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Search } from "lucide-react";

const SearchMentors = () => {
  return (
    <div className={"flex items-center gap-2"}>
      <Input placeholder={"Search mentors here"} />
      <Button size={"default"}>
        <Search />
      </Button>
    </div>
  );
};

export default SearchMentors;
