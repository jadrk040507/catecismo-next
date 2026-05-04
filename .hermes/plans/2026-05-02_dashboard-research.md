# Dashboard Research & Propuesta — Catecismo Digital

**Fecha:** 2026-05-02
**Autor:** Hermes + Juan Álvaro Díaz
**Estado:** Research / Planificación

---

## 1. Descubrimiento crítico: la DB tiene MUCHO más de lo que usamos

El dashboard actual consulta solo 2 tablas (`profiles`, `lesson_stats`)… ¡pero la DB tiene **9 tablas públicas** con datos riquísimos!

| Tabla | Columnas | Qué guarda |
|-------|----------|------------|
| `profiles` | 8 | Usuarios, rol, idioma |
| `courses` | 11 | Cursos (ES/EN), status, íconos |
| `lessons` | 14 | Lecciones con quizzes, guías, workbooks, tiempo estimado |
| `progress` | 10 | Progreso por usuario: completado, score, tiempo, scroll |
| `quizzes` | 8 | Preguntas con opciones JSON, explicaciones |
| `quiz_attempts` | 6 | Cada respuesta del usuario, correcta/incorrecta |
| `flashcards` | 7 | Tarjetas de estudio por lección |
| `flashcard_reviews` | 6 | Repasos con difficulty 1-5, next_review (spaced repetition!) |
| `bookmarks` | 6 | Marcadores con notas del usuario |

**Conclusión:** Podemos construir dashboards M U C H O más ricos sin recolectar nuevos datos. Todo está ahí.

---

## 2. Research: qué hacen las mejores plataformas educativas

### 2.1 Duolingo for Schools
- **Vista de clase:** progreso semanal, alumnos en riesgo, rachas
- **Métricas clave:** XP ganado, tiempo de práctica, lecciones completadas, % de precisión
- **Insight:** alumnos agrupados por nivel de engagement (activos, en riesgo, inactivos)
- **Gamificación:** leaderboards, badges, streaks

### 2.2 Khan Academy (Teacher Dashboard)
- **Mastery progress:** % de dominio por skill (no solo "completado")
- **Assignment scores:** distribución de notas por tarea
- **Time on task:** tiempo real de actividad vs tiempo estimado
- **Course mastery:** anillo de progreso circular por curso
- **Intervention flags:** alumnos con <70% que necesitan ayuda

### 2.3 Moodle / LMS tradicionales
- **Gradebook:** matriz de notas con medias, medianas
- **Activity completion:** tracking granular por recurso
- **Logs:** último acceso, IP, acciones realizadas
- **Reports:** exportables, personalizables
- **Course health:** % finalización, drop-off points

### 2.4 SaaS modernos (Linear, Notion, Vercel)
- **Widgets configurables:** drag & drop para reordenar
- **Sparklines:** mini-gráficos embebidos en tarjetas
- **Dark/light mode**
- **Real-time updates** (via Supabase realtime subscriptions)
- **Filtros avanzados:** por fecha, curso, idioma, rol

### 2.5 Catequesis específicamente
- **Tracking por sacramento:** Bautismo → Confirmación → Eucaristía
- **CIC coverage:** cuántos puntos del Catecismo se han cubierto
- **Guías del catequista:** cuántos catequistas usan las guías
- **Workbook completion:** hojas de trabajo terminadas
- **Print-ready reports:** para entregar al párroco o padres

---

## 3. Propuesta de dashboards por rol

### 3.1 Super Admin (TÚ)

#### Panel Principal / Overview
```
┌─────────────────────────────────────────────────────────┐
│  📊 Catecismo Digital — Administración                  │
│  Última actualización: hace 2 min                        │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ 👥 247    │ ✅ 1,842  │ 🔥 34     │ ⏱️ 18min  │ 📈 78%      │
│ Usuarios  │ Lecciones │ Activos   │ Tiempo    │ Precisión   │
│           │ complet.  │ hoy       │ promedio  │ quizzes     │
├──────────┴──────────┴──────────┴──────────┴─────────────┤
│                                                          │
│  📈 Actividad (gráfico — últimos 30 días)                │
│  ▁▂▃▅▆▇█▇▆▅▃▂▁▂▃▅▆▇█▇▆▅▃▂  ← bar/line chart            │
│                                                          │
│  🌍 Distribución por idioma                              │
│  ES ████████████████████ 82%                             │
│  EN ██████ 18%                                           │
│                                                          │
│  🎯 Top lecciones (por completions)        📉 Lecciones  │
│  1. Deseo de Dios          142              problemáticas │
│  2. La Revelación          128              (menor score) │
│  3. La Santísima Trinidad  115              1. Matrimonio │
│  ...                                  2. Sexualidad      │
│                                         3. Conciencia     │
└─────────────────────────────────────────────────────────┘
```

#### Curso / Sección Detail
- Progreso por curso con **anillos de completitud**
- Usuarios activos por curso
- Tiempo promedio por lección (real vs estimado)
- Tasa de abandono por lección (_drop-off funnel_)
- Distribución de quiz scores (histograma)
- Flashcards más difíciles (avg difficulty > 3.5)

#### Usuarios (mejorado)
- Tabla con filtros avanzados: rol, idioma, rango de actividad, curso
- **Columnas nuevas:** last_activity_at, avg_quiz_score, streak, time_spent_total
- Acciones: promover/degradar, ver perfil completo, exportar CSV
- **Vista de detalle por usuario:** actividad tipo timeline, progreso radial, heatmap de días activos

