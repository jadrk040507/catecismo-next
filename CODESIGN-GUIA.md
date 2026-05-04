# 🎨 Open CoDesign + Catecismo — Guía rápida

## ¿Qué es?

Open CoDesign es como Figma pero con inteligencia artificial. Tú escribes lo que quieres diseñar y la IA te genera el diseño en segundos. Gratis, open source, todo en tu computadora.

**No necesitas ser diseñador.** Con describir lo que quieres, te genera:
- Páginas web completas
- Dashboards
- Tablas de datos
- Landing pages
- Componentes interactivos

---

## Paso 1: Instalar (2 minutos)

### Si tienes Mac:
```bash
brew install --cask opencoworkai/tap/open-codesign
```

### Si tienes Windows:
Descarga el instalador .exe desde:
👉 https://github.com/OpenCoworkAI/open-codesign/releases

Busca el archivo que diga `open-codesign-X.X.X-x64-setup.exe`

### Si tienes Linux:
Descarga el .AppImage o .deb desde el mismo link de arriba.

---

## Paso 2: Conectar tu API Key (1 minuto)

1. Abre Open CoDesign
2. Ve a **Settings** (⚙️ engrane)
3. Pega tu API key. Funciona con:
   - **DeepSeek** → tu key de DeepSeek
   - **OpenAI** → empieza con `sk-...`
   - **Anthropic** → empieza con `sk-ant-...`
   - **Ollama** → si tienes modelos locales, déjalo en blanco

> 💡 La app detecta automáticamente qué proveedor es por el formato de la key.

---

## Paso 3: Abrir el proyecto Catecismo

1. En Open CoDesign, ve al menú
2. Abre la carpeta del proyecto:
   ```
   ~/Dropbox/Agents/workspace/catecismo-next
   ```
3. La app va a leer automáticamente el archivo `DESIGN.md` que ya dejé listo con TODO el estilo de Catecismo (tipografía Inter, colores blanco/gris, nada de dorado, sin fuentes medievales, etc.)

---

## Paso 4: Pedir tu primer diseño

En el chat de la app escribe algo como:

```
Diseña un dashboard de administración para una plataforma de catecismo católico.
Necesito: sidebar izquierdo con navegación, tarjeta de bienvenida con el nombre
del usuario, 6 tarjetas de estadísticas (usuarios, catequistas, activos hoy,
lecciones completadas, racha promedio), y una tabla de últimos usuarios registrados.
Usa el DESIGN.md del proyecto.
```

La IA lee el DESIGN.md y genera un diseño que YA respeta nuestro estilo: Inter, blanco, sin dorado, bordes de 6-8px.

---

## Paso 5: Refinar (sin escribir código)

### Comentar partes específicas:
- Haz **clic en cualquier elemento** del diseño
- Escribe: "Este botón debería ser azul (#2383E2)"
- La IA reescribe solo esa parte, no todo el diseño

### Ajustar con sliders:
- La IA detecta parámetros que puedes ajustar (color, espaciado, tamaño de fuente)
- Arrastras el slider y el diseño se actualiza al instante

### Cambiar entre versiones:
- Los últimos 5 diseños se guardan en memoria
- Cambias entre ellos sin esperar

---

## Paso 6: Exportar

Cuando el diseño te guste, exportas:
- **HTML** → para integrar en Next.js
- **PDF** → para compartir o imprimir
- **PPTX** → para presentaciones
- **ZIP** → descarga completa

Yo tomo ese HTML, lo convierto en componentes React, y lo conecto a Supabase.

---

## Ejemplos de prompts para Catecismo

### Dashboard principal:
```
Usando el DESIGN.md, crea un dashboard tipo Notion con:
- Sidebar 240px con logo "Catecismo", avatar del admin, y navegación
  (🏠 Vista general, 📊 Analíticas, 👥 Usuarios, 🏫 Clases, 📚 Contenido, ⚙️ Ajustes)
- Topbar con breadcrumb
- 5 tarjetas de estadísticas en fila
- Botones de acceso rápido a cada sección
- Diseño limpio, solo Inter, blanco y gris
```

### Página de clases:
```
Crea una página para gestionar clases de catecismo:
- Grid de tarjetas (nombre, descripción, código de invitación, número de alumnos)
- Botón "+ Nueva clase" que abre modal con campos: nombre, descripción, curso
- Modal de editar con zona de peligro para eliminar (requiere contraseña)
- Estilo Notion, Inter, sin dorado
```

### Detalle de clase:
```
Crea la vista detalle de una clase con pestañas:
- 📋 Stream: nombre, descripción, código
- 👥 Alumnos: tabla con nombre, email, progreso, quiz avg, racha + formulario para invitar por email
- 👨‍🏫 Catequistas: lista con botón agregar/quitar
- 📝 Asignaciones: tabla con título, tipo, notas + modal para crear nueva
```

### Perfil de estudiante:
```
Crea un dashboard de estudiante con:
- Saludo personalizado + contador de racha diaria 🔥
- Barra de progreso por curso (Credo, Sacramentos, Moral, Oración)
- Grid de logros (14 insignias, bloqueadas vs desbloqueadas)
- Tabla de estadísticas: lecciones completadas, quiz promedio, tiempo total
- Modal para unirse a clase por código de 6 caracteres
- Botón "Continuar donde te quedaste"
```

---

## Tips

| Situación | Qué hacer |
|-----------|-----------|
| El diseño usa fuentes con serifas | Escribe: "Usa solo Inter, sin serifas" |
| Aparece dorado | Escribe: "Sin dorado. Usa azul #2383E2 para acentos" |
| Fondo beige/parchment | Escribe: "Fondo blanco #FFFFFF y gris claro #F7F6F3" |
| Bordes muy redondeados | Escribe: "Bordes de máximo 8px" |
| El diseño es muy cargado | Escribe: "Más minimalista, más espacio en blanco, estilo Notion" |

---

## Resultado final

```
Tú → Escribes el prompt en Open CoDesign
 Tú → Refinas con comentarios y sliders
 Tú → Exportas HTML
  Yo → Convierto HTML a React
  Yo → Conecto a Supabase
  Yo → Build + Deploy al VPS
```

¿Quieres que empecemos con algún diseño en específico?
