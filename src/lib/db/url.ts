/**
 * Parámetros que libpq entiende en el cliente pero que **no** son opciones del
 * servidor. `postgres-js` reenvía al arranque de la conexión todo lo que no
 * reconoce, así que uno de estos colado en la cadena hace que Postgres tumbe
 * la conexión con «unrecognized configuration parameter».
 *
 * No es hipotético: la cadena que da Neon —y la que la integración de Neon
 * escribe sola en Vercel— trae `channel_binding=require`.
 */
const CLIENT_ONLY_PARAMS = [
  'channel_binding',
  'gssencmode',
  'sslcert',
  'sslkey',
  'sslpassword',
  'sslcrl',
  // Supabase y Prisma lo usan para marcar el pooler; tampoco es del servidor.
  'pgbouncer'
];

/**
 * Deja la cadena tal cual salvo por esos parámetros. Se prefiere limpiarla
 * aquí a pedir que se edite a mano en el panel: la integración de Neon la
 * reescribe sola en cada despliegue y el arreglo manual no sobrevive.
 *
 * Vive aparte del cliente para que la configuración de migraciones pueda usar
 * lo mismo sin arrastrar el esquema ni el driver.
 */
export function sanitizeDatabaseUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    // Una cadena que no es URL no es nuestra para arreglarla: que el error lo
    // dé el driver, que sabe explicarlo mejor.
    return raw;
  }

  for (const param of CLIENT_ONLY_PARAMS) url.searchParams.delete(param);
  return url.toString();
}
