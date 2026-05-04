"use client";
import SectionIndex from "@/components/SectionIndex";

const topics = [{"slug": "01-desire-for-god", "title": "The Desire for God", "cic": ""}, {"slug": "02-divine-revelation", "title": "Divine Revelation", "cic": ""}, {"slug": "03-god-is-father", "title": "God is Father", "cic": ""}, {"slug": "04-jesus-christ-god-and-man", "title": "Jesus Christ, God and Man", "cic": ""}, {"slug": "05-the-incarnation", "title": "The Incarnation", "cic": ""}, {"slug": "06-the-holy-spirit", "title": "The Holy Spirit", "cic": ""}, {"slug": "07-the-holy-trinity", "title": "The Holy Trinity", "cic": ""}, {"slug": "08-creation-and-providence", "title": "Creation and Providence", "cic": ""}, {"slug": "09-man-and-sin", "title": "Man and Sin", "cic": ""}, {"slug": "10-the-church-people-of-god", "title": "The Church, People of God", "cic": ""}];

export default function Page() {
  return <SectionIndex section="credo" topics={topics} />;
}
