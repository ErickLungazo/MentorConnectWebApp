import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateSources from "@/pages/mentor/resources/tabs/CreateSources.tsx";
import AllResources from "@/pages/mentor/resources/tabs/AllResources.tsx";
import ChatWithSources from "@/pages/mentor/resources/tabs/ChatWithSources.tsx";

const ManageResourcesPage = () => {
  return (
    <div>
      <Tabs defaultValue="resources" className="">
        <div className={"bg-white p-3 border-1 shadow rounded-xl mb-4"}>
          <TabsList>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="upload">Upload Resources</TabsTrigger>
            <TabsTrigger value="chat">Chat with Resources</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="resources">
          <AllResources />
        </TabsContent>
        <TabsContent value="upload">
          <CreateSources />
        </TabsContent>{" "}
        <TabsContent value="chat">
          <ChatWithSources />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageResourcesPage;
