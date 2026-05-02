"use client";
import SectionIndex from "@/components/SectionIndex";

const topics = [{"slug": "21-la-dignidad-humana", "title": "21 — La Dignidad Humana", "cic": ""}, {"slug": "22-la-bienaventuranza", "title": "22 — La Bienaventuranza", "cic": ""}, {"slug": "23-la-libertad", "title": "23 — La Libertad del Hombre", "cic": ""}, {"slug": "24-la-conciencia", "title": "24 — La Conciencia Moral", "cic": ""}, {"slug": "25-las-virtudes", "title": "25 — Las Virtudes", "cic": ""}, {"slug": "26-el-pecado", "title": "26 — El Pecado", "cic": ""}, {"slug": "27-la-justicia", "title": "27 — La Justicia", "cic": ""}, {"slug": "28-el-respeto", "title": "28 — El Respeto a la Vida Humana", "cic": ""}, {"slug": "29-la-verdad", "title": "29 — La Verdad y la Veracidad", "cic": ""}, {"slug": "30-la-sexualidad", "title": "La Sexualidad Humana", "cic": ""}, {"slug": "31-el-trabajo", "title": "El Trabajo Humano", "cic": ""}, {"slug": "32-la-comunidad", "title": "La Comunidad: Vivir la Fe en Común", "cic": ""}];

export default function Page() {
  return <SectionIndex section="moral" topics={topics} />;
}
