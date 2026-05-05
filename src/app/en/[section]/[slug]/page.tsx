import fs from "fs";
import path from "path";
import LessonLayoutClient from "@/components/LessonLayout";

interface LessonData {
  title: string;
  cic: string;
  scripture: string;
  html: string;
}

interface Params {
  section: string;
  slug: string;
}

export async function generateStaticParams(): Promise<Params[]> {
  const filePath = path.join(process.cwd(), "public/static-params-en.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const params: { section: string; slug: string }[] = JSON.parse(raw);

  // Map content directory sections to URL sections
  return params.map(p => ({
    section:
      p.section === "sacramentos" ? "sacraments"
        : p.section === "oracion" ? "prayer"
        : p.section,
    slug: p.slug,
  }));
}

function getLessonData(urlSection: string, slug: string): LessonData | null {
  // Map URL section back to content directory section
  const contentSection =
    urlSection === "sacraments" ? "sacramentos"
      : urlSection === "prayer" ? "oracion"
      : urlSection;

  try {
    const filePath = path.join(
      process.cwd(),
      "public/content-lessons/en",
      contentSection,
      slug,
      "data.json"
    );
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { section, slug } = await params;
  const data = getLessonData(section, slug);

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink mb-4">404</h1>
        <p className="text-ink-soft">Lesson not found</p>
      </div>
    );
  }

  return (
    <LessonLayoutClient
      title={data.title}
      cic={data.cic}
      scripture={data.scripture}
      htmlContent={data.html}
    >
      <div dangerouslySetInnerHTML={{ __html: data.html }} />
    </LessonLayoutClient>
  );
}
