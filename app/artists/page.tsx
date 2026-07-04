"use client";

import CategoryView from "@/components/library/CategoryView";
import { Mic2 } from "lucide-react";

export default function ArtistsPage() {
  return <CategoryView title="Artistes" type="artist" icon={Mic2} />;
}
