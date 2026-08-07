import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { InfoPage, RichText } from "@/components/site-chrome";
import { contentPagesQuery } from "@/lib/store";

/**
 * Renders the admin-editable copy for a page when one exists in the database,
 * otherwise falls back to the built-in content for that page.
 */
export function EditablePage({
  slug,
  title,
  children,
}: {
  slug: string;
  title: string;
  children: ReactNode;
}) {
  const { data } = useQuery(contentPagesQuery);
  const page = (data ?? []).find((p) => p.slug === slug);

  if (!page || !page.body.trim()) return <>{children}</>;

  return (
    <InfoPage title={page.title || title}>
      <RichText body={page.body} />
    </InfoPage>
  );
}