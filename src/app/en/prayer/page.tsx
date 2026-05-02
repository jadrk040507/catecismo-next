"use client";
import SectionIndex from "@/components/SectionIndex";

const topics = [{"slug": "33-christian-prayer", "title": "Christian Prayer", "cic": ""}, {"slug": "34-sources-of-prayer", "title": "The Sources of Prayer", "cic": ""}, {"slug": "35-the-contemplative-tradition", "title": "The Contemplative Tradition", "cic": ""}, {"slug": "36-our-father", "title": "The Our Father", "cic": ""}, {"slug": "37-seven-petitions", "title": "The Seven Petitions", "cic": ""}];

export default function Page() {
  return <SectionIndex section="oracion" topics={topics} />;
}
