import type { Metadata } from "next";
import MockupClientWrapper from "@/components/mockup/MockupClientWrapper";

export const metadata: Metadata = {
  title: "Customize Product — Mockup Tool | PrintYourVibe",
  description: "Design your custom print and see it live on premium garments.",
};

export default function MockupProductPage({
  params,
}: {
  params: { productSlug: string };
}) {
  return <MockupClientWrapper initialProductSlug={params.productSlug} />;
}
