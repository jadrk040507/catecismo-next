"use client";
import SectionIndex from "@/components/SectionIndex";

const topics = [{"slug": "21-human-dignity", "title": "The Dignity of the Human Person", "cic": ""}, {"slug": "22-the-beatitudes", "title": "The Beatitudes: The Path to True Happiness", "cic": ""}, {"slug": "23-freedom", "title": "Human Freedom", "cic": ""}, {"slug": "24-conscience", "title": "Moral Conscience", "cic": ""}, {"slug": "25-virtues", "title": "The Virtues", "cic": ""}, {"slug": "26-sin", "title": "Sin", "cic": ""}, {"slug": "27-justice", "title": "Justice", "cic": ""}, {"slug": "28-respect", "title": "Respect for Human Life", "cic": ""}, {"slug": "29-truth", "title": "Truth: Living in the Light", "cic": ""}, {"slug": "30-sexuality", "title": "Human Sexuality", "cic": ""}, {"slug": "31-work", "title": "Human Work", "cic": ""}, {"slug": "32-community", "title": "Community: Living the Faith Together", "cic": ""}];

export default function Page() {
  return <SectionIndex section="moral" topics={topics} />;
}
