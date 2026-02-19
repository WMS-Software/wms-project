import * as fs from "fs";
import * as path from "path";

const SRC = path.join(process.cwd(), "src");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("📁", dir);
  }
}

function ensureFile(file: string, content = "") {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, content);
    console.log("📄", file);
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ================= MODULE CREATOR ================= */

function createModule(base: string, name: string) {
  const modulePath = path.join(base, name);
  const className = capitalize(name);

  ensureDir(modulePath);
  ensureDir(path.join(modulePath, "entities"));
  ensureDir(path.join(modulePath, "dto"));

  ensureFile(
    path.join(modulePath, `${name}.module.ts`),
    `
import { Module } from '@nestjs/common';
import { ${className}Service } from './${name}.service';
import { ${className}Controller } from './${name}.controller';

@Module({
  controllers: [${className}Controller],
  providers: [${className}Service],
  exports: [${className}Service],
})
export class ${className}Module {}
`
  );

  ensureFile(
    path.join(modulePath, `${name}.service.ts`),
    `
import { Injectable } from '@nestjs/common';

@Injectable()
export class ${className}Service {}
`
  );

  ensureFile(
    path.join(modulePath, `${name}.controller.ts`),
    `
import { Controller } from '@nestjs/common';

@Controller('${name}')
export class ${className}Controller {}
`
  );

  ensureFile(
    path.join(modulePath, `entities/${name}.entity.ts`),
    `
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('${name}')
export class ${className} {

  @PrimaryGeneratedColumn()
  id: number;

}
`
  );
}

/* ================= COMMON ================= */

function createCommon() {
  const common = path.join(SRC, "common");

  ensureDir(common);

  ensureDir(path.join(common, "database"));
  ensureFile(
    path.join(common, "database/base.entity.ts"),
    `
import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
`
  );

  ensureDir(path.join(common, "dto"));
  ensureDir(path.join(common, "guards"));
  ensureDir(path.join(common, "decorators"));
  ensureDir(path.join(common, "filters"));
  ensureDir(path.join(common, "interceptors"));
  ensureDir(path.join(common, "logger"));
  ensureDir(path.join(common, "utils"));
}

/* ================= CONFIG ================= */

function createConfig() {
  const config = path.join(SRC, "config");

  ensureDir(config);

  ensureFile(
    path.join(config, "configuration.ts"),
    `
export default () => ({
  port: process.env.PORT || 3000,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    name: process.env.DB_NAME,
  },
});
`
  );

  ensureFile(
    path.join(config, "env.validation.ts"),
    `
import * as Joi from 'joi';

export const envSchema = Joi.object({
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
  DB_NAME: Joi.string().required(),
});
`
  );
}

/* ================= DATABASE ================= */

function createDatabase() {
  const db = path.join(SRC, "database");

  ensureDir(db);
  ensureDir(path.join(db, "migrations"));

  ensureFile(
    path.join(db, "database.module.ts"),
    `
import { Module } from '@nestjs/common';

@Module({})
export class DatabaseModule {}
`
  );
}

/* ================= SETUP ================= */

function setup() {
  console.log("🚀 Creating Full Project Structure...");

  ensureDir(SRC);

  createCommon();
  createConfig();
  createDatabase();

  const modules = path.join(SRC, "modules");
  ensureDir(modules);

  /* CORE */
  createModule(modules, "auth");
  createModule(modules, "user");
  createModule(modules, "role");

  /* PARTNER */
  const partner = path.join(modules, "partner");
  ensureDir(partner);

  createModule(partner, "customer");
  createModule(partner, "farmer");
  createModule(partner, "transporter");

  /* INVENTORY */
  const inventory = path.join(modules, "inventory");
  ensureDir(inventory);

  createModule(inventory, "warehouse");
  createModule(inventory, "chamber");
  createModule(inventory, "level");
  createModule(inventory, "rack");
  createModule(inventory, "lot");
  createModule(inventory, "bag");

  /* OPERATIONS */
  const operations = path.join(modules, "operations");
  ensureDir(operations);

  createModule(operations, "inward");
  createModule(operations, "outward");

  /* FINANCE */
  const finance = path.join(modules, "finance");
  ensureDir(finance);

  createModule(finance, "billing");
  createModule(finance, "payment");

  console.log("✅ FULL STRUCTURE CREATED SUCCESSFULLY");
}

setup();
