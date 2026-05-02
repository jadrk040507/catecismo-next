"use client";
import SectionIndex from "@/components/SectionIndex";

const topics = [{"slug": "11-la-liturgia", "title": "11 — La Liturgia", "cic": ""}, {"slug": "12-el-misterio-pascual", "title": "12 — El Misterio Pascual", "cic": ""}, {"slug": "13-el-bautismo", "title": "El Bautismo", "cic": ""}, {"slug": "14-la-confirmacion", "title": "14 — La Confirmación: El Don de la Fortaleza", "cic": ""}, {"slug": "15-la-eucaristia", "title": "15 — La Eucaristía", "cic": ""}, {"slug": "16-la-reconciliacion", "title": "16 — La Reconciliaci&oacute;n", "cic": ""}, {"slug": "17-la-uncion", "title": "17 — La Unción de los Enfermos", "cic": ""}, {"slug": "18-el-orden", "title": "18 — El Orden Sagrado", "cic": ""}, {"slug": "19-el-matrimonio", "title": "El Matrimonio", "cic": ""}, {"slug": "20-la-comunion", "title": "Los Sacramentales y Las Exequias", "cic": ""}];

export default function Page() {
  return <SectionIndex section="sacramentos" topics={topics} />;
}
