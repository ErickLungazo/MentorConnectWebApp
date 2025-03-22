import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ChevronsUpDown, GalleryVerticalEnd } from "lucide-react";
import { useUserRoleStore } from "@/store/useUserRoleStore.ts";
import { SidebarItem, sidebarMenu } from "@/data/menuItems.ts";
import { Link } from "react-router-dom";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { role } = useUserRoleStore();
  const menuItems: SidebarItem[] = sidebarMenu[role] || sidebarMenu["guest"];

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">MentorConnect</span>
                <span className="capitalize">{role}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className={"border p-5"}>
        <SidebarMenu className={"flex flex-col gap-3"}>
          {menuItems.map(({ title, url, icon: Icon }) => (
            <SidebarMenuItem key={title}>
              <SidebarMenuButton asChild>
                <Link
                  to={url}
                  className="flex border items-center p-4 hover:!bg-muted gap-2"
                >
                  <Icon className="size-4" />
                  {title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
