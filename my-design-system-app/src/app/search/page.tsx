import { WeaveSearchResultsPage } from "@/components/weave/WeaveSearchResultsPage";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params?.q ?? "";

  return <WeaveSearchResultsPage query={query} />;
}
