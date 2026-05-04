'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

type Tab = 'overview' | 'my-classes' | 'progress' | 'achievements';

// ─── Mock data (backend integration later) ──────────────────────────────────
const MOCK_CLASSES = [
  { id: 1, name: 'Primera Comunión 2026', course: 'Catequesis Primaria', progress: 65 },
  { id: 2, name: 'Confirmación - Grupo A', course: 'Catequesis de Confirmación', progress: 40 },
  { id: 3, name: 'Iniciación Cristiana', course: 'RCIA', progress: 20 },
];

const MOCK_LESSONS = [
  { id: 1, title: 'El Padre Nuestro', status: 'completed', course: 'Catequesis Primaria' },
  { id: 2, title: 'Los Sacramentos', status: 'completed', course: 'Catequesis Primaria' },
  { id: 3, title: 'La Misa', status: 'in-progress', course: 'Catequesis Primaria' },
  { id: 4, title: 'El Espíritu Santo', status: 'locked', course: 'Catequesis de Confirmación' },
  { id: 5, title: 'Los Frutos del Espíritu', status: 'locked', course: 'Catequesis de Confirmación' },
];

const MOCK_BADGES = [
  { id: 'flame', icon: '🔥', name: { es: 'Racha de 7 días', en: '7-Day Streak' }, earned: true, xp: 50 },
  { id: 'book', icon: '📖', name: { es: '5 Lecciones', en: '5 Lessons' }, earned: true, xp: 100 },
  { id: 'star', icon: '⭐', name: { es: 'Quiz Perfecto', en: 'Perfect Quiz' }, earned: true, xp: 75 },
  { id: 'cross', icon: '✝️', name: { es: 'Devoción Diaria', en: 'Daily Devotion' }, earned: false, xp: 200 },
  { id: 'dove', icon: '🕊️', name: { es: 'Primer Login', en: 'First Login' }, earned: true, xp: 25 },
  { id: 'candle', icon: '🕯️', name: { es: 'Vela de Oración', en: 'Prayer Candle' }, earned: false, xp: 150 },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function StudentDashboard({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');
  const [tab, setTab] = useState<Tab>('overview');

  // Mock gamification stats
  const xp = 325;
  const level = 3;
  const streak = 7;
  const lessonsCompleted = 5;
  const weeklyGoal = 5;
  const weeklyDone = 3;
  const xpForNextLevel = 500;

  const t = (key: string) =>
    (({
      welcome: { es: '¡Bienvenido!', en: 'Welcome!' },
      overview: { es: 'Vista general', en: 'Overview' },
      myClasses: { es: 'Mis Clases', en: 'My Classes' },
      progress: { es: 'Progreso', en: 'Progress' },
      achievements: { es: 'Logros', en: 'Achievements' },
      xp: { es: 'XP', en: 'XP' },
      level: { es: 'Nivel', en: 'Level' },
      streak: { es: 'Racha', en: 'Streak' },
      lessonsCompleted: { es: 'Lecciones', en: 'Lessons' },
      weeklyGoal: { es: 'Meta semanal', en: 'Weekly goal' },
      days: { es: 'días', en: 'days' },
      completed: { es: 'Completada', en: 'Completed' },
      inProgress: { es: 'En progreso', en: 'In progress' },
      locked: { es: 'Bloqueada', en: 'Locked' },
      noClasses: { es: 'Sin clases todavía.', en: 'No classes yet.' },
      noLessons: { es: 'Sin lecciones.', en: 'No lessons.' },
      badges: { es: 'Insignias', en: 'Badges' },
      earned: { es: 'Ganada', en: 'Earned' },
      locked_: { es: 'Bloqueada', en: 'Locked' },
      courseProgress: { es: 'Progreso del curso', en: 'Course progress' },
    }) as Record<string, { es: string; en: string }>)[key]?.[isEn ? 'en' : 'es'] || key;

  // ─── Overview ───────────────────────────────────────────────────────
  const renderOverview = () => (
    <div>
      <h1>{t('welcome')} <span style={{ fontWeight: 400 }}>{studentName}</span></h1>
      <p className="db-subtitle" style={{ marginBottom: 20 }}>
        {isEn ? 'Keep going — every lesson brings you closer!' : '¡Seguí así — cada lección te acerca más!'}
      </p>

      <div className="db-stat-row">
        <div className="db-stat-item">
          <div className="db-stat-val" style={{ color: 'var(--color-accent)' }}>{xp}</div>
          <div className="db-stat-lbl">{t('xp')}</div>
        </div>
        <div className="db-stat-item">
          <div className="db-stat-val">{level}</div>
          <div className="db-stat-lbl">{t('level')}</div>
          <div className="db-stat-sub">{xp}/{xpForNextLevel} XP</div>
        </div>
        <div className="db-stat-item">
          <div className="db-stat-val">🔥 {streak}</div>
          <div className="db-stat-lbl">{t('streak')}</div>
          <div className="db-stat-sub">{streak} {t('days')}</div>
        </div>
        <div className="db-stat-item">
          <div className="db-stat-val">{lessonsCompleted}</div>
          <div className="db-stat-lbl">{t('lessonsCompleted')}</div>
        </div>
      </div>

      <h3>{t('weeklyGoal')}</h3>
      <div className="progress-bar" style={{ marginBottom: 6 }}>
        <div className="progress-fill" style={{ width: `${(weeklyDone / weeklyGoal) * 100}%` }} />
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-secondary)' }}>
        {weeklyDone}/{weeklyGoal} {isEn ? 'lessons this week' : 'lecciones esta semana'}
      </p>
    </div>
  );

  // ─── My Classes ──────────────────────────────────────────────────────
  const renderMyClasses = () => (
    <div>
      <h1>{t('myClasses')}</h1>
      {MOCK_CLASSES.length === 0 ? (
        <div className="db-empty">
          <span className="db-empty-icon">🏫</span>
          <p>{t('noClasses')}</p>
        </div>
      ) : (
        <div className="db-cards" style={{ marginTop: 20 }}>
          {MOCK_CLASSES.map((cls) => (
            <div key={cls.id} className="db-card">
              <div className="db-card-title">{cls.name}</div>
              <div className="db-card-desc">{cls.course}</div>
              <div className="progress-bar" style={{ marginTop: 10 }}>
                <div className="progress-fill" style={{ width: `${cls.progress}%` }} />
              </div>
              <div className="db-card-meta" style={{ marginTop: 6 }}>
                <span>{cls.progress}% {isEn ? 'complete' : 'completo'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Progress ────────────────────────────────────────────────────────
  const statusIcon: Record<string, string> = {
    completed: '✅',
    'in-progress': '🔄',
    locked: '🔒',
  };

  const renderProgress = () => {
    const courses = [...new Set(MOCK_LESSONS.map((l) => l.course))];
    return (
      <div>
        <h1>{t('progress')}</h1>
        {courses.map((course) => {
          const lessons = MOCK_LESSONS.filter((l) => l.course === course);
          const done = lessons.filter((l) => l.status === 'completed').length;
          const pct = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
          return (
            <div key={course} style={{ marginBottom: 24 }}>
              <h2>{course}</h2>
              <div className="progress-bar" style={{ marginBottom: 4 }}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-tertiary)', marginBottom: 10 }}>
                {done}/{lessons.length} — {pct}%
              </p>
              {lessons.map((l) => (
                <div
                  key={l.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', marginBottom: 4, borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border-light)',
                    fontSize: 13, color: 'var(--color-primary)',
                  }}
                >
                  <span>{statusIcon[l.status] || '•'}</span>
                  <span style={{ flex: 1 }}>{l.title}</span>
                  <span className={`db-badge ${l.status === 'completed' ? 'green' : l.status === 'in-progress' ? 'accent' : ''}`}>
                    {l.status === 'completed' ? t('completed') : l.status === 'in-progress' ? t('inProgress') : t('locked')}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Achievements ────────────────────────────────────────────────────
  const renderAchievements = () => (
    <div>
      <h1>{t('achievements')}</h1>
      <p className="db-subtitle">{t('badges')}</p>
      <div
        style={{
          display: 'grid', gap: 12, marginTop: 20,
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        }}
      >
        {MOCK_BADGES.map((b) => (
          <div
            key={b.id}
            className="db-card"
            style={{
              textAlign: 'center', padding: '20px 16px',
              opacity: b.earned ? 1 : 0.45,
              cursor: b.earned ? 'default' : 'not-allowed',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>{b.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)' }}>
              {b.name[isEn ? 'en' : 'es']}
            </div>
            <div className="db-badge accent" style={{ marginTop: 8 }}>
              +{b.xp} XP
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-tertiary)', marginTop: 4 }}>
              {b.earned ? t('earned') : t('locked_')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────
  const tabRenderers: Record<Tab, () => React.ReactElement> = {
    overview: renderOverview,
    'my-classes': renderMyClasses,
    progress: renderProgress,
    achievements: renderAchievements,
  };

  return (
    <div>
      <div className="db-subtabs">
        {(['overview', 'my-classes', 'progress', 'achievements'] as Tab[]).map((tn) => (
          <button
            key={tn}
            className={`db-subtab${tab === tn ? ' active' : ''}`}
            onClick={() => setTab(tn)}
          >
            {t(tn)}
          </button>
        ))}
      </div>

      {tabRenderers[tab]()}
    </div>
  );
}