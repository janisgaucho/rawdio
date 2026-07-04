"use client";

import CategoryView from "@/components/library/CategoryView";
import { Music2 } from "lucide-react";

export default function BeatmakersPage() {
  return <CategoryView title="Beatmakers" type="beatmaker" icon={Music2} />;
}
