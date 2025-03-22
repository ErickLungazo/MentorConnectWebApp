import React from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  {
    title: "Find a Mentor",
    url: "mentee/mentors",
  },
];

const Navbar = () => {
  return (
    <section
      className={"px-3 flex items-center justify-between bg-primary py-5"}
    >
      <div className="w-[300px] min-w-[300px] max-w-[300px]  flex">
        <Link
          to={"/"}
          className={
            "font-bold text-primary-foreground w-full text-center text-xl"
          }
        >
          MentorConnect
        </Link>
      </div>

      <nav className="text-primary-foreground">
        <ul className="">
          {navLinks.map((link) => (
            <li key={link.url}>
              <Link to={link.url}>{link.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
};

export default Navbar;
