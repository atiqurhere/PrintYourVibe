import type { Metadata } from "next";
import MockupClientWrapper from "@/components/mockup/MockupClientWrapper";

export const metadata: Metadata = {
  title: "Mockup Tool — Design Your Custom Print | PrintYourVibe",
  description: "Upload your design and see it live on premium garments. No account needed. Free to try.",
};

export default function MockupPage() {
  return <MockupClientWrapper />;
}
