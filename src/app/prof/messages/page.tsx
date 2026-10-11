import { Messagerie } from "@/components/messagerie/Messagerie";
import { PageHeader } from "@/components/ui";

export default function MessagesProfPage({
  searchParams,
}: {
  searchParams: Promise<{ avec?: string; nouveau?: string }>;
}) {
  return (
    <div>
      <PageHeader title="Messages" description="Communiquez avec les élèves, parents et la direction." />
      <Messagerie basePath="/prof/messages" searchParams={searchParams} />
    </div>
  );
}
