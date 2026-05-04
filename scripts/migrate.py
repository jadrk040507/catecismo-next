import frappe, json, os, sys

# Config
langs = {"es": "Spanish", "en": "English"}
section_map = {
    "es": {"credo": "El Credo", "sacramentos": "Los Sacramentos", "moral": "La Vida Moral", "oracion": "La Oración"},
    "en": {"credo": "The Creed", "sacraments": "The Sacraments", "moral": "The Moral Life", "prayer": "Prayer"},
}

def load(path):
    with open(path) as f:
        return json.load(f)

def make_course(title, desc, order):
    existing = frappe.get_value("LMS Course", {"title": title}, "name")
    if existing:
        print(f"  ⏭ {title} already exists")
        return existing
    c = frappe.get_doc({"doctype": "LMS Course", "title": title, "short_introduction": desc,
        "description": f"Catequesis católica — {title}. Basado en el CIC.", 
        "published": 1, "disable_self_learning": 0, "status": "Approved",
        "upcoming": 0, "paid_course": 0,
    }).insert()
    frappe.db.commit()
    print(f"  ✅ Course: {title}")
    return c.name

def make_chapter(course, title):
    existing = frappe.get_value("Course Chapter", {"course": course, "title": title}, "name")
    if existing:
        print(f"    ⏭ {title}")
        return existing
    ch = frappe.get_doc({"doctype": "Course Chapter", "course": course, "title": title}).insert()
    frappe.db.commit()
    print(f"    ✅ Chapter: {title}")
    return ch.name

def make_lesson(chapter, course, title, body_html, include=1):
    existing = frappe.get_value("Course Lesson", {"chapter": chapter, "title": title}, "name")
    if existing:
        print(f"      ⏭ {title}")
        return existing
    ls = frappe.get_doc({"doctype": "Course Lesson", "chapter": chapter, "course": course, 
        "title": title, "body": f'<div class="lesson-content">{body_html}</div>',
        "include_in_preview": include}).insert()
    frappe.db.commit()
    print(f"      ✅ {title[:60]}")
    return ls.name

# === MIGRATE ===
base = "/workspace/content-lessons"

for lang, secs in [("es", ["credo","sacramentos","moral","oracion"]), ("en", ["credo","sacraments","moral","prayer"])]:
    for sec in secs:
        title = section_map[lang][sec]
        print(f"\n📚 {lang.upper()} — {title}")
        course = make_course(title, f"{title} ({lang})", 0)
        
        dpath = os.path.join(base, lang, sec)
        if not os.path.exists(dpath): continue
        
        dirs = sorted([d for d in os.listdir(dpath) 
            if os.path.isdir(os.path.join(dpath, d)) and not d.startswith("index") 
            and not d.endswith("-guide") and not d.endswith("-workbook")])
        
        for d in dirs:
            data = load(os.path.join(dpath, d, "data.json"))
            ch_title = data["title"].replace("&mdash;", "—")
            chapter = make_chapter(course, ch_title)
            make_lesson(chapter, course, ch_title, data.get("html",""), 1)
            
            # workbook
            wb = os.path.join(dpath, d+"-workbook", "data.json")
            if os.path.exists(wb):
                wb_data = load(wb)
                make_lesson(chapter, course, ch_title+" — Workbook", wb_data.get("html",""), 0)
            
            # guide
            gd = os.path.join(dpath, d+"-guide", "data.json")
            if os.path.exists(gd):
                gd_data = load(gd)
                make_lesson(chapter, course, ch_title+" — Guía", gd_data.get("html",""), 0)

print("\n✅ Migración completada!")
