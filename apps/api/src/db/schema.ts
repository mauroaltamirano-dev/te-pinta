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