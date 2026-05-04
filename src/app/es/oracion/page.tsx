"use client";
import SectionIndex from "@/components/SectionIndex";

const topics = [{"slug": "33-la-oracion-cristiana", "title": "La Oración Cristiana", "cic": ""}, {"slug": "34-fuentes-de-la-oracion", "title": "Las Fuentes de la Oración", "cic": ""}, {"slug": "35-tradicion-contemplativa", "title": "La Tradición Contemplativa", "cic": ""}, {"slug": "36-el-padre-nuestro", "title": "El Padre Nuestro", "cic": ""}, {"slug": "37-las-siete-peticiones", "title": "Las Siete Peticiones", "cic": ""}];

export default function Page() {
  return <SectionIndex section="oracion" topics={topics} />;
}
