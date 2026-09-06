import { sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

/* ------------------------------------------------------------------ */
/*  共用工具                                                           */
/* ------------------------------------------------------------------ */
const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);

/* ------------------------------------------------------------------ */
/*  認證                                                               */
/* ------------------------------------------------------------------ */
export const adminUsers = sqliteTable("admin_users", {
  id: id(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "editor"] })
    .notNull()
    .default("editor"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
});

export const sessions = sqliteTable("sessions", {
  // 存的是 token 的 SHA-256 hash，不是原始 token
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

/* ------------------------------------------------------------------ */
/*  CRM / 物料 / 工班                                                  */
/* ------------------------------------------------------------------ */
export const customers = sqliteTable("customers", {
  id: id(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  source: text("source"), // 來源管道
  notes: text("notes"),
  createdAt: createdAt(),
});

export const materials = sqliteTable("materials", {
  id: id(),
  name: text("name").notNull(),
  spec: text("spec"),
  unit: text("unit"),
  unitPrice: real("unit_price"),
  supplier: text("supplier"),
  stockQty: real("stock_qty"),
  createdAt: createdAt(),
});

export const crews = sqliteTable("crews", {
  id: id(),
  name: text("name").notNull(),
  phone: text("phone"),
  specialty: text("specialty"), // 專長類別
  status: text("status", { enum: ["available", "busy", "off"] })
    .notNull()
    .default("available"),
  notes: text("notes"),
  createdAt: createdAt(),
});

/* ------------------------------------------------------------------ */
/*  工程                                                               */
/* ------------------------------------------------------------------ */
export const PROJECT_STATUSES = [
  "勘驗",
  "報價",
  "施工中",
  "完工",
  "保固中",
] as const;

export const projects = sqliteTable("projects", {
  id: id(),
  customerId: text("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  address: text("address"),
  status: text("status", { enum: PROJECT_STATUSES })
    .notNull()
    .default("勘驗"),
  startDate: text("start_date"), // YYYY-MM-DD
  endDate: text("end_date"),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const projectCrews = sqliteTable(
  "project_crews",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    crewId: text("crew_id")
      .notNull()
      .references(() => crews.id, { onDelete: "cascade" }),
    role: text("role"),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.crewId] })],
);

export const projectMaterials = sqliteTable(
  "project_materials",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    materialId: text("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    quantity: real("quantity"),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.materialId] })],
);

/* ------------------------------------------------------------------ */
/*  CMS：服務項目                                                      */
/* ------------------------------------------------------------------ */
export const services = sqliteTable("services", {
  id: id(),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  short: text("short"), // 導覽下拉用的短描述
  summary: text("summary"), // 卡片摘要
  headline: text("headline"),
  intro: text("intro"),
  symptoms: text("symptoms", { mode: "json" }).$type<string[]>().default([]),
  process: text("process", { mode: "json" })
    .$type<{ title: string; desc: string }[]>()
    .default([]),
  materials: text("materials"),
  warranty: text("warranty"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
});

/* ------------------------------------------------------------------ */
/*  CMS：施工實績                                                      */
/* ------------------------------------------------------------------ */
export const caseStudies = sqliteTable("case_studies", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category"), // service slug
  categoryLabel: text("category_label"),
  location: text("location"),
  year: text("year"),
  summary: text("summary"),
  beforeNote: text("before_note"),
  afterNote: text("after_note"),
  highlights: text("highlights", { mode: "json" }).$type<string[]>().default([]),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const caseStudyPhotos = sqliteTable("case_study_photos", {
  id: id(),
  caseStudyId: text("case_study_id")
    .notNull()
    .references(() => caseStudies.id, { onDelete: "cascade" }),
  beforeKey: text("before_key"), // R2 物件 key
  afterKey: text("after_key"),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
});

/* ------------------------------------------------------------------ */
/*  CMS：導覽 / 頁面文案 / 網站設定                                     */
/* ------------------------------------------------------------------ */
export const navMenuItems = sqliteTable("nav_menu_items", {
  id: id(),
  label: text("label").notNull(),
  href: text("href").notNull(),
  parentId: text("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const siteContent = sqliteTable("site_content", {
  id: id(),
  sectionKey: text("section_key").notNull().unique(),
  contentJson: text("content_json", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value"),
});

/* ------------------------------------------------------------------ */
/*  預約詢價                                                           */
/* ------------------------------------------------------------------ */
export const LEAD_STATUSES = ["待處理", "已聯繫", "已排程", "已完成"] as const;

export const leads = sqliteTable("leads", {
  id: id(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  address: text("address"),
  serviceType: text("service_type"),
  preferredTime: text("preferred_time"),
  description: text("description"),
  photoKeys: text("photo_keys", { mode: "json" }).$type<string[]>().default([]),
  status: text("status", { enum: LEAD_STATUSES }).notNull().default("待處理"),
  adminNote: text("admin_note"), // 後台備註（跟進紀錄）
  customerId: text("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
});

/* ------------------------------------------------------------------ */
/*  型別匯出                                                           */
/* ------------------------------------------------------------------ */
export type AdminUser = typeof adminUsers.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Material = typeof materials.$inferSelect;
export type Crew = typeof crews.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Service = typeof services.$inferSelect;
export type CaseStudy = typeof caseStudies.$inferSelect;
export type CaseStudyPhoto = typeof caseStudyPhotos.$inferSelect;
export type NavMenuItem = typeof navMenuItems.$inferSelect;
export type Lead = typeof leads.$inferSelect;
