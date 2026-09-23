# Despliegue en producción

Todo (frontend, API, base de datos) corre dentro de Docker en una sola red interna.
En el servidor, lo único que vive fuera de Docker es el nginx que ya tenéis como
reverse proxy — solo necesita un `server {}` nuevo que reenvíe al puerto que
publica el contenedor `web`.

```
Internet → nginx (host, TLS) → docker "web" (nginx interno, puerto 8080→80)
                                   ├── sirve el frontend (estático)
                                   └── proxy_pass /api/ → docker "api" (puerto 4000)
                                                              └── docker "db" (Postgres, red interna, sin puerto expuesto)
```

## Primer despliegue

1. Copia las plantillas y rellena los valores reales (nunca se suben a git):
   ```bash
   cp .env.production.example .env.production
   cp api/.env.production.example api/.env.production
   ```
   - `.env.production` (raíz): usuario/contraseña de Postgres, puerto público del
     contenedor `web`, y las dos variables que el frontend necesita **en tiempo de
     build** (`VITE_API_URL=/api` — deja la ruta relativa, así no dependes del
     dominio — y `VITE_GOOGLE_CLIENT_ID`).
   - `api/.env.production`: `JWT_SECRET` (genera uno largo y aleatorio),
     `CORS_ORIGIN`/`SITE_URL` (tu dominio real, con `https://`), credenciales de
     Gmail OAuth (las mismas que ya configuraste para el envío de correo) y
     `GOOGLE_CLIENT_ID`.

2. Construye y levanta:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
   ```
   Esto crea los volúmenes con nombre `pgdata` (base de datos) y `uploads`
   (avatares e imágenes de eventos/formaciones), y aplica las migraciones de
   Prisma automáticamente (`prisma migrate deploy`, nunca destructivo).

3. En el nginx del servidor (fuera de Docker), añade un server block nuevo — ver
   `nginx-host-example.conf` en este mismo directorio. Ajusta el dominio y el
   puerto (`WEB_PORT` en tu `.env.production`, por defecto 8080), y añade tu
   configuración TLS habitual (certbot, etc.).

4. Crea el usuario Administrador inicial:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production exec api npm run seed
   ```

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
