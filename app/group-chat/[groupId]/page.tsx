import ChatWindow from "@/components/chat/chat-window";

interface PageProps {
  params: Promise<{
    groupId: string;
  }>;
}

export default async function IndividualChatPage({ params }: PageProps) {
  const { groupId } = await params;
  const groupIdNum = parseInt(groupId, 10);

  if (isNaN(groupIdNum)) {
    return <div>Invalid Group ID</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Group Chat Room</h1>
      <ChatWindow groupId={groupIdNum} />
    </div>
  );
}
