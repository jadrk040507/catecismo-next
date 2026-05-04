#!/usr/bin/env python3
"""Migrate all content to Frappe LMS"""
import frappe
import json
import os

CONTENT_BASE = "/workspace/content-lessons"

SECTION_MAP = {
    "es": {
        "credo": {"title": "El Credo", "title_en": "The Creed", "order": 1},
        "sacramentos": {"title": "Los Sacramentos", "title_en": "The Sacraments", "order": 2},
        "moral": {"title": "La Vida Moral", "title_en": "The Moral Life", "order": 3},
        "oracion": {"title": "La Oración", "title_en": "Prayer", "order": 4},
    },
    "en": {
        "credo": {"title": "The Creed", "title_es": "El Credo", "order": 1},
        "sacraments": {"title": "The Sacraments", "title_es": "Los Sacramentos", "order": 2},
        "moral": {"title": "The Moral Life", "title_es": "La Vida Moral", "order": 3},
        "prayer": {"title": "Prayer", "title_es": "La Oración", "order": 4},
    },
}

def load_json(path):
    """Load a JSON data file"""
    full_path = os.path.join(path, "data.json")
    if os.path.exists(full_path):
        with open(full_path, "r") as f:
            return json.load(f)
    return None

def create_bilingual_course(section_key, section_meta, order):
    """Create one bilingual course per section"""
    es_title = section_meta.get("title", section_key)
    en_title = section_meta.get("title_en", section_meta.get("title", section_key))
    
    # Check if exists
    existing = frappe.db.get_value("LMS Course", {"title": es_title}, "name")
    if existing:
        print(f"  Course '{es_title}' already exists: {existing}")
        return existing
    
    course = frappe.get_doc({
        "doctype": "LMS Course",
        "title": es_title,
        "short_introduction": f"{en_title} / {es_title}",
        "description": f"Catequesis católica — {es_title}. Basado en el Catecismo de la Iglesia Católica.\n\nCatholic catechesis — {en_title}. Based on the Catechism of the Catholic Church.",
        "published": 1,
        "disable_self_learning": 0,
        "status": "Approved",
        "featured": 1 if order <= 2 else 0,
        "upcoming": 0,
        "paid_course": 0,
        "enable_certification": 0,
        "tags": "catecismo, catechism, católico, catholic, catequesis",
    })
    course.insert()
    frappe.db.commit()
    print(f"  ✅ Created course: {es_title} ({course.name})")
    return course.name

def create_chapter(course_name, lesson_data, idx):
    """Create a chapter for one topic"""
    title = lesson_data["title"].replace("&mdash;", "—").replace("&mdash", "—")
    
    existing = frappe.db.get_value("Course Chapter", {
        "course": course_name,
        "title": title,
    }, "name")
    if existing:
        print(f"    Chapter '{title}' exists: {existing}")
        return existing
    
    chapter = frappe.get_doc({
        "doctype": "Course Chapter",
        "course": course_name,
        "title": title,
        "is_scorm_package": 0,
    })
    chapter.insert()
    frappe.db.commit()
    print(f"    ✅ Chapter: {title} ({chapter.name})")
    return chapter.name

def create_lesson(chapter_name, course_name, lesson_data, lesson_type="lesson"):
    """Create a lesson (lesson, workbook, or guide)"""
    title = lesson_data["title"].replace("&mdash;", "—").replace("&mdash", "—")
    if lesson_type == "workbook":
        title += " — Workbook"
    elif lesson_type == "guide":
        title += " — Guía del Catequista"
    
    html_content = lesson_data.get("html", "")
    
    existing = frappe.db.get_value("Course Lesson", {
        "chapter": chapter_name,
        "title": title,
    }, "name")
    if existing:
        print(f"      Lesson '{title}' exists: {existing}")
        return existing
    
    # Convert HTML to Markdown-style body
    body = f'<div class="lesson-content">\n{html_content}\n</div>'
    
    lesson = frappe.get_doc({
        "doctype": "Course Lesson",
        "chapter": chapter_name,
        "course": course_name,
        "title": title,
        "body": body,
        "content": html_content,
        "include_in_preview": 1 if lesson_type == "lesson" else 0,
    })
    lesson.insert()
    frappe.db.commit()
    print(f"      ✅ {lesson_type}: {title}")
    return lesson.name

def migrate_section(lang, section_key, course_name):
    """Migrate all lessons in a section"""
    section_path = os.path.join(CONTENT_BASE, lang, section_key)
    if not os.path.exists(section_path):
        print(f"  Path not found: {section_path}")
        return
    
    # Get all lesson dirs (excluding index, and treating base lesson only)
    dirs = sorted([
        d for d in os.listdir(section_path)
        if os.path.isdir(os.path.join(section_path, d))
        and not d.startswith("index")
        and not d.endswith("-guide")
        and not d.endswith("-workbook")
    ])
    
    for idx, d in enumerate(dirs):
        lesson_path = os.path.join(section_path, d)
        lesson_data = load_json(lesson_path)
        if not lesson_data:
            print(f"    ⚠️ No data for {d}")
            continue
        
        # Create chapter for this lesson
        chapter_name = create_chapter(course_name, lesson_data, idx + 1)
        
        # Create main lesson
        create_lesson(chapter_name, course_name, lesson_data, "lesson")
        
        # Create workbook if exists
        wb_path = os.path.join(section_path, d + "-workbook")
        wb_data = load_json(wb_path)
        if wb_data:
            create_lesson(chapter_name, course_name, wb_data, "workbook")
        
        # Create guide if exists
        gd_path = os.path.join(section_path, d + "-guide")
        gd_data = load_json(gd_path)
        if gd_data:
            create_lesson(chapter_name, course_name, gd_data, "guide")
    
    print(f"  ✅ Migrated {len(dirs)} topics in {section_key}")

def main():
    print("=" * 60)
    print("Catecismo Migration to Frappe LMS")
    print("=" * 60)
    
    # Process Spanish sections first (these become the primary courses)
    for section_key in ["credo", "sacramentos", "moral", "oracion"]:
        meta = SECTION_MAP["es"][section_key]
        print(f"\n📚 Section: {meta['title']} (ES)")
        course_name = create_bilingual_course(section_key, meta, meta["order"])
        migrate_section("es", section_key, course_name)
        
        # Now migrate corresponding EN content into same course
        en_key = section_key if section_key != "oracion" else "prayer"
        if section_key == "oracion":
            en_key = "prayer"
        print(f"\n   Adding EN content to: {meta['title']}")
        
        en_section_path = os.path.join(CONTENT_BASE, "en", en_key)
        if os.path.exists(en_section_path):
            # For EN content, we add to existing chapters - match by index
            dirs = sorted([
                d for d in os.listdir(en_section_path)
                if os.path.isdir(os.path.join(en_section_path, d))
                and not d.startswith("index")
                and not d.endswith("-guide")
                and not d.endswith("-workbook")
            ])
            
            # Get existing chapters for this course
            chapters = frappe.get_all("Course Chapter", 
                filters={"course": course_name},
                fields=["name", "title"],
                order_by="creation"
            )
            
            for idx, d in enumerate(dirs):
                if idx >= len(chapters):
                    break
                chapter_name = chapters[idx]["name"]
                lesson_path = os.path.join(en_section_path, d)
                lesson_data = load_json(lesson_path)
                if not lesson_data:
                    continue
                
                # Add EN lesson alongside existing ES lesson
                create_lesson(chapter_name, course_name, lesson_data, "lesson")
                
                # EN workbook
                wb_path = os.path.join(en_section_path, d + "-workbook")
                wb_data = load_json(wb_path)
                if wb_data:
                    create_lesson(chapter_name, course_name, wb_data, "workbook")
                
                # EN guide
                gd_path = os.path.join(en_section_path, d + "-guide")
                gd_data = load_json(gd_path)
                if gd_data:
                    create_lesson(chapter_name, course_name, gd_data, "guide")
    
    print("\n" + "=" * 60)
    print("✅ Migration complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
