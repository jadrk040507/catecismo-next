"use client";
import SectionIndex from "@/components/SectionIndex";

const topics = [{"slug": "11-the-liturgy", "title": "11 — The Liturgy", "cic": ""}, {"slug": "12-the-paschal-mystery", "title": "12 — The Paschal Mystery", "cic": ""}, {"slug": "13-baptism", "title": "Baptism", "cic": ""}, {"slug": "14-confirmation", "title": "Confirmation: The Gift of Fortitude", "cic": ""}, {"slug": "15-the-eucharist", "title": "15 — The Eucharist", "cic": ""}, {"slug": "16-reconciliation", "title": "16 — Reconciliation", "cic": ""}, {"slug": "17-anointing", "title": "17 — The Anointing of the Sick", "cic": ""}, {"slug": "18-holy-orders", "title": "18 — Holy Orders", "cic": ""}, {"slug": "19-matrimony", "title": "Matrimony", "cic": ""}, {"slug": "20-sacramentals", "title": "Sacramentals and Funerals", "cic": ""}];

export default function Page() {
  return <SectionIndex section="sacramentos" topics={topics} />;
}
