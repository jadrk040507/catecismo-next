# Sistema de Roles, Clases y Dashboards — Plan Maestro

> **Para Hermes:** Usar subagent-driven-development para implementar tarea por tarea.

**Goal:** Sistema completo multi-rol (super_admin, admin/catequista, catequista, alumno) con clases, gestión de alumnos, y dashboards personalizados por rol. Diseño unificado Notion-minimal, móvil-first.

**Tech Stack:** Next.js 16 static export, Supabase, Recharts, CSS puro (no Tailwind), TypeScript.

---

## 1. Investigación de diseño — qué podemos mejorar

### 1.1 Lo que YA está bien
- Paleta blanco/gris/negro tipo Notion (limpia, legible, atemporal)
- Tipografía Inter (moderna, excelente legibilidad)
- CSS consistente con variables
- Animaciones sutiles (fadeIn, slideUp)
- Versión imprimible con @media print

### 1.2 Referencias de diseño que podemos aplicar

| Fuente | Qué copiamos |
|--------|-------------|
| **Duolingo** | Barra de progreso por lección, rachas diarias, animaciones de celebración al completar |
| **Khan Academy** | Anillos de progreso circular por curso, % mastery, tarjetas de "siguiente lección recomendada" |
| **Notion** | Sidebar colapsable, tabs, tablas limpias con hover states, breadcrumbs |
| **Linear** | Filtros rápidos con chips, estados con íconos, tooltips informativos |
| **Vercel Analytics** | Sparklines en tarjetas, métricas con trend arrows ↑↓ |
| **Moodle** | Gradebook, activity completion checkmarks, reportes exportables |
| **Hallow / Catholic Apps** | Versículos diarios, oración del día, tono cálido sin ser cursi |

### 1.3 Mejoras concretas al diseño global

| # | Mejora | Impacto |
|---|--------|---------|
| 1 | **Sidebar de navegación unificado** — mismo sidebar en todo el dashboard, colapsable en móvil | Alto — consistencia |
| 2 | **Estados vacíos con ilustraciones** — en vez de solo texto, iconos grandes + sugerencia de acción | Medio — UX |
| 3 | **Toast notifications** — en vez de mensajes inline, toast temporal arriba-derecha | Bajo — polish |
| 4 | **Skeleton loading** — animación de carga tipo placeholder en vez de "Cargando..." | Medio — UX |
| 5 | **Trend indicators** — flechitas ↑↓ verdes/rojas en métricas vs período anterior | Alto — analytics |
| 6 | **Color-coded difficulty** — verde/amarillo/rojo para quizzes, lecciones | Medio — visual |
| 7 | **Drag & drop widgets** (futuro) — dashboard configurable por admin | Bajo — avanzado |
| 8 | **Mobile bottom nav** — tabs inferiores en móvil como app nativa | Alto — mobile UX |
| 9 | **Tema oscuro** — toggle dark/light respetando preferencia del sistema | Medio — accesibilidad |
| 10 | **Micro-interactions** — hover scale, click ripple, transiciones suaves | Bajo — polish |

---

## 2. Nuevo esquema de base de datos

### 2.1 Actualizar tabla `profiles`
```sql
-- Añadir columnas nuevas
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_time_spent_sec INTEGER DEFAULT 0;

-- ACTUALIZAR check constraint de role para incluir 'catechist'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'catechist', 'admin', 'super_admin'));
```

### 2.2 Nuevas tablas

```sql
-- Tabla de clases/grupos de catequesis
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  catechist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL  -- curso asignado
);

-- Relación estudiante-clase (many-to-many)
CREATE TABLE class_students (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Invitaciones pendientes
CREATE TABLE class_invitations (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  accepted BOOLEAN DEFAULT FALSE
);

-- Políticas RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_invitations ENABLE ROW LEVEL SECURITY;

-- Admin ve todas las clases
CREATE POLICY "Admins manage all classes" ON classes FOR ALL USING (is_admin());
-- Catequista ve solo sus clases
CREATE POLICY "Catechist sees own classes" ON classes FOR SELECT 
  USING (auth.uid() = catechist_id);
```

### 2.3 Nuevos roles y jerarquía

```
super_admin (Juan Álvaro)
  ├── puede TODO: gestionar admins, catequistas, clases, contenido
  │
admin (catequista administrador)
  ├── crear/editar/archivar clases
  ├── asignar catequistas a clases
  ├── invitar/remover alumnos
  ├── ver progreso de TODOS los alumnos de sus clases
  │
catechist (catequista normal)
  ├── ver SOLO sus clases asignadas
  ├── ver progreso de alumnos en sus clases
  ├── NO puede crear clases ni invitar alumnos
  │
user (alumno)
  ├── ver su propio progreso
  ├── ver clases a las que pertenece
  └── acceder a contenido
```

---

## 3. Dashboards por rol

### 3.1 Super Admin Dashboard (ya implementado ✅)

