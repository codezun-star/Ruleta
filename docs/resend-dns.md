# Verificar `ruleta.codezun.com` en Resend

Los correos salen de `hola@ruleta.codezun.com`. Para que Gmail, Outlook y Apple
Mail no los manden a spam, ese dominio tiene que estar verificado con **SPF**,
**DKIM** y **DMARC**.

Usamos un **subdominio** (`ruleta.codezun.com`) a propósito: si algún día estos
correos se ganan mala reputación, no arrastran al correo del dominio principal.

---

## 1. Dar de alta el dominio en Resend

1. Entra en [resend.com/domains](https://resend.com/domains) → **Add Domain**.
2. Escribe `ruleta.codezun.com`.
3. Elige la región más cercana a tus destinatarios. Para Latinoamérica,
   `us-east-1`. **No se puede cambiar después** sin volver a verificar.
4. Resend te muestra tres o cuatro registros DNS. Son **tuyos**: la clave DKIM
   es distinta en cada cuenta, así que copia los valores de tu panel, no los de
   esta guía.

## 2. Añadir los registros en el DNS de `codezun.com`

Los registros viven en la zona de **codezun.com**, no en una zona aparte.

> **El error más común:** casi todos los paneles añaden la zona por su cuenta.
> Si el panel dice `Nombre` y al guardar muestra `resend._domainkey.ruleta.codezun.com.codezun.com`,
> es que escribiste el nombre completo donde esperaba el relativo. Escribe
> `resend._domainkey.ruleta` y deja que él ponga el resto.

| Tipo | Nombre (relativo a `codezun.com`) | Valor | Para qué |
|---|---|---|---|
| `MX` | `send.ruleta` | `feedback-smtp.<región>.amazonses.com` (prioridad `10`) | Rebotes y quejas |
| `TXT` | `send.ruleta` | `v=spf1 include:amazonses.com ~all` | SPF |
| `TXT` | `resend._domainkey.ruleta` | `p=MIGfMA0GCSq...` (larguísimo) | DKIM |
| `TXT` | `_dmarc.ruleta` | `v=DMARC1; p=none; rua=mailto:dmarc@codezun.com` | DMARC |

Notas que ahorran una tarde:

- **El valor DKIM es muy largo.** Algunos paneles lo parten en trozos de 255
  caracteres automáticamente; otros lo rechazan. Si el tuyo lo rechaza, pega el
  valor entre comillas o busca la opción "TXT largo".
- **No pongas SPF dos veces.** Un dominio solo puede tener **un** registro SPF.
  Si `send.ruleta` ya tuviera uno, combínalos en una sola línea en vez de crear
  otro: dos registros SPF hacen fallar la verificación de los dos.
- **DMARC empieza en `p=none`.** Así solo observas, sin que nada se rechace.
  Cuando lleves un par de semanas viendo informes limpios, súbelo a
  `p=quarantine` y luego a `p=reject`.

## 3. Verificar

En Resend, pulsa **Verify DNS Records**. Suele tardar entre unos minutos y una
hora. Si sigue en rojo, comprueba desde tu terminal qué está publicado de verdad:

```bash
dig +short TXT resend._domainkey.ruleta.codezun.com
dig +short TXT send.ruleta.codezun.com
dig +short TXT _dmarc.ruleta.codezun.com
dig +short MX  send.ruleta.codezun.com
```

Si `dig` no devuelve nada, el registro no está publicado todavía, da igual lo
que muestre el panel.

## 4. Configurar la aplicación

En Vercel → Settings → Environment Variables:

```
RESEND_API_KEY=re_...
EMAIL_FROM=Kuji <hola@ruleta.codezun.com>
EMAIL_REPLY_TO=hola@ruleta.codezun.com
```

El nombre de la marca sale de `src/config/brand.ts`, así que si cambias el
nombre, cambia también `EMAIL_FROM` para que coincidan.

## 5. Probar la entregabilidad

1. **[mail-tester.com](https://www.mail-tester.com)** — te da una dirección,
   le mandas un correo de prueba y te puntúa sobre 10. Con SPF, DKIM y DMARC
   bien puestos deberías sacar 9 o 10. Cualquier punto que falte, te dice cuál.
2. **Gmail → los tres puntos → Mostrar original.** Tienen que salir los tres:
   ```
   SPF:   PASS
   DKIM:  PASS
   DMARC: PASS
   ```
3. **Outlook.com y Apple Mail**, con una cuenta de cada uno. Son los que peor
   se llevan con el HTML: revisa que el marco de doble línea y el sello se vean
   bien, y que el modo oscuro de Outlook no invierta el papel.
4. **Cómo se ve sin imágenes.** Muchos clientes las bloquean por defecto. El
   sello y la tira de papel picado tienen `alt`, así que el correo sigue
   entendiéndose; compruébalo desactivando las imágenes.

## 6. Buenas prácticas anti-spam que ya están hechas

- Versión en **texto plano** en todos los correos (la genera React Email).
- Pie con **por qué recibes esto**, enlace para reportar y el aviso de que la
  dirección se borra a los 30 días.
- **Un correo por persona**, no una copia con todos en copia oculta.
- Asuntos concretos, sin mayúsculas gritadas ni cadenas de signos.
- Envío por **lotes** con espera entre ellos, para no pasarse del límite de
  Resend (2 peticiones por segundo por defecto).

## 7. Si algo falla

| Síntoma | Causa habitual |
|---|---|
| Resend no verifica y `dig` no devuelve nada | Aún no ha propagado, o el nombre lleva la zona duplicada |
| Verifica pero llega a spam | Falta DMARC, o el dominio es nuevo y no tiene reputación |
| `Domain not verified` al enviar | La API key es de otra cuenta, o el `EMAIL_FROM` usa otro dominio |
| Llega solo a algunos | Rebotes duros: revisa el panel de Resend, no es cosa del DNS |
