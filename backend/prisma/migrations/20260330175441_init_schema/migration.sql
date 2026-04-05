-- CreateTable
CREATE TABLE "User" (
    "user_id" VARCHAR(20) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "contact_number" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "RawMaterial" (
    "material_id" UUID NOT NULL,
    "material_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "quantity_available" INTEGER NOT NULL DEFAULT 0,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "supplier_id" VARCHAR(20),

    CONSTRAINT "RawMaterial_pkey" PRIMARY KEY ("material_id")
);

-- CreateTable
CREATE TABLE "Product" (
    "product_id" UUID NOT NULL,
    "product_name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50),
    "size" VARCHAR(20),
    "color" VARCHAR(30),
    "cost_price" DECIMAL(10,2) NOT NULL,
    "selling_price" DECIMAL(10,2) NOT NULL,
    "production_stage" VARCHAR(50),
    "manufacturer_id" VARCHAR(20),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "inventory_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "user_id" VARCHAR(20) NOT NULL,
    "warehouse_id" VARCHAR(20),
    "quantity_available" INTEGER NOT NULL DEFAULT 0,
    "cost_price" DECIMAL(10,2) NOT NULL,
    "selling_price" DECIMAL(10,2) NOT NULL,
    "reorder_level" INTEGER DEFAULT 50,
    "last_restocked" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("inventory_id")
);

-- CreateTable
CREATE TABLE "Order" (
    "order_id" UUID NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "total_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "shipping_address" TEXT,
    "expected_delivery_date" TIMESTAMP(3),
    "actual_date_delivered" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "ordered_by_id" VARCHAR(20),
    "delivered_by_id" VARCHAR(20),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "order_item_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "sale_id" UUID NOT NULL,
    "retailer_id" VARCHAR(20) NOT NULL,
    "sale_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sale_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("sale_id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "sale_item_id" UUID NOT NULL,
    "sale_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_per_unit" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("sale_item_id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "shipment_id" UUID NOT NULL,
    "manufacturer_id" VARCHAR(20),
    "whm_id" VARCHAR(20),
    "expected_delivery_date" TIMESTAMP(3),
    "actual_date_delivered" TIMESTAMP(3),
    "status" VARCHAR(50) DEFAULT 'preparing',
    "shipping_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("shipment_id")
);

-- CreateTable
CREATE TABLE "Return" (
    "return_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "return_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "status" VARCHAR(50) DEFAULT 'pending',
    "quantity" INTEGER NOT NULL,
    "refund_amount" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "returned_by_id" VARCHAR(20),
    "returned_to_id" VARCHAR(20),

    CONSTRAINT "Return_pkey" PRIMARY KEY ("return_id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "rating_id" UUID NOT NULL,
    "given_by_id" VARCHAR(20) NOT NULL,
    "given_to_id" VARCHAR(20) NOT NULL,
    "rating_value" INTEGER NOT NULL,
    "review" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("rating_id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "payment_id" UUID NOT NULL,
    "user_id" VARCHAR(20) NOT NULL,
    "order_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(50) DEFAULT 'pending',

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "Revenue" (
    "revenue_id" UUID NOT NULL,
    "user_id" VARCHAR(20) NOT NULL,
    "order_id" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "revenue_update_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("revenue_id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "expense_id" UUID NOT NULL,
    "user_id" VARCHAR(20) NOT NULL,
    "order_id" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "expense_update_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("expense_id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "analytics_id" UUID NOT NULL,
    "user_id" VARCHAR(20) NOT NULL,
    "total_shipments" INTEGER DEFAULT 0,
    "ontime_shipments" INTEGER DEFAULT 0,
    "avg_shipment_delay" DECIMAL(10,2),
    "ontime_delivery_rate" DECIMAL(5,2),
    "total_revenue" DECIMAL(15,2) DEFAULT 0,
    "total_expense" DECIMAL(15,2) DEFAULT 0,
    "profit" DECIMAL(15,2),
    "avg_rating" DECIMAL(65,30),
    "quality_score" DECIMAL(5,2),
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("analytics_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_product_id_key" ON "Inventory"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_user_id_key" ON "Analytics"("user_id");

-- AddForeignKey
ALTER TABLE "RawMaterial" ADD CONSTRAINT "RawMaterial_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_ordered_by_id_fkey" FOREIGN KEY ("ordered_by_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_delivered_by_id_fkey" FOREIGN KEY ("delivered_by_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_retailer_id_fkey" FOREIGN KEY ("retailer_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "Sale"("sale_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_returned_by_id_fkey" FOREIGN KEY ("returned_by_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_returned_to_id_fkey" FOREIGN KEY ("returned_to_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_given_by_id_fkey" FOREIGN KEY ("given_by_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_given_to_id_fkey" FOREIGN KEY ("given_to_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sequences and ID Generation
-- This handles custom SUP_, MAN_, RET_, and WHM_ prefixes.
CREATE SEQUENCE user_seq START 1 INCREMENT 1;

CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT;
    next_no INTEGER;
BEGIN
    -- Decide prefix based on role
    CASE UPPER(NEW.role)
        WHEN 'SUPPLIER' THEN prefix := 'SUP_';
        WHEN 'MANUFACTURER' THEN prefix := 'MAN_';
        WHEN 'RETAILER' THEN prefix := 'RET_';
        WHEN 'WAREHOUSE_MANAGER' THEN prefix := 'WHM_';
        ELSE
            RAISE EXCEPTION 'Invalid role: %', NEW.role;
    END CASE;

    -- Get next sequence number
    next_no := nextval('user_seq');

    -- Create formatted ID (5 digits)
    NEW.user_id := prefix || LPAD(next_no::TEXT, 5, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_id_trigger
BEFORE INSERT ON "User"
FOR EACH ROW
EXECUTE FUNCTION set_user_id();

-- General Timestamp Updates
-- This ensures updated_at columns refresh automatically.
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON "Order"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_products_modtime BEFORE UPDATE ON "Product"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_returns_modtime BEFORE UPDATE ON "Return"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_shipments_modtime BEFORE UPDATE ON "Shipment"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_inventory_modtime BEFORE UPDATE ON "Inventory"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Inventory and Sales Logic
-- This manages stock levels and revenue tracking.
CREATE OR REPLACE FUNCTION update_last_restocked()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity_available > OLD.quantity_available THEN
        NEW.last_restocked = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_last_restocked
BEFORE UPDATE ON "Inventory"
FOR EACH ROW
EXECUTE FUNCTION update_last_restocked();

CREATE OR REPLACE FUNCTION trg_order_items_changes()
RETURNS TRIGGER AS $$
DECLARE
    sum_amount NUMERIC;
BEGIN
    SELECT COALESCE(SUM(subtotal), 0)
    INTO sum_amount
    FROM "OrderItem"
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);

    UPDATE "Order"
    SET total_amount = sum_amount
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_order_items_changes
AFTER INSERT OR UPDATE OR DELETE ON "OrderItem"
FOR EACH ROW
EXECUTE FUNCTION trg_order_items_changes();

CREATE OR REPLACE FUNCTION fn_recalc_sale_total()
RETURNS TRIGGER AS $$
DECLARE
    sum_amount NUMERIC := 0;
BEGIN
    SELECT COALESCE(SUM(subtotal), 0) INTO sum_amount
    FROM "SaleItem"
    WHERE sale_id = COALESCE(NEW.sale_id, OLD.sale_id);

    UPDATE "Sale"
    SET total_amount = sum_amount,
        updated_at = NOW()
    WHERE sale_id = COALESCE(NEW.sale_id, OLD.sale_id);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalc_sale_total_after_ins_upd_del
AFTER INSERT OR UPDATE OR DELETE ON "SaleItem"
FOR EACH ROW
EXECUTE FUNCTION fn_recalc_sale_total();

-- Financial Tracking (Revenue & Expense)
-- Automatically records transactions based on order status.
CREATE OR REPLACE FUNCTION record_expense_on_order()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "Expense" (user_id, amount, order_id)
    VALUES (NEW.ordered_by_id, NEW.total_amount, NEW.order_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_record_expense
AFTER INSERT ON "Order"
FOR EACH ROW
EXECUTE FUNCTION record_expense_on_order();

CREATE OR REPLACE FUNCTION record_revenue_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_status = 'delivered' AND OLD.order_status != 'delivered' THEN
        INSERT INTO "Revenue" (user_id, amount, order_id)
        VALUES (NEW.delivered_by_id, NEW.total_amount, NEW.order_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_record_revenue
AFTER UPDATE ON "Order"
FOR EACH ROW
EXECUTE FUNCTION record_revenue_on_delivery();

-- Analytics and Ratings
-- Keeps performance metrics up to date.
CREATE OR REPLACE FUNCTION update_avg_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rat DECIMAL(3,2);
    user_id_val VARCHAR(20);
BEGIN
    IF TG_OP = 'DELETE' THEN
        user_id_val := OLD.given_to_id;
    ELSE
        user_id_val := NEW.given_to_id;
    END IF;

    SELECT COALESCE(AVG(rating_value), 0) INTO avg_rat
    FROM "Rating" WHERE given_to_id = user_id_val;

    INSERT INTO "Analytics" (analytics_id, user_id, avg_rating, updated_on)
    VALUES (gen_random_uuid(), user_id_val, avg_rat, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        avg_rating = avg_rat,
        updated_on = NOW();

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_avg_rating
AFTER INSERT OR UPDATE OR DELETE ON "Rating"
FOR EACH ROW
EXECUTE FUNCTION update_avg_rating();
