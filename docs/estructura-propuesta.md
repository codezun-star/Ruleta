# Estructura de carpetas propuesta

Criterio: **todo lo sensible vive en el servidor**. El cliente nunca recibe el
algoritmo de asignación, las claves ni las asignaciones del amigo secreto.

```
ruleta/
├─ src/
│  ├─ app/
│  │  ├─ [locale]/
│  │  │  ├─ layout.tsx              # fuentes (next/font), tokens, header, footer
│  │  │  ├─ page.tsx                # landing con ruleta demo
│  │  │  ├─ sorteo/                 # MODO A — wizard + ruleta + resultado
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [id]/page.tsx
│  │  │  ├─ amigo-secreto/          # MODO B — wizard + ceremonia
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [id]/page.tsx
│  │  │  ├─ r/[token]/page.tsx      # scratch card privada del participante
│  │  │  ├─ privacidad/page.tsx
│  │  │  ├─ terminos/page.tsx
│  │  │  └─ opengraph-image.tsx
│  │  ├─ api/
│  │  │  ├─ draws/route.ts          # crear sorteo (Zod + Turnstile + rate limit)
│  │  │  ├─ draws/[id]/spin/route.ts# elige ganador con crypto.randomInt
│  │  │  ├─ emails/retry/route.ts   # reintento solo de los envíos fallidos
│  │  │  └─ cron/purge/route.ts     # borra correos a los 30 días
│  │  ├─ sitemap.ts
│  │  └─ robots.ts
│  │
│  ├─ components/
│  │  ├─ wheel/     Wheel.tsx · drawWheel.ts · useSpin.ts · Pointer.tsx
│  │  │             Chochin.tsx · Confetti.tsx · HankoStamp.tsx · sounds.ts
│  │  ├─ wizard/    Step1Participants.tsx · Step2Details.tsx · Step3Review.tsx
│  │  │             ParticipantRow.tsx · ExclusionEditor.tsx · ProgressBar.tsx
│  │  ├─ ui/        StampButton · PaperCard · DoubleFrame · Tag · Field
│  │  │             StepNumber · HalftoneBox · Pattern (seigaiha/asanoha/shippo)
│  │  └─ layout/    Header · Footer · LocaleSwitcher · ThemeToggle · SoundToggle
│  │
│  ├─ emails/                       # React Email — tablas + estilos inline
│  │  ├─ components/                EmailFrame · NoshiTag · HankoSeal · Footer
│  │  ├─ SecretSantaEmail.tsx
│  │  ├─ RaffleWinnerEmail.tsx
│  │  ├─ RaffleParticipantEmail.tsx
│  │  ├─ OrganizerReceiptEmail.tsx
│  │  └─ render.ts                  # elige plantilla + locale
│  │
│  ├─ lib/
│  │  ├─ draw/       derangement.ts # algoritmo + exclusiones
│  │  │              random.ts      # crypto.randomInt, nunca Math.random
│  │  │              audit.ts       # hash semilla+timestamp = ID verificable
│  │  ├─ email/      resend.ts · batch.ts · backoff.ts · status.ts
│  │  ├─ db/         schema.ts · client.ts · queries/
│  │  ├─ crypto/     assignments.ts # AES-GCM; el organizador nunca descifra
│  │  ├─ validation/ participants.ts · draw.ts · shared.ts  (Zod, cliente+servidor)
│  │  ├─ ratelimit.ts
│  │  └─ turnstile.ts
│  │
│  ├─ i18n/     routing.ts · request.ts · navigation.ts
│  ├─ config/   brand.ts            # ← ÚNICA fuente del nombre, dominio y remitente
│  └─ styles/   tokens.css · globals.css · patterns.css
│
├─ messages/    es.json · en.json   # UI, validaciones, errores, correos, SEO
├─ public/      fonts/ · email/ (sello.png, noshi.png) · og/ · favicon.svg
├─ drizzle/     migrations/
├─ tests/
│  ├─ unit/     derangement.test.ts # 3 personas, 50 personas, exclusiones imposibles
│  │            random.test.ts · validation.test.ts
│  └─ e2e/      secret-santa.spec.ts (Playwright, flujo completo)
├─ docs/        moodboard.html · estructura-propuesta.md · resend-dns.md · deploy-vercel.md
├─ .env.example
└─ README.md
```

## Decisiones que conviene fijar ahora

| Tema            | Propuesta                                       | Por qué                                                                         |
| --------------- | ----------------------------------------------- | ------------------------------------------------------------------------------- |
| Base de datos   | Supabase Postgres + Drizzle                     | Drizzle tipa el esquema sin runtime pesado; Supabase da Postgres gratis y cron. |
| Asignaciones    | Cifradas con AES-GCM, clave solo en el servidor | El organizador no puede verlas ni con acceso a la base.                         |
| Borrado         | Cron diario que purga sorteos de más de 30 días | Lo exige la política de privacidad.                                             |
| Nombre de marca | `src/config/brand.ts` exporta `BRAND`           | Un solo punto de cambio para UI, correos, remitente y metadatos.                |
| Ruleta          | Canvas 2D fuera del árbol de React              | Evita re-renders durante el giro; 60fps con `devicePixelRatio`.                 |
