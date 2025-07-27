// app/group-chat/[groupId]/page.tsx
import ChatWindow from "@/components/chat/chat-window";

interface PageProps {
  params: {
    groupId: string;
  };
}

export default  async function IndividualChatPage({ params }: PageProps) {
  const groupId = parseInt(params.groupId, 10);

  if (isNaN(groupId)) {
    return <div>Invalid Group ID</div>;
  }

  return (
    <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Group Chat Room</h1>
        <ChatWindow groupId={groupId} />
    </div>
  )
}