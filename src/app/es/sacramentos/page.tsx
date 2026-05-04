"use client";
import SectionIndex from "@/components/SectionIndex";

const topics = [{"slug": "11-la-liturgia", "title": "La Liturgia", "cic": ""}, {"slug": "12-el-misterio-pascual", "title": "El Misterio Pascual", "cic": ""}, {"slug": "13-el-bautismo", "title": "El Bautismo", "cic": ""}, {"slug": "14-la-confirmacion", "title": "La Confirmación: El Don de la Fortaleza", "cic": ""}, {"slug": "15-la-eucaristia", "title": "La Eucaristía", "cic": ""}, {"slug": "16-la-reconciliacion", "title": "La Reconciliaci&oacute;n", "cic": ""}, {"slug": "17-la-uncion", "title": "La Unción de los Enfermos", "cic": ""}, {"slug": "18-el-orden", "title": "El Orden Sagrado", "cic": ""}, {"slug": "19-el-matrimonio", "title": "El Matrimonio", "cic": ""}, {"slug": "20-la-comunion", "title": "Los Sacramentales y Las Exequias", "cic": ""}];

export default function Page() {
  return <SectionIndex section="sacramentos" topics={topics} />;
}
