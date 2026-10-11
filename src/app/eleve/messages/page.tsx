import { Messagerie } from "@/components/messagerie/Messagerie";
import { PageHeader } from "@/components/ui";

export default function MessagesElevePage({
  searchParams,
}: {
  searchParams: Promise<{ avec?: string; nouveau?: string }>;
}) {
  return (
    <div>
      <PageHeader title="Messages" description="Communique avec tes professeurs et la direction." />
      <Messagerie basePath="/eleve/messages" searchParams={searchParams} />
    </div>
  );
}
