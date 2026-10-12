-- Normalize the catalog; retain the previous two tables as a local migration backup.
ALTER TABLE batches RENAME TO legacy_batches;
--> statement-breakpoint
ALTER TABLE products RENAME TO legacy_products;
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`sku` text NOT NULL,
	`size` text NOT NULL,
	`unit_price_huf` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`contact_name` text NOT NULL,
	`email` text NOT NULL,
	`city` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_code` text NOT NULL,
	`customer_id` integer NOT NULL,
	`variant_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`due_date` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `batches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`batch_code` text NOT NULL,
	`variant_id` integer NOT NULL,
	`order_id` integer,
	`owner_id` integer NOT NULL,
	`status` text NOT NULL,
	`quantity` integer NOT NULL,
	`planned_date` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO products (id,name,category,description) SELECT id,name,category,'' FROM legacy_products;
--> statement-breakpoint
INSERT INTO variants (id,product_id,sku,size,unit_price_huf) SELECT id,id,sku,size,0 FROM legacy_products;
--> statement-breakpoint
INSERT INTO batches (id,batch_code,variant_id,order_id,owner_id,status,quantity,planned_date,notes) SELECT id,batch_code,product_id,NULL,owner_id,status,quantity,planned_date,notes FROM legacy_batches;
--> statement-breakpoint
CREATE UNIQUE INDEX `batches_batch_code_unique_v2` ON `batches` (`batch_code`);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_code_unique` ON `orders` (`order_code`);
--> statement-breakpoint
CREATE UNIQUE INDEX `variants_sku_unique` ON `variants` (`sku`);
