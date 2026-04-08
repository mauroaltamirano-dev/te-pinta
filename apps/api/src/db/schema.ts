import {
    boolean,
    doublePrecision,
    pgTable,
    text,
    timestamp,
    uuid,
    uniqueIndex,
} from "drizzle-orm/pg-core";

export const categoriesTable = pgTable(
    "categories",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        name: text("name").notNull(),
        description: text("description"),
        isActive: boolean("is_active").notNull().default(true),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        nameUniqueIdx: uniqueIndex("categories_name_unique_idx").on(table.name),
    }),
);

export const ingredientsTable = pgTable(
    "ingredients",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        name: text("name").notNull(),
        description: text("description"),
        unit: text("unit").notNull(),
        currentCost: doublePrecision("current_cost").notNull(),
        isActive: boolean("is_active").notNull().default(true),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        nameUniqueIdx: uniqueIndex("ingredients_name_unique_idx").on(table.name),
    }),
);

export const productsTable = pgTable(
    "products",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        categoryId: uuid("category_id")
            .notNull()
            .references(() => categoriesTable.id),
        name: text("name").notNull(),
        description: text("description"),
        kind: text("kind").notNull(),
        unitPrice: doublePrecision("unit_price").notNull(),
        halfDozenPrice: doublePrecision("half_dozen_price"),
        dozenPrice: doublePrecision("dozen_price"),
        directCost: doublePrecision("direct_cost"),
        isActive: boolean("is_active").notNull().default(true),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        nameUniqueIdx: uniqueIndex("products_name_unique_idx").on(table.name),
    }),
);

export const recipesTable = pgTable(
    "recipes",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        productId: uuid("product_id")
            .notNull()
            .references(() => productsTable.id),
        yieldQuantity: doublePrecision("yield_quantity").notNull().default(1),
        notes: text("notes"),
        isActive: boolean("is_active").notNull().default(true),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        productUniqueIdx: uniqueIndex("recipes_product_id_unique_idx").on(
            table.productId,
        ),
    }),
);

export const recipeItemsTable = pgTable("recipe_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    recipeId: uuid("recipe_id")
        .notNull()
        .references(() => recipesTable.id),
    ingredientId: uuid("ingredient_id")
        .notNull()
        .references(() => ingredientsTable.id),
    quantity: doublePrecision("quantity").notNull(),
    unit: text("unit").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const ordersTable = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id"),
  customerNameSnapshot: text("customer_name_snapshot"),
  customerPhoneSnapshot: text("customer_phone_snapshot"),
  customerAddressSnapshot: text("customer_address_snapshot"),
  status: text("status").notNull(),
  channel: text("channel").notNull(),
  deliveryDate: timestamp("delivery_date", { withTimezone: true }),
  paymentMethod: text("payment_method").notNull().default("cash"),
  isPaid: boolean("is_paid").notNull().default(false),
  notes: text("notes"),
  subtotalAmount: doublePrecision("subtotal_amount").notNull(),
  discountAmount: doublePrecision("discount_amount").notNull().default(0),
  totalAmount: doublePrecision("total_amount").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => ordersTable.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => productsTable.id),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unitSalePriceSnapshot: doublePrecision("unit_sale_price_snapshot").notNull(),
  unitCostSnapshot: doublePrecision("unit_cost_snapshot").notNull(),
  lineSubtotal: doublePrecision("line_subtotal").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const clientsTable = pgTable('clients', {
  id:        uuid('id').primaryKey().defaultRandom(),
  name:      text('name').notNull(),          // nombre, apellido o apodo
  phone:     text('phone'),
  address:   text('address'),
  notes:     text('notes'),
  isActive:  boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const purchasesTable = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: text("date").notNull(),
  type: text("type").notNull(), // 'ingredient' | 'other'
  ingredientId: uuid("ingredient_id").references(() => ingredientsTable.id),
  nameSnapshot: text("name_snapshot").notNull(),
  quantity: doublePrecision("quantity"),
  unit: text("unit"),
  unitPrice: doublePrecision("unit_price"),
  totalAmount: doublePrecision("total_amount").notNull(),
  supplier: text("supplier"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const weeklyClosuresTable = pgTable("weekly_closures", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("open"),
  notes: text("notes"),
  snapshot: text("snapshot"), // JSON snapshot for historical data
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true })
});
