/**
 * Shared lesson index — all 37 lessons across 4 sections, ES + EN.
 * Used by search, navigation, and cross-referencing.
 */

export interface LessonEntry {
  slug: string;
  title: { es: string; en: string };
  section: "credo" | "sacramentos" | "moral" | "oracion";
  sectionSlug: { es: string; en: string };
}

export const lessonIndex: LessonEntry[] = [
  // Credo (01–10)
  { slug: "01-deseo-de-dios", title: { es: "El Deseo de Dios", en: "The Desire for God" }, section: "credo", sectionSlug: { es: "/es/credo", en: "/en/credo" } },
  { slug: "02-revelacion-de-dios", title: { es: "La Revelación de Dios", en: "Divine Revelation" }, section: "credo", sectionSlug: { es: "/es/credo", en: "/en/credo" } },
  { slug: "03-dios-es-padre", title: { es: "Dios es Padre", en: "God is Father" }, section: "credo", sectionSlug: { es: "/es/credo", en: "/en/credo" } },
  { slug: "04-jesucristo-dios-y-hombre", title: { es: "Jesucristo, Dios y Hombre", en: "Jesus Christ, God and Man" }, section: "credo", sectionSlug: { es: "/es/credo", en: "/en/credo" } },
  { slug: "05-la-encarnacion", title: { es: "La Encarnación", en: "The Incarnation" }, section: "credo", sectionSlug: { es: "/es/credo", en: "/en/credo" } },
  { slug: "06-el-espiritu-santo", title: { es: "El Espíritu Santo", en: "The Holy Spirit" }, section: "credo", sectionSlug: { es: "/es/credo", en: "/en/credo" } },
  { slug: "07-la-santisima-trinidad", title: { es: "La Santísima Trinidad", en: "The Holy Trinity" }, section: "credo", sectionSlug: { es: "/es/credo", en: "/en/credo" } },
  { slug: "08-creacion-y-providencia", title: { es: "Creación y Providencia", en: "Creation and Providence" }, section: "credo", sectionSlug: { es: "/es/credo", en: "/en/credo" } },
  { slug: "09-el-hombre-y-el-pecado", title: { es: "El Hombre y el Pecado", en: "Man and Sin" }, section: "credo", sectionSlug: { es: "/es/credo", en: "/en/credo" } },
  { slug: "10-la-iglesia-pueblo-de-dios", title: { es: "La Iglesia, Pueblo de Dios", en: "The Church, People of God" }, section: "credo", sectionSlug: { es: "/es/credo", en: "/en/credo" } },

  // Sacramentos (11–20)
  { slug: "11-la-liturgia", title: { es: "La Liturgia", en: "The Liturgy" }, section: "sacramentos", sectionSlug: { es: "/es/sacramentos", en: "/en/sacraments" } },
  { slug: "12-el-misterio-pascual", title: { es: "El Misterio Pascual", en: "The Paschal Mystery" }, section: "sacramentos", sectionSlug: { es: "/es/sacramentos", en: "/en/sacraments" } },
  { slug: "13-el-bautismo", title: { es: "El Bautismo", en: "Baptism" }, section: "sacramentos", sectionSlug: { es: "/es/sacramentos", en: "/en/sacraments" } },
  { slug: "14-la-confirmacion", title: { es: "La Confirmación: El Don de la Fortaleza", en: "Confirmation: The Gift of Fortitude" }, section: "sacramentos", sectionSlug: { es: "/es/sacramentos", en: "/en/sacraments" } },
  { slug: "15-la-eucaristia", title: { es: "La Eucaristía", en: "The Eucharist" }, section: "sacramentos", sectionSlug: { es: "/es/sacramentos", en: "/en/sacraments" } },
  { slug: "16-la-reconciliacion", title: { es: "La Reconciliación", en: "Reconciliation" }, section: "sacramentos", sectionSlug: { es: "/es/sacramentos", en: "/en/sacraments" } },
  { slug: "17-la-uncion", title: { es: "La Unción de los Enfermos", en: "The Anointing of the Sick" }, section: "sacramentos", sectionSlug: { es: "/es/sacramentos", en: "/en/sacraments" } },
  { slug: "18-el-orden", title: { es: "El Orden Sagrado", en: "Holy Orders" }, section: "sacramentos", sectionSlug: { es: "/es/sacramentos", en: "/en/sacraments" } },
  { slug: "19-el-matrimonio", title: { es: "El Matrimonio", en: "Matrimony" }, section: "sacramentos", sectionSlug: { es: "/es/sacramentos", en: "/en/sacraments" } },
  { slug: "20-la-comunion", title: { es: "Los Sacramentales y Las Exequias", en: "Sacramentals and Funerals" }, section: "sacramentos", sectionSlug: { es: "/es/sacramentos", en: "/en/sacraments" } },

  // Moral (21–32)
  { slug: "21-la-dignidad-humana", title: { es: "La Dignidad Humana", en: "The Dignity of the Human Person" }, section: "moral", sectionSlug: { es: "/es/moral", en: "/en/moral" } },
  { slug: "22-la-bienaventuranza", title: { es: "La Bienaventuranza", en: "The Beatitudes: The Path to True Happiness" }, section: "moral", sectionSlug: { es: "/es/moral", en: "/en/moral" } },
  { slug: "23-la-libertad", title: { es: "La Libertad del Hombre", en: "Human Freedom" }, section: "moral", sectionSlug: { es: "/es/moral", en: "/en/moral" } },
  { slug: "24-la-conciencia", title: { es: "La Conciencia Moral", en: "Moral Conscience" }, section: "moral", sectionSlug: { es: "/es/moral", en: "/en/moral" } },
  { slug: "25-las-virtudes", title: { es: "Las Virtudes", en: "The Virtues" }, section: "moral", sectionSlug: { es: "/es/moral", en: "/en/moral" } },
  { slug: "26-el-pecado", title: { es: "El Pecado", en: "Sin" }, section: "moral", sectionSlug: { es: "/es/moral", en: "/en/moral" } },
  { slug: "27-la-justicia", title: { es: "La Justicia", en: "Justice" }, section: "moral", sectionSlug: { es: "/es/moral", en: "/en/moral" } },
  { slug: "28-el-respeto", title: { es: "El Respeto a la Vida Humana", en: "Respect for Human Life" }, section: "moral", sectionSlug: { es: "/es/moral", en: "/en/moral" } },
  { slug: "29-la-verdad", title: { es: "La Verdad y la Veracidad", en: "Truth: Living in the Light" }, section: "moral", sectionSlug: { es: "/es/moral", en: "/en/moral" } },
  { slug: "30-la-sexualidad", title: { es: "La Sexualidad Humana", en: "Human Sexuality" }, section: "moral", sectionSlug: { es: "/es/moral", en: "/en/moral" } },
  { slug: "31-el-trabajo", title: { es: "El Trabajo Humano", en: "Human Work" }, section: "moral", sectionSlug: { es: "/es/moral", en: "/en/moral" } },
  { slug: "32-la-comunidad", title: { es: "La Comunidad: Vivir la Fe en Común", en: "Community: Living the Faith Together" }, section: "moral", sectionSlug: { es: "/es/moral", en: "/en/moral" } },

  // Oración (33–37)
  { slug: "33-la-oracion-cristiana", title: { es: "La Oración Cristiana", en: "Christian Prayer" }, section: "oracion", sectionSlug: { es: "/es/oracion", en: "/en/prayer" } },
  { slug: "34-fuentes-de-la-oracion", title: { es: "Las Fuentes de la Oración", en: "The Sources of Prayer" }, section: "oracion", sectionSlug: { es: "/es/oracion", en: "/en/prayer" } },
  { slug: "35-tradicion-contemplativa", title: { es: "La Tradición Contemplativa", en: "The Contemplative Tradition" }, section: "oracion", sectionSlug: { es: "/es/oracion", en: "/en/prayer" } },
  { slug: "36-el-padre-nuestro", title: { es: "El Padre Nuestro", en: "The Our Father" }, section: "oracion", sectionSlug: { es: "/es/oracion", en: "/en/prayer" } },
  { slug: "37-las-siete-peticiones", title: { es: "Las Siete Peticiones", en: "The Seven Petitions" }, section: "oracion", sectionSlug: { es: "/es/oracion", en: "/en/prayer" } },
];

