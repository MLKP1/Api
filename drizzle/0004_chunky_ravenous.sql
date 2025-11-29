ALTER TABLE "order_items" ADD COLUMN "item_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_item_id_pizzas_id_fk" FOREIGN KEY ("item_id") REFERENCES "pizzas"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
