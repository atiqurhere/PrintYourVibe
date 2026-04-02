import PublicLayout from "@/components/layout/PublicLayout";

export default function RouteGroupPublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