#### Contenido / Content Management
- Lecciones: tabla con status (draft/published/archived), has_quiz, has_guide, has_workbook
- Quizzes: preguntas por lección, tasa de acierto por pregunta
- Flashcards: cuántas por lección, dificultad promedio
- Editor inline para cambiar status o metadata

### 3.2 Catequista (futuro)

- Vista de **mis alumnos** (asignados por grupo/clase)
- Progreso grupal con comparativa
- Alertas: alumnos sin actividad > 7 días
- Calendario de lecciones programadas
- Reportes imprimibles para padres

### 3.3 Usuario (mejora opcional)

- Mi progreso personal con stats
- Rachas y logros
- Flashcards pendientes de repaso (spaced repetition)

---

## 4. Widgets concretos a implementar

### Stats Cards (mejoradas)
| Widget | Datos | Fuente DB |
|--------|-------|-----------|
| Usuarios totales | COUNT(profiles) | profiles |
| Activos hoy | COUNT WHERE last_activity_at::date = today | progress |
| Activos 7 días | COUNT DISTINCT user_id WHERE last_activity_at > now()-7d | progress |
| Lecciones completadas | COUNT WHERE completed=true | progress |
| Tasa de finalización | completed / total posibles | progress |
| Precisión quizzes | AVG(is_correct) * 100 | quiz_attempts |
| Tiempo promedio | AVG(time_spent_sec) / 60 | progress |
| Flashcards repasadas hoy | COUNT WHERE reviewed_at::date = today | flashcard_reviews |
| Usuarios con racha >7d | — (necesita lógica) | progress |

### Gráficos
1. **Actividad diaria (últimos 30d)** — line/bar chart
   - Eje X: días, Eje Y: lecciones completadas + usuarios activos
   - Fuente: `progress` agrupado por `DATE(last_activity_at)`

2. **Distribución por curso** — donut/pie chart
   - Cuántas lecciones completadas por curso
   - Fuente: `progress JOIN lessons JOIN courses`

3. **Quiz performance por lección** — horizontal bar
   - % acierto promedio por lección
   - Fuente: `quiz_attempts JOIN quizzes JOIN lessons`

4. **Funnel de abandono** — vertical funnel
   - Lección 1 → 100%, Lección 2 → 85%, Lección 3 → 62%...
   - Revela dónde la gente se va

5. **Heatmap de actividad** (estilo GitHub)
   - Últimos 3 meses, intensidad de color por día
   - Muestra patrones semanales

6. **Flashcard difficulty matrix**
   - Flashcards agrupadas por difficulty promedio
   - Identifica qué conceptos cuestan más

---

## 5. Plan de implementación

### Fase 0: Auditoría de datos reales
Verificar cuántos datos hay realmente en cada tabla:
```sql
SELECT 'profiles', count(*) FROM profiles
UNION ALL SELECT 'progress', count(*) FROM progress
UNION ALL SELECT 'quiz_attempts', count(*) FROM quiz_attempts
-- etc.
```

### Fase 1: Dashboard Core (MVP mejorado)
- Nuevo layout con sidebar navegación
- Overview con todas las stats cards nuevas
- Gráfico de actividad 30 días
- Tabla de usuarios mejorada con nuevos campos
- Distribución por curso (donut)

### Fase 2: Analytics profundos
- Quiz performance por lección
- Drop-off funnel por curso
- Flashcard difficulty matrix
- Heatmap de actividad

### Fase 3: Content Management
- Vista de lecciones con status editing
- Vista de quizzes con métricas por pregunta
- Flashcards manager

### Fase 4: Vistas por rol
- Dashboard de catequista
- Perfil de usuario mejorado

---

## 6. Decisiones técnicas

### Librerías para gráficos
- **Recharts** (React, ligero, declarativo) ← recomendado para Next.js static export
- Alternativas: Chart.js + react-chartjs-2, Nivo, Tremor

### Layout
- Sidebar navigation con secciones colapsables
- Top bar con breadcrumbs + filtro de idioma + user menu
- Contenido principal con grid de widgets responsive

### Performance
- Datos cacheados en estado React (ya se hace)
- Supabase realtime para live updates (opcional)
- Paginación en tablas (si crecen)

---

## 7. Preguntas abiertas para Juan Álvaro

1. **Prioridad:** ¿Empezamos con el dashboard super admin completo o prefieres primero habilitar la vista de catequista?
2. **Datos reales:** ¿Hay datos reales en las tablas (`progress`, `quiz_attempts`, `flashcard_reviews`) o están vacías? Eso determina si los gráficos mostrarán info o placeholders.
3. **Sidebar:** ¿Prefieres navegación lateral tipo SaaS (Linear/Notion) o tabs superiores?
4. **Dark mode:** ¿Quieres que el dashboard tenga modo oscuro independiente?
5. **Imprimibles:** ¿Quieres que algunos reportes del dashboard tengan versión imprimible (para entregar a párrocos/padres)?
6. **Exportable:** ¿CSV/PDF de datos de usuarios y progreso?
7. **Notificaciones:** ¿Alertas tipo "usuario X lleva 7 días sin actividad"?