// EN slugs map (EN pages use different slugs)
const enSlugMap: Record<string, string> = {
  "01-deseo-de-dios": "01-desire-for-god",
  "02-revelacion-de-dios": "02-divine-revelation",
  "03-dios-es-padre": "03-god-is-father",
  "04-jesucristo-dios-y-hombre": "04-jesus-christ-god-and-man",
  "05-la-encarnacion": "05-the-incarnation",
  "06-el-espiritu-santo": "06-the-holy-spirit",
  "07-la-santisima-trinidad": "07-the-holy-trinity",
  "08-creacion-y-providencia": "08-creation-and-providence",
  "09-el-hombre-y-el-pecado": "09-man-and-sin",
  "10-la-iglesia-pueblo-de-dios": "10-the-church-people-of-god",
  "11-la-liturgia": "11-the-liturgy",
  "12-el-misterio-pascual": "12-the-paschal-mystery",
  "13-el-bautismo": "13-baptism",
  "14-la-confirmacion": "14-confirmation",
  "15-la-eucaristia": "15-the-eucharist",
  "16-la-reconciliacion": "16-reconciliation",
  "17-la-uncion": "17-anointing",
  "18-el-orden": "18-holy-orders",
  "19-el-matrimonio": "19-matrimony",
  "20-la-comunion": "20-sacramentals",
  "21-la-dignidad-humana": "21-human-dignity",
  "22-la-bienaventuranza": "22-the-beatitudes",
  "23-la-libertad": "23-freedom",
  "24-la-conciencia": "24-conscience",
  "25-las-virtudes": "25-virtues",
  "26-el-pecado": "26-sin",
  "27-la-justicia": "27-justice",
  "28-el-respeto": "28-respect",
  "29-la-verdad": "29-truth",
  "30-la-sexualidad": "30-sexuality",
  "31-el-trabajo": "31-work",
  "32-la-comunidad": "32-community",
  "33-la-oracion-cristiana": "33-christian-prayer",
  "34-fuentes-de-la-oracion": "34-sources-of-prayer",
  "35-tradicion-contemplativa": "35-the-contemplative-tradition",
  "36-el-padre-nuestro": "36-our-father",
  "37-las-siete-peticiones": "37-seven-petitions",
};

export function getLessonUrl(lesson: LessonEntry, lang: "es" | "en"): string {
  const base = lang === "en" ? lesson.sectionSlug.en : lesson.sectionSlug.es;
  const slug = lang === "en" ? (enSlugMap[lesson.slug] || lesson.slug) : lesson.slug;
  return `${base}/${slug}`;
}