```
┌────────────────────────────────────────────────┐
│  Catecismo          [📊] [👥] [📚] [📈]    │ ← header tabs
├────────────────────────────────────────────────┤
│                                                 │
│  Dashboard                                      │
│  Vista general de la plataforma                 │
│                                                 │
│  ┌──────┬──────┬──────┬──────┬──────┐          │
│  │Users │Active│Active│Done  │Time  │          │
│  │  101 │   0  │   0  │   0  │ 0m   │          │
│  └──────┴──────┴──────┴──────┴──────┘          │
│                                                 │
│  📊 Actividad (30 días)                         │
│  ▓▓▓▓▓▓▓▓▓▓░░░░░░░                             │
│                                                 │
│  👥 Usuarios recientes                          │
│  ┌──────┬──────┬──────┬──────┐                 │
│  │Name  │Email │Done  │Last  │                 │
│  └──────┴──────┴──────┴──────┘                 │
│                                                 │
└────────────────────────────────────────────────┘
```

### 3.2 Admin / Catequista Dashboard (NUEVO)

```
┌────────────────────────────────────────────────┐
│  Catecismo    [📊Panel] [👥Clases] [📈Progreso]│
├────────────────────────────────────────────────┤
│                                                 │
│  Mis Clases                                     │
│                                                 │
│  ┌─────────────────────┐ ┌────────────────────┐│
│  │ 🙏 Confirmación 2025│ │ ✝️ Primera Comunión││
│  │ 12 alumnos          │ │ 8 alumnos          ││
│  │ Progreso: 67% ▓▓▓▓░ │ │ Progreso: 42% ▓▓░░ ││
│  │ 3 activos hoy       │ │ 1 activo hoy       ││
│  │ ⚠️ 2 sin actividad  │ │ ⚠️ 4 sin actividad ││
│  └─────────────────────┘ └────────────────────┘│
│                                                 │
│  ┌─────────────────────┐ ┌────────────────────┐│
│  │ [+ Nueva Clase]     │ │                    ││
│  └─────────────────────┘ └────────────────────┘│
│                                                 │
└────────────────────────────────────────────────┘
```

### 3.3 Vista de Clase (al hacer clic en una clase)

```
┌────────────────────────────────────────────────┐
│  ← Volver    Confirmación 2025    [⚙️ Editar] │
│  Catequista: P. Miguel | Creada: Ene 2026      │
├────────────────────────────────────────────────┤
│                                                 │
│  📊 Progreso del grupo                         │
│  ┌──────────┬──────────┬──────────┬──────────┐ │
│  │ 12       │ 67%      │ 3        │ 2 ⚠️     │ │
│  │ Alumnos  │ Complet. │ Activos  │ En riesgo│ │
│  └──────────┴──────────┴──────────┴──────────┘ │
│                                                 │
│  📈 Actividad semanal                           │
│  ▁▂▃▅▆▇█▇▆▅▃▂▁                                 │
│                                                 │
│  👥 Alumnos                                     │
│  ┌────────┬────────┬───────┬────────┬────────┐ │
│  │Nombre  │Lección │Score  │Último  │Estado  │ │
│  ├────────┼────────┼───────┼────────┼────────┤ │
│  │María   │05/37   │85%    │Hoy     │🟢 Act. │ │
│  │José    │03/37   │60%⚠️  │Ayer    │🟡      │ │
│  │Ana     │00/37   │—      │8 días  │🔴 Riesg│ │
│  └────────┴────────┴───────┴────────┴────────┘ │
│                                                 │
│  [+ Invitar alumno]    [📧 Invitar por email]   │
│                                                 │
└────────────────────────────────────────────────┘
```

### 3.4 Dashboard Alumno (NUEVO)

```
┌────────────────────────────────────────────────┐
│  Catecismo    [🏠Home] [📚Cursos] [📊Mi Progreso]│
├────────────────────────────────────────────────┤
│                                                 │
│  ¡Hola, María! 🔥 Rachas: 5 días               │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  📖 Continuar donde te quedaste          │   │
│  │  El Pecado — Lección 26 de Moral         │   │
│  │  ▓▓▓▓▓▓▓▓▓▓░░░░░░░░ 67%                 │   │
│  │  [Continuar →]                           │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  📊 Mi progreso                                │
│  ┌──────────────┬──────────────┬────────────┐ │
│  │ 12/37        │ 82%          │ 145 min    │ │
│  │ Lecciones    │ Quiz avg     │ Tiempo     │ │
│  └──────────────┴──────────────┴────────────┘ │
│                                                 │
│  📈 Mi progreso por curso                       │
│  Credo       ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 90%           │
│  Sacramentos ▓▓▓▓▓▓▓░░░░░░░░░░ 35%            │
│  Moral       ▓▓▓▓▓▓▓▓▓▓▓░░░░░░ 67%            │
│  Oración     ░░░░░░░░░░░░░░░░░ 0%              │
│                                                 │
│  🏆 Mis logros                                  │
│  ⭐ Primera lección  🔥 Rachas 5d  📖 10 lec.  │
│                                                 │
│  👥 Mis clases                                  │
│  • Confirmación 2025 — P. Miguel                │
│                                                 │
└────────────────────────────────────────────────┘
```

