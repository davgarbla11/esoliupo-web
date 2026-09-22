-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SOCIO', 'JUNTA_DIRECTIVA', 'ADMINISTRADOR');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'SOCIO';
COMMIT;

