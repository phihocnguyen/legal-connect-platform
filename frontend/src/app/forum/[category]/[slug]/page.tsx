import { use } from "react";
import { ThreadPageContent } from "./thread-page";

export default function ThreadPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const routeParams = use(params);

  return (
    <ThreadPageContent
      category={routeParams.category}
      slug={routeParams.slug}
    />
  );
}
