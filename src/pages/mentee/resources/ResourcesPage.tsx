import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatWithSources from "@/pages/mentor/resources/tabs/ChatWithSources.tsx";
import MyMentorsResources from "@/pages/mentee/resources/tabs/MyMentorsResources.tsx";

const ResourcesPage = () => {
  return (
    <div>
      <Tabs defaultValue="resources" className="">
        <div className={"bg-white p-3 border-1 shadow rounded-xl mb-4"}>
          <TabsList>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="chat">Chat with Resources</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="resources">
          <MyMentorsResources />
        </TabsContent>

        <TabsContent value="chat">
          <ChatWithSources />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourcesPage;
