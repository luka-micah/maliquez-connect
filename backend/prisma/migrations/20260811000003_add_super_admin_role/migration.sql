-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- Promote existing admin accounts to super admin (main admin)
UPDATE "users" SET "role" = 'SUPER_ADMIN' WHERE "role" = 'ADMIN';
