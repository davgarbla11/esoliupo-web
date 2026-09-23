# Despliegue en producción

Todo (frontend, API, base de datos) corre dentro de Docker en una sola red interna.
En el servidor, lo único que vive fuera de Docker es el nginx que ya tenéis como
reverse proxy — solo necesita un `server {}` nuevo que reenvíe al puerto que
publica el contenedor `web`.

```
Internet → Cloudflare (TLS pública) → nginx (host, TLS origen) → docker "web" (nginx interno, puerto 8081→80)
                                                                      ├── sirve el frontend (estático)
                                                                      └── proxy_pass /api/ → docker "api" (puerto 4000)
                                                                                                 └── docker "db" (Postgres, red interna, sin puerto expuesto)
```

## Primer despliegue (servidor con dominio en Cloudflare)

Pasos en Cloudflare (antes de tocar el servidor):

1. **DNS**: añade un registro `A` (o `CNAME`) para tu subdominio de beta —
   p. ej. `beta.dgarbla.com` → IP del servidor — con la nube **naranja**
   (proxied) activada.
2. **Certificado de origen**: Cloudflare → SSL/TLS → Origin Server → *Create
   Certificate*. Te da un cert + key gratis, válidos 15 años. Cloudflare es el
   único que necesita confiar en él (los visitantes nunca lo ven directamente),
   así que no hace falta Let's Encrypt para esto.
3. **SSL/TLS → Overview**: pon el modo en **Full (strict)**. Así el tramo
   Cloudflare↔servidor también va cifrado, no solo el tramo público.

Pasos en el servidor:

1. Instala Docker + el plugin de Docker Compose y clona el repo.

2. Guarda el certificado de origen del paso 2 en el servidor, por ejemplo:
   ```bash
   sudo mkdir -p /etc/nginx/ssl
   sudo nano /etc/nginx/ssl/esoliupo-origin.pem   # pega el certificado
   sudo nano /etc/nginx/ssl/esoliupo-origin.key   # pega la clave privada
   sudo chmod 600 /etc/nginx/ssl/esoliupo-origin.key
   ```

3. Copia las plantillas y rellena los valores reales (nunca se suben a git):
   ```bash
   cp .env.production.example .env.production
   cp api/.env.production.example api/.env.production
   ```
   - `.env.production` (raíz): usuario/contraseña de Postgres, puerto público del
     contenedor `web`, y las dos variables que el frontend necesita **en tiempo de
     build** (`VITE_API_URL=/api` — deja la ruta relativa, así no dependes del
     dominio — y `VITE_GOOGLE_CLIENT_ID`).
   - `api/.env.production`: `JWT_SECRET` (genera uno largo y aleatorio),
     `CORS_ORIGIN`/`SITE_URL` (tu subdominio de beta, con `https://`, p. ej.
     `https://beta.dgarbla.com`), `TRUST_PROXY=3` (Cloudflare + nginx del host +
     nginx interno del contenedor `web` = 3 saltos — importante para que el
     rate-limiting y el registro de auditoría capturen la IP real del visitante y
     no la de un proxy intermedio), credenciales de Gmail OAuth (las mismas que ya
     configuraste para el envío de correo), `GOOGLE_CLIENT_ID` y
     `GOOGLE_WORKSPACE_DOMAIN`.

4. Construye y levanta:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
   ```
   Esto crea los volúmenes con nombre `pgdata` (base de datos) y `uploads`
   (avatares e imágenes de eventos/formaciones), y aplica las migraciones de
   Prisma automáticamente (`prisma migrate deploy`, nunca destructivo).

5. Copia `nginx-host-example.conf` a `/etc/nginx/sites-available/` (o donde
   corresponda en tu distro), ajusta el dominio si usaste otro subdominio, y
   activa el site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/esoliupo-beta.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

6. Crea el usuario Administrador inicial:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production exec api npm run seed
   ```

7. Si vais a probar el botón de "Iniciar sesión con Google" en este dominio de
   beta: en Google Cloud Console → tu cliente OAuth → añade
   `https://beta.dgarbla.com` a los **orígenes JavaScript autorizados** (el
   cliente ya restringe por dominio de Workspace vía `GOOGLE_WORKSPACE_DOMAIN`,
   pero Google también exige que el propio origen esté autorizado ahí).

Con esto ya podéis entrar en `https://beta.dgarbla.com` y la Junta Directiva
puede probarlo. El resto de la web pública queda visible por defecto — si
queréis que solo vosotros la veáis mientras probáis, activad el modo
mantenimiento desde `/dashboard/superadmin` (los Administradores lo siguen
viendo todo igual).

> Si en algún momento montáis esto en un servidor **sin** Cloudflare por
> delante (conexión directa), usad Let's Encrypt/certbot en su lugar para el
> certificado y bajad `TRUST_PROXY` a `2` (un salto menos en la cadena).

## Actualizar la web (deploy de una nueva versión)

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Eso es todo. Reconstruye las imágenes que hayan cambiado, aplica las migraciones
nuevas de Prisma si las hay, y **no toca los volúmenes** — la base de datos y los
archivos subidos (`uploads`) sobreviven intactos.

### Lo que NUNCA hay que ejecutar

- `docker compose down -v` — el `-v` borra los volúmenes, es decir, borra la
  base de datos y todas las imágenes subidas. Para un despliegue normal nunca
  hace falta.
- `docker volume rm esoliupo-web_pgdata` (o el que corresponda) — mismo problema.
- `prisma migrate reset` — resetea la base de datos entera. `migrate deploy`
  (lo que usa el contenedor automáticamente) es la versión segura y es la única
  que se ejecuta en producción.

Si algún día necesitas parar los contenedores sin tocar los datos:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production down
```

(sin `-v` — los volúmenes se quedan donde estaban, listos para el siguiente `up`).

## Copias de seguridad de la base de datos

Recomendado, un cron sencillo en el propio servidor:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T db \
  pg_dump -U esoliupo esoliupo | gzip > "backup-$(date +%F).sql.gz"
```

## Modo mantenimiento

Desde `/dashboard/superadmin` (pestaña "Mantenimiento") puedes activar/desactivar
el aviso de mantenimiento sin tocar el servidor — útil mientras haces un deploy
grande. El panel de gestión sigue accesible para Administradores mientras está
activo.
