import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import FileTab from "@/pages/mentor/resources/tabs/FileTab.tsx";
import WebsiteTab from "@/pages/mentor/resources/tabs/WebsiteTab.tsx";
import YoutubeTab from "@/pages/mentor/resources/tabs/YoutubeTab.tsx";

const CreateSources = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="file" className="w-full">
            <TabsList>
              <TabsTrigger value="file">File</TabsTrigger>
              <TabsTrigger value="website">Website</TabsTrigger>
              <TabsTrigger value="youtube">Youtube</TabsTrigger>
            </TabsList>
            <TabsContent value="file" className={"w-full"}>
              <FileTab />
            </TabsContent>
            <TabsContent value="website">
              <WebsiteTab />
            </TabsContent>
            <TabsContent value="youtube">
              <YoutubeTab />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateSources;
