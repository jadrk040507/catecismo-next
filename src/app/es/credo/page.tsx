"use client";
import SectionIndex from "@/components/SectionIndex";

const topics = [{"slug": "01-deseo-de-dios", "title": "01 — El Deseo de Dios", "cic": ""}, {"slug": "02-revelacion-de-dios", "title": "02 — La Revelaci&oacute;n de Dios", "cic": ""}, {"slug": "03-dios-es-padre", "title": "03 — Dios es Padre", "cic": ""}, {"slug": "04-jesucristo-dios-y-hombre", "title": "04 — Jesucristo, Dios y Hombre", "cic": ""}, {"slug": "05-la-encarnacion", "title": "La Encarnación / The Incarnation", "cic": ""}, {"slug": "06-el-espiritu-santo", "title": "El Espíritu Santo", "cic": ""}, {"slug": "07-la-santisima-trinidad", "title": "La Santísima Trinidad", "cic": ""}, {"slug": "08-creacion-y-providencia", "title": "Creación y Providencia", "cic": ""}, {"slug": "09-el-hombre-y-el-pecado", "title": "El Hombre y el Pecado / Man and Sin", "cic": ""}, {"slug": "10-la-iglesia-pueblo-de-dios", "title": "La Iglesia, Pueblo de Dios", "cic": ""}];

export default function Page() {
  return <SectionIndex section="credo" topics={topics} />;
}
