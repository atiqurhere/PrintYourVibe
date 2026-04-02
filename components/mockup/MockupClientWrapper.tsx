"use client";
import dynamic from "next/dynamic";

const MockupTool = dynamic(() => import("@/components/mockup/MockupTool"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        <p className="font-label text-xs uppercase tracking-widest text-cream-faint">Loading mockup tool…</p>
      </div>
    </div>
  ),
});

export default function MockupClientWrapper({ initialProductSlug }: { initialProductSlug?: string }) {
  return <MockupTool initialProductSlug={initialProductSlug} />;
}
