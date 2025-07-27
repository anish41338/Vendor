// app/group-chat/page.tsx
import GroupList from "@/components/chat/group-list";
import VendorLocation from "@/components/chat/vendor-location";
import { Separator } from "@/components/ui/separator";

export default function GroupChatPage() {
  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Group Ordering</h1>
        <p className="text-muted-foreground">
          Find nearby vendors to start a group chat for bulk order discounts.
        </p>
      </div>
      <VendorLocation />
      <Separator />
      <GroupList />
    </div>
  );
}