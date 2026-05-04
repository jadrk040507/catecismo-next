#!/usr/bin/env python3
"""Migrate all catecismo content to Frappe LMS via REST API"""
import requests
import json
import os
from pathlib import Path

BASE_URL = "https://catecismo.kipadmon.com"
SESSION = requests.Session()

CONTENT_BASE = "/home/family/Dropbox/Agents/workspace/catecismo-next/public/content-lessons"

COURSES = {
    "es_credo": {"title": "El Credo", "intro": "Lo que creemos — Catecismo", "desc": "Primer pilar del Catecismo. Basado en el CIC 27-1065."},
    "es_sacramentos": {"title": "Los Sacramentos", "intro": "La vida de la gracia — Catecismo", "desc": "Segundo pilar del Catecismo. Basado en el CIC 1066-1690."},
    "es_moral": {"title": "La Vida Moral", "intro": "Vivir en Cristo — Catecismo", "desc": "Tercer pilar del Catecismo. Basado en el CIC 1691-2557."},
    "es_oracion": {"title": "La Oración", "intro": "Hablar con Dios — Catecismo", "desc": "Cuarto pilar del Catecismo. Basado en el CIC 2558-2865."},
    "en_credo": {"title": "The Creed", "intro": "What we believe — Catechism", "desc": "First pillar of the Catechism. Based on CCC 27-1065."},
    "en_sacraments": {"title": "The Sacraments", "intro": "The life of grace — Catechism", "desc": "Second pillar of the Catechism. Based on CCC 1066-1690."},
    "en_moral": {"title": "The Moral Life", "intro": "Living in Christ — Catechism", "desc": "Third pillar of the Catechism. Based on CCC 1691-2557."},
    "en_prayer": {"title": "Prayer", "intro": "Speaking with God — Catechism", "desc": "Fourth pillar of the Catechism. Based on CCC 2558-2865."},
}

SECTION_MAPPING = {
    "es": {"credo": "es_credo", "sacramentos": "es_sacramentos", "moral": "es_moral", "oracion": "es_oracion"},
    "en": {"credo": "en_credo", "sacraments": "en_sacraments", "moral": "en_moral", "prayer": "en_prayer"},
}

def api(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    if method == "GET":
        resp = SESSION.get(url)
    elif method == "POST":
        resp = SESSION.post(url, json=data)
    else:
        resp = SESSION.request(method, url, json=data)
    try:
        return resp.json()
    except:
        return {"error": resp.text[:500]}

def login():
    r = api("/api/method/login", "POST", {"usr": "Administrator", "pwd": "admin123"})
    if r.get("message") == "Logged In":
        print("✅ Logged in as Administrator")
        return True
    print("❌ Login failed:", r)
    return False

def create_course(key, info):
    """Create a course if it doesn't exist"""
    # Check if exists
    check = api(f"/api/resource/LMS Course/{info['title'].lower().replace(' ', '-')}")
    if check.get("data"):
        print(f"  ⏭ Course exists: {info['title']}")
        return check["data"]["name"]
    
    r = api("/api/resource/LMS Course", "POST", {
        "title": info["title"],
        "short_introduction": info["intro"],
        "description": info["desc"],
        "published": 1,
        "status": "Approved",
        "disable_self_learning": 0,
        "upcoming": 0,
        "paid_course": 0,
        "instructors": [{"instructor": "Administrator"}],
    })
    
    if "data" in r:
        print(f"  ✅ Created: {info['title']} ({r['data']['name']})")
        return r["data"]["name"]
    else:
        print(f"  ❌ Failed: {info['title']} — {r.get('exc','?')[:200]}")
        return None

def create_chapter(course_name, title):
    """Create a chapter"""
    # Check exists
    check = api(f"/api/resource/Course Chapter?filters=[[\"course\",\"=\",\"{course_name}\"],[\"title\",\"=\",\"{title}\"]]")
    if check.get("data") and len(check["data"]) > 0:
        return check["data"][0]["name"]
    
    r = api("/api/resource/Course Chapter", "POST", {
        "course": course_name,
        "title": title,
    })
    if "data" in r:
        return r["data"]["name"]
    else:
        print(f"    ❌ Chapter failed: {title[:60]} — {r.get('exc','?')[:150]}")
        return None

def create_lesson(chapter_name, course_name, title, html_body, include_preview=1):
    """Create a lesson"""
    # Check exists
    check = api(f"/api/resource/Course Lesson?filters=[[\"chapter\",\"=\",\"{chapter_name}\"],[\"title\",\"=\",\"{title}\"]]")
    if check.get("data") and len(check["data"]) > 0:
        return check["data"][0]["name"]
    
    # Truncate if too long (Frappe has limits)
    if len(html_body) > 400000:
        html_body = html_body[:400000]
    
    r = api("/api/resource/Course Lesson", "POST", {
        "chapter": chapter_name,
        "course": course_name,
        "title": title,
        "body": html_body,
        "include_in_preview": include_preview,
    })
    if "data" in r:
        return r["data"]["name"]
    else:
        err = str(r.get("exc", ""))[:200]
        print(f"      ❌ Lesson failed: {title[:40]} — {err}")
        return None

def migrate_section(lang, section, course_name):
    """Migrate all lessons in a section"""
    section_path = os.path.join(CONTENT_BASE, lang, section)
    if not os.path.exists(section_path):
        print(f"  Path not found: {section_path}")
        return
    
    dirs = sorted([
        d for d in os.listdir(section_path)
        if os.path.isdir(os.path.join(section_path, d))
        and not d.startswith("index")
        and not d.endswith("-guide")
        and not d.endswith("-workbook")
    ])
    
    print(f"  Migrating {len(dirs)} topics...")
    
    for idx, d in enumerate(dirs):
        # Main lesson
        lesson_path = os.path.join(section_path, d, "data.json")
        if not os.path.exists(lesson_path):
            continue
        
        with open(lesson_path) as f:
            lesson_data = json.load(f)
        
        ch_title = lesson_data["title"].replace("&mdash;", "—").replace("&mdash", "—")
        chapter = create_chapter(course_name, ch_title)
        if chapter:
            create_lesson(chapter, course_name, ch_title, lesson_data.get("html", ""), 1)
        else:
            continue
        
        # Workbook
        wb_path = os.path.join(section_path, d + "-workbook", "data.json")
        if os.path.exists(wb_path):
            with open(wb_path) as f:
                wb_data = json.load(f)
            wb_title = ch_title + " — Workbook"
            create_lesson(chapter, course_name, wb_title, wb_data.get("html", ""), 0)
        
        # Guide
        gd_path = os.path.join(section_path, d + "-guide", "data.json")
        if os.path.exists(gd_path):
            with open(gd_path) as f:
                gd_data = json.load(f)
            gd_title = ch_title + " — Guía"
            create_lesson(chapter, course_name, gd_title, gd_data.get("html", ""), 0)
        
        if (idx + 1) % 5 == 0:
            print(f"    ... {idx + 1}/{len(dirs)} topics done")

    print(f"  ✅ Done: {section} ({len(dirs)} topics)")

def main():
    if not login():
        return
    
    # Create all courses
    print("\n📚 Creating courses...")
    course_ids = {}
    for key, info in COURSES.items():
        name = create_course(key, info)
        if name:
            course_ids[key] = name
    
    # Migrate Spanish
    print("\n🇪🇸 Migrating Spanish content...")
    for section, course_key in SECTION_MAPPING["es"].items():
        if course_key in course_ids:
            print(f"\n  📖 {COURSES[course_key]['title']}")
            migrate_section("es", section, course_ids[course_key])
    
    # Migrate English
    print("\n🇺🇸 Migrating English content...")
    for section, course_key in SECTION_MAPPING["en"].items():
        if course_key in course_ids:
            print(f"\n  📖 {COURSES[course_key]['title']}")
            migrate_section("en", section, course_ids[course_key])
    
    # Verify
    print("\n" + "=" * 60)
    print("Counting courses in LMS...")
    courses = api("/api/resource/LMS Course?fields=[\"title\"]&limit=20")
    if courses.get("data"):
        print(f"Total courses: {len(courses['data'])}")
        for c in courses["data"]:
            count = api(f"/api/resource/Course Lesson?filters=[[\"course\",\"=\",\"{c['name']}\"]]&fields=[\"name\"]&limit=1000")
            lesson_count = len(count.get("data", []))
            print(f"  {c['title']:30s} → {lesson_count} lessons")
    
    print("\n✅ Migración completada!")

if __name__ == "__main__":
    main()