---

## 4. Diseño mobile-first de los dashboards

### 4.1 Mobile: bottom nav bar
```
┌─────────────────────────────────┐
│                                 │
│          [contenido]            │
│                                 │
├─────────────────────────────────┤
│  📊      📚      👥      ⚙️    │ ← bottom tab bar
│ Panel  Cursos  Clases  Perfil  │    (tipo app nativa)
└─────────────────────────────────┘
```

### 4.2 Mobile: tarjetas en vez de tablas
```
En vez de:
┌──────┬──────┬──────┬──────┐
│Name  │Email │Done  │Last  │
├──────┼──────┼──────┼──────┤
│María │m@... │5     │Hoy   │
└──────┴──────┴──────┴──────┘

Usar:
┌──────────────────────────┐
│ 👤 María          🟢 Act│
│ m@gmail.com             │
│ ✅ 5 lecciones • 85%    │
│ Último: Hoy             │
└──────────────────────────┘
```

---

## 5. Plan de implementación por fases

### Fase A: Nuevas tablas en Supabase (ya)
1. Ejecutar SQL de nuevas tablas en el VPS
2. Verificar constraints y políticas RLS

### Fase B: Auth + roles mejorados
1. Actualizar `auth.tsx` para soportar rol `catechist`
2. Crear `src/lib/roles.ts` con helpers `isSuperAdmin()`, `isCatechistAdmin()`, `isCatechist()`, `isStudent()`
3. Redirigir usuarios a su dashboard según rol después del login

### Fase C: API helpers para Supabase
1. `src/lib/classes.ts` — CRUD de clases
2. `src/lib/students.ts` — gestión de alumnos
3. `src/lib/stats.ts` — consultas agregadas para dashboards

### Fase D: Dashboard Admin / Catequista
1. Componente `ClassesOverview.tsx` — cards de clases con progreso
2. Componente `ClassDetail.tsx` — vista detallada de una clase
3. Componente `InviteStudent.tsx` — formulario de invitación
4. Página `/dashboard/catechist` (o tab en dashboard)

### Fase E: Dashboard Alumno
1. Componente `StudentProgress.tsx` — métricas personales
2. Componente `ContinueLearning.tsx` — card de última lección
3. Componente `Achievements.tsx` — logros y rachas
4. Página `/perfil` mejorada

### Fase F: Mejoras de diseño global
1. Bottom nav para móvil
2. Skeleton loading states
3. Trend indicators en métricas
4. Toast notification system
5. Estados vacíos con iconos grandes

### Fase G: Build + deploy + verificación

---

## 6. Diseño del sidebar/navegación por rol

### Admin sidebar
```
┌──────────────┐
│ Catecismo    │
├──────────────┤
│ 📊 Panel     │
│ 👥 Clases    │
│ 📈 Progreso  │
│ ⚙️ Ajustes   │
│              │
│ ─────────── │
│ P. Miguel    │
│ admin        │
└──────────────┘
```

### Alumno sidebar
```
┌──────────────┐
│ Catecismo    │
├──────────────┤
│ 📚 Cursos    │
│ 📊 Mi Progres│
│ 🏆 Logros    │
│ 👥 Mis Clases│
│              │
│ ─────────── │
│ María        │
│ alumna       │
└──────────────┘
```

---

## 7. Métricas y datos mostrados por dashboard

| Dashboard | Métricas clave |
|-----------|---------------|
| **Super admin** | users total/activos, completadas, avg quiz, distribución cursos, actividad 30d, growth |
| **Admin clases** | clases activas, alumnos totales, % completado por clase, alertas inactividad |
| **Clase detail** | progreso grupal, leaderboard interno, alumnos en riesgo (<30% o >7d inactivo) |
| **Alumno** | lecciones completadas, % quiz, tiempo total, racha, progreso por curso, logros |
| **Catequista** | igual que admin pero solo ve sus clases asignadas |

---

## 8. Preguntas para Juan Álvaro

1. **Nombres de roles en español:** ¿Usamos `catequista`, `catequista_admin`, `alumno` o dejamos `catechist`, `admin`, `user`?
2. **Invitaciones:** ¿Los alumnos se unen con código de clase (6 dígitos) o por email? Email es más formal, código es más rápido.
3. **Logros:** ¿Qué logros te gustaría que ganen los alumnos? (ej: "Primera lección", "Racha 7 días", "Completar Credo", "100% quiz")
4. **¿Empezamos ya la implementación?** Puedo ir fase por fase. La Fase A (DB) toma 2 minutos. Luego Fase B-F en secuencia.
