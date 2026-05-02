"use client";
import SectionIndex from "@/components/SectionIndex";

const topics = [{"slug": "21-human-dignity", "title": "21 — The Dignity of the Human Person", "cic": ""}, {"slug": "22-the-beatitudes", "title": "The Beatitudes: The Path to True Happiness", "cic": ""}, {"slug": "23-freedom", "title": "23 — Human Freedom", "cic": ""}, {"slug": "24-conscience", "title": "24 — Moral Conscience", "cic": ""}, {"slug": "25-virtues", "title": "25 — The Virtues", "cic": ""}, {"slug": "26-sin", "title": "26 — Sin", "cic": ""}, {"slug": "27-justice", "title": "27 — Justice", "cic": ""}, {"slug": "28-respect", "title": "28 — Respect for Human Life", "cic": ""}, {"slug": "29-truth", "title": "29 — Truth: Living in the Light", "cic": ""}, {"slug": "30-sexuality", "title": "30 — Human Sexuality", "cic": ""}, {"slug": "31-work", "title": "Human Work", "cic": ""}, {"slug": "32-community", "title": "Community: Living the Faith Together", "cic": ""}];

export default function Page() {
  return <SectionIndex section="moral" topics={topics} />;
}
