// prisma/seed.js
// Supply Chain Management System — Full Seed Script
// Run with: node prisma/seed.js
// Requires: DATABASE_URL and JWT_SECRET in .env

import { PrismaClient } from "../src/generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { randomUUID } from "crypto";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("❌  JWT_SECRET is not set in .env");
    process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hash = (password) => bcrypt.hashSync(password, 10);

/** Returns a date N days from now (positive) or in the past (negative) */
const daysFromNow = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d;
};

/** Generate a JWT for a seeded user */
const generateToken = (user) =>
    jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
    });

// ─── Pre-generate UUIDs so we can reference them before DB insertion ──────────

const IDS = {
    SUP1: randomUUID(),
    SUP2: randomUUID(),
    MAN1: randomUUID(),
    MAN2: randomUUID(),
    RET1: randomUUID(),
    RET2: randomUUID(),
    WHM1: randomUUID(),
    WHM2: randomUUID(),
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log("🌱  Starting seed — wiping existing data first...\n");

    // ── Clean slate (order matters due to FK constraints) ──────────────────────
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.analytics.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.revenue.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.return.deleteMany();
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.shipment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.rawMaterial.deleteMany();
    await prisma.user.deleteMany();

    console.log("✅  Database cleared\n");

    // ── 1. USERS ───────────────────────────────────────────────────────────────
    console.log("👤  Seeding users...");

    const usersData = [
        {
            user_id: IDS.SUP1,
            name: "Ahmed Karimi",
            email: "ahmed.supplier@scm.dev",
            password: hash("Password123!"),
            role: "supplier",
            contact_number: "+923001234567",
            address: "12 Industrial Zone, Karachi",
        },
        {
            user_id: IDS.SUP2,
            name: "Sara Textile Supply",
            email: "sara.supplier@scm.dev",
            password: hash("Password123!"),
            role: "supplier",
            contact_number: "+923007654321",
            address: "88 Faisalabad Export Block",
        },
        {
            user_id: IDS.MAN1,
            name: "Zain Manufacturing Co.",
            email: "zain.manufacturer@scm.dev",
            password: hash("Password123!"),
            role: "manufacturer",
            contact_number: "+923331122334",
            address: "45 SITE Area, Karachi",
        },
        {
            user_id: IDS.MAN2,
            name: "Nova Industries",
            email: "nova.manufacturer@scm.dev",
            password: hash("Password123!"),
            role: "manufacturer",
            contact_number: "+923009988776",
            address: "77 Korangi Industrial, Karachi",
        },
        {
            user_id: IDS.RET1,
            name: "Metro Retail Group",
            email: "metro.retailer@scm.dev",
            password: hash("Password123!"),
            role: "retailer",
            contact_number: "+923215556677",
            address: "10 Tariq Road, Karachi",
        },
        {
            user_id: IDS.RET2,
            name: "Citymart Stores",
            email: "citymart.retailer@scm.dev",
            password: hash("Password123!"),
            role: "retailer",
            contact_number: "+923219998877",
            address: "3 Gulshan-e-Iqbal, Karachi",
        },
        {
            user_id: IDS.WHM1,
            name: "Imran Warehouse Ops",
            email: "imran.warehouse@scm.dev",
            password: hash("Password123!"),
            role: "warehouse_manager",
            contact_number: "+923452233445",
            address: "Warehouse Block A, Port Qasim",
        },
        {
            user_id: IDS.WHM2,
            name: "Fatima Logistics Hub",
            email: "fatima.warehouse@scm.dev",
            password: hash("Password123!"),
            role: "warehouse_manager",
            contact_number: "+923456677889",
            address: "Warehouse Block B, Port Qasim",
        },
    ];

    for (const u of usersData) {
        await prisma.user.create({ data: u });
    }
    console.log(`   Created ${usersData.length} users\n`);

    // ── 2. RAW MATERIALS ───────────────────────────────────────────────────────
    console.log("🧱  Seeding raw materials...");

    const rawMaterialsInput = [
        {
            material_name: "Raw Aluminum",
            description: "High-grade aluminum ingots",
            quantity_available: 5000,
            unit_price: 25.5,
            supplier_id: IDS.SUP1,
        },
        {
            material_name: "Steel Rods",
            description: "Cold-rolled steel rods 12mm",
            quantity_available: 3000,
            unit_price: 18.75,
            supplier_id: IDS.SUP1,
        },
        {
            material_name: "Copper Wire Coil",
            description: "1.5mm copper wiring",
            quantity_available: 2000,
            unit_price: 45.0,
            supplier_id: IDS.SUP1,
        },
        {
            material_name: "Plastic Pellets (ABS)",
            description: "Acrylonitrile butadiene styrene pellets",
            quantity_available: 8000,
            unit_price: 8.2,
            supplier_id: IDS.SUP1,
        },
        {
            material_name: "Cotton Fabric Roll",
            description: "100% cotton, 150cm wide",
            quantity_available: 4000,
            unit_price: 12.0,
            supplier_id: IDS.SUP2,
        },
        {
            material_name: "Polyester Thread",
            description: "High-tenacity polyester thread",
            quantity_available: 6000,
            unit_price: 3.5,
            supplier_id: IDS.SUP2,
        },
        {
            material_name: "Zinc Alloy Castings",
            description: "Die-cast zinc alloy blanks",
            quantity_available: 1500,
            unit_price: 32.0,
            supplier_id: IDS.SUP2,
        },
        {
            material_name: "Rubber Gaskets",
            description: "EPDM rubber gaskets 50mm",
            quantity_available: 10000,
            unit_price: 1.8,
            supplier_id: IDS.SUP2,
        },
    ];

    const rawMaterials = [];
    for (const m of rawMaterialsInput) {
        rawMaterials.push(await prisma.rawMaterial.create({ data: m }));
    }
    console.log(`   Created ${rawMaterials.length} raw materials\n`);

    // ── 3. PRODUCTS ────────────────────────────────────────────────────────────
    console.log("📦  Seeding products...");

    const productsInput = [
        {
            product_name: "Aluminum Frame Unit",
            category: "Hardware",
            size: "Large",
            color: "Silver",
            cost_price: 85.0,
            selling_price: 140.0,
            production_stage: "completed",
            manufacturer_id: IDS.MAN1,
        },
        {
            product_name: "Steel Support Bracket",
            category: "Hardware",
            size: "Medium",
            color: "Black",
            cost_price: 40.0,
            selling_price: 75.0,
            production_stage: "completed",
            manufacturer_id: IDS.MAN1,
        },
        {
            product_name: "Copper Wire Harness",
            category: "Electronics",
            size: "Small",
            color: "Red",
            cost_price: 95.0,
            selling_price: 160.0,
            production_stage: "quality_check",
            manufacturer_id: IDS.MAN1,
        },
        {
            product_name: "ABS Plastic Housing",
            category: "Electronics",
            size: "Medium",
            color: "White",
            cost_price: 22.0,
            selling_price: 48.0,
            production_stage: "assembly",
            manufacturer_id: IDS.MAN1,
        },
        {
            product_name: "Control Panel Unit",
            category: "Electronics",
            size: "Large",
            color: "Grey",
            cost_price: 210.0,
            selling_price: 380.0,
            production_stage: "planning",
            manufacturer_id: IDS.MAN1,
        },
        {
            product_name: "Cotton Work Shirt",
            category: "Apparel",
            size: "M",
            color: "Blue",
            cost_price: 18.0,
            selling_price: 42.0,
            production_stage: "completed",
            manufacturer_id: IDS.MAN2,
        },
        {
            product_name: "Polyester Track Jacket",
            category: "Apparel",
            size: "L",
            color: "Black",
            cost_price: 24.0,
            selling_price: 55.0,
            production_stage: "completed",
            manufacturer_id: IDS.MAN2,
        },
        {
            product_name: "Zinc Door Handle Set",
            category: "Hardware",
            size: "Standard",
            color: "Chrome",
            cost_price: 65.0,
            selling_price: 110.0,
            production_stage: "quality_check",
            manufacturer_id: IDS.MAN2,
        },
        {
            product_name: "EPDM Seal Kit",
            category: "Industrial",
            size: "Small",
            color: "Black",
            cost_price: 12.0,
            selling_price: 28.0,
            production_stage: "sourcing",
            manufacturer_id: IDS.MAN2,
        },
        {
            product_name: "Composite Panel Board",
            category: "Construction",
            size: "XL",
            color: "Beige",
            cost_price: 130.0,
            selling_price: 220.0,
            production_stage: "assembly",
            manufacturer_id: IDS.MAN2,
        },
    ];

    const products = [];
    for (const p of productsInput) {
        products.push(await prisma.product.create({ data: p }));
    }
    console.log(`   Created ${products.length} products\n`);

    // ── 4. INVENTORY ───────────────────────────────────────────────────────────
    console.log("🏭  Seeding inventory...");

    const completedProducts = products.filter(
        (p) => p.production_stage === "completed",
    );

    const inventoryEntries = completedProducts.map((p, i) => ({
        product_id: p.product_id,
        user_id: p.manufacturer_id,
        warehouse_id: i % 2 === 0 ? IDS.WHM1 : IDS.WHM2,
        quantity_available: [300, 500, 120, 800][i % 4],
        cost_price: p.cost_price,
        selling_price: p.selling_price,
        reorder_level: 50,
        last_restocked: daysFromNow(-7),
    }));

    const inventoryRecords = [];
    for (const entry of inventoryEntries) {
        inventoryRecords.push(await prisma.inventory.create({ data: entry }));
    }
    console.log(`   Created ${inventoryRecords.length} inventory records\n`);

    // ── 5. ORDERS ──────────────────────────────────────────────────────────────
    console.log("🛒  Seeding orders...");

    const cp = (i) => completedProducts[i % completedProducts.length];

    const ordersData = [
        // RET1 orders — all 5 statuses
        {
            ordered_by_id: IDS.RET1,
            delivered_by_id: IDS.MAN1,
            order_status: "pending",
            total_amount: 700.0,
            shipping_address: "10 Tariq Road, Karachi",
            expected_delivery_date: daysFromNow(7),
            items: [{ product: cp(0), qty: 5, price: 140.0 }],
        },
        {
            ordered_by_id: IDS.RET1,
            delivered_by_id: IDS.MAN1,
            order_status: "processing",
            total_amount: 375.0,
            shipping_address: "10 Tariq Road, Karachi",
            expected_delivery_date: daysFromNow(5),
            items: [{ product: cp(1), qty: 5, price: 75.0 }],
        },
        {
            ordered_by_id: IDS.RET1,
            delivered_by_id: IDS.MAN2,
            order_status: "shipped",
            total_amount: 462.0,
            shipping_address: "10 Tariq Road, Karachi",
            expected_delivery_date: daysFromNow(2),
            items: [{ product: cp(2), qty: 11, price: 42.0 }],
        },
        {
            ordered_by_id: IDS.RET1,
            delivered_by_id: IDS.MAN2,
            order_status: "delivered",
            total_amount: 330.0,
            shipping_address: "10 Tariq Road, Karachi",
            expected_delivery_date: daysFromNow(-3),
            actual_date_delivered: daysFromNow(-1),
            items: [{ product: cp(3), qty: 6, price: 55.0 }],
        },
        {
            ordered_by_id: IDS.RET1,
            delivered_by_id: IDS.MAN1,
            order_status: "cancelled",
            total_amount: 280.0,
            shipping_address: "10 Tariq Road, Karachi",
            expected_delivery_date: daysFromNow(-5),
            items: [{ product: cp(0), qty: 2, price: 140.0 }],
        },
        // RET2 orders
        {
            ordered_by_id: IDS.RET2,
            delivered_by_id: IDS.MAN2,
            order_status: "pending",
            total_amount: 440.0,
            shipping_address: "3 Gulshan-e-Iqbal, Karachi",
            expected_delivery_date: daysFromNow(10),
            items: [{ product: cp(2), qty: 4, price: 110.0 }],
        },
        {
            ordered_by_id: IDS.RET2,
            delivered_by_id: IDS.MAN1,
            order_status: "processing",
            total_amount: 840.0,
            shipping_address: "3 Gulshan-e-Iqbal, Karachi",
            expected_delivery_date: daysFromNow(6),
            items: [{ product: cp(0), qty: 6, price: 140.0 }],
        },
        {
            ordered_by_id: IDS.RET2,
            delivered_by_id: IDS.MAN2,
            order_status: "shipped",
            total_amount: 168.0,
            shipping_address: "3 Gulshan-e-Iqbal, Karachi",
            expected_delivery_date: daysFromNow(3),
            items: [{ product: cp(3), qty: 4, price: 42.0 }],
        },
        {
            ordered_by_id: IDS.RET2,
            delivered_by_id: IDS.MAN1,
            order_status: "delivered",
            total_amount: 750.0,
            shipping_address: "3 Gulshan-e-Iqbal, Karachi",
            expected_delivery_date: daysFromNow(-4),
            actual_date_delivered: daysFromNow(-2),
            items: [{ product: cp(1), qty: 10, price: 75.0 }],
        },
        {
            ordered_by_id: IDS.RET2,
            delivered_by_id: IDS.MAN2,
            order_status: "delivered",
            total_amount: 220.0,
            shipping_address: "3 Gulshan-e-Iqbal, Karachi",
            expected_delivery_date: daysFromNow(-6),
            actual_date_delivered: daysFromNow(-2),
            items: [{ product: cp(2), qty: 4, price: 55.0 }],
        },
        // MAN1 procurement orders from SUP1
        {
            ordered_by_id: IDS.MAN1,
            delivered_by_id: IDS.SUP1,
            order_status: "pending",
            total_amount: 12750.0,
            shipping_address: "45 SITE Area, Karachi",
            expected_delivery_date: daysFromNow(14),
            items: [{ product: cp(0), qty: 150, price: 85.0 }],
        },
        {
            ordered_by_id: IDS.MAN1,
            delivered_by_id: IDS.SUP1,
            order_status: "processing",
            total_amount: 6400.0,
            shipping_address: "45 SITE Area, Karachi",
            expected_delivery_date: daysFromNow(9),
            items: [{ product: cp(1), qty: 160, price: 40.0 }],
        },
        // MAN2 procurement orders from SUP2
        {
            ordered_by_id: IDS.MAN2,
            delivered_by_id: IDS.SUP2,
            order_status: "shipped",
            total_amount: 8100.0,
            shipping_address: "77 Korangi Industrial, Karachi",
            expected_delivery_date: daysFromNow(4),
            items: [{ product: cp(2), qty: 200, price: 40.5 }],
        },
        {
            ordered_by_id: IDS.MAN2,
            delivered_by_id: IDS.SUP2,
            order_status: "delivered",
            total_amount: 3360.0,
            shipping_address: "77 Korangi Industrial, Karachi",
            expected_delivery_date: daysFromNow(-8),
            actual_date_delivered: daysFromNow(-6),
            items: [{ product: cp(3), qty: 80, price: 42.0 }],
        },
    ];

    const orders = [];
    for (const o of ordersData) {
        const { items, ...orderFields } = o;
        const order = await prisma.order.create({
            data: {
                ...orderFields,
                items: {
                    create: items.map(({ product, qty, price }) => ({
                        product_id: product.product_id,
                        quantity: qty,
                        unit_price: price,
                    })),
                },
            },
        });
        orders.push(order);
    }
    console.log(`   Created ${orders.length} orders with items\n`);

    // ── 6. SHIPMENTS ───────────────────────────────────────────────────────────
    console.log("🚚  Seeding shipments...");

    const shipmentsData = [
        {
            manufacturer_id: IDS.MAN1,
            whm_id: IDS.WHM1,
            product_id: completedProducts[0].product_id,
            quantity: 200,
            status: "delivered",
            shipping_address: "Warehouse Block A, Port Qasim",
            expected_delivery_date: daysFromNow(-5),
            actual_date_delivered: daysFromNow(-3),
        },
        {
            manufacturer_id: IDS.MAN1,
            whm_id: IDS.WHM1,
            product_id: completedProducts[1].product_id,
            quantity: 150,
            status: "in_transit",
            shipping_address: "Warehouse Block A, Port Qasim",
            expected_delivery_date: daysFromNow(2),
        },
        {
            manufacturer_id: IDS.MAN1,
            whm_id: IDS.WHM2,
            product_id: completedProducts[0].product_id,
            quantity: 80,
            status: "preparing",
            shipping_address: "Warehouse Block B, Port Qasim",
            expected_delivery_date: daysFromNow(5),
        },
        {
            manufacturer_id: IDS.MAN2,
            whm_id: IDS.WHM2,
            product_id: completedProducts[2].product_id,
            quantity: 300,
            status: "delivered",
            shipping_address: "Warehouse Block B, Port Qasim",
            expected_delivery_date: daysFromNow(-3),
            actual_date_delivered: daysFromNow(-1),
        },
        {
            manufacturer_id: IDS.MAN2,
            whm_id: IDS.WHM1,
            product_id: completedProducts[3].product_id,
            quantity: 500,
            status: "in_transit",
            shipping_address: "Warehouse Block A, Port Qasim",
            expected_delivery_date: daysFromNow(3),
        },
        {
            manufacturer_id: IDS.MAN2,
            whm_id: IDS.WHM2,
            product_id: completedProducts[2].product_id,
            quantity: 100,
            status: "rejected",
            shipping_address: "Warehouse Block B, Port Qasim",
            expected_delivery_date: daysFromNow(-1),
        },
        // Outgoing warehouse → retailer
        {
            whm_id: IDS.WHM1,
            product_id: completedProducts[1].product_id,
            quantity: 50,
            status: "delivered",
            shipping_address: "10 Tariq Road, Karachi",
            expected_delivery_date: daysFromNow(-4),
            actual_date_delivered: daysFromNow(-2),
        },
        {
            whm_id: IDS.WHM2,
            product_id: completedProducts[3].product_id,
            quantity: 40,
            status: "in_transit",
            shipping_address: "3 Gulshan-e-Iqbal, Karachi",
            expected_delivery_date: daysFromNow(1),
        },
    ];

    await prisma.shipment.createMany({ data: shipmentsData });
    console.log(`   Created ${shipmentsData.length} shipments\n`);

    // ── 7. RETURNS ─────────────────────────────────────────────────────────────
    console.log("↩️   Seeding returns...");

    const deliveredOrders = orders.filter((o) => o.order_status === "delivered");

    const returnsData = [
        {
            order_id: deliveredOrders[0].order_id,
            product_id: completedProducts[3].product_id,
            returned_by_id: IDS.RET1,
            returned_to_id: IDS.MAN2,
            reason: "Defective item — zipper broken on arrival",
            status: "pending",
            quantity: 2,
            refund_amount: 110.0,
            return_date: daysFromNow(-1),
        },
        {
            order_id: deliveredOrders[1].order_id,
            product_id: completedProducts[1].product_id,
            returned_by_id: IDS.RET2,
            returned_to_id: IDS.MAN1,
            reason: "Wrong size delivered",
            status: "approved",
            quantity: 3,
            refund_amount: 225.0,
            return_date: daysFromNow(-3),
        },
        {
            order_id: deliveredOrders[2].order_id,
            product_id: completedProducts[2].product_id,
            returned_by_id: IDS.RET2,
            returned_to_id: IDS.MAN2,
            reason: "Item not as described",
            status: "rejected",
            quantity: 1,
            refund_amount: 42.0,
            return_date: daysFromNow(-5),
        },
        {
            order_id: deliveredOrders[3].order_id,
            product_id: completedProducts[3].product_id,
            returned_by_id: IDS.RET2,
            returned_to_id: IDS.MAN2,
            reason: "Damaged packaging",
            status: "completed",
            quantity: 4,
            refund_amount: 220.0,
            return_date: daysFromNow(-7),
        },
    ];

    await prisma.return.createMany({ data: returnsData });
    console.log(`   Created ${returnsData.length} returns\n`);

    // ── 8. SALES ───────────────────────────────────────────────────────────────
    console.log("💰  Seeding sales...");

    const salesData = [
        {
            retailer_id: IDS.RET1,
            total_amount: 840.0,
            sale_note: "Bulk corporate sale — Q1",
            items: [{ product: completedProducts[0], qty: 6, price: 140.0 }],
        },
        {
            retailer_id: IDS.RET1,
            total_amount: 462.0,
            sale_note: "Walk-in store sale",
            items: [{ product: completedProducts[2], qty: 11, price: 42.0 }],
        },
        {
            retailer_id: IDS.RET2,
            total_amount: 550.0,
            sale_note: "Online order batch",
            items: [{ product: completedProducts[3], qty: 10, price: 55.0 }],
        },
        {
            retailer_id: IDS.RET2,
            total_amount: 375.0,
            sale_note: null,
            items: [{ product: completedProducts[1], qty: 5, price: 75.0 }],
        },
    ];

    for (const s of salesData) {
        const { items, ...saleFields } = s;
        await prisma.sale.create({
            data: {
                ...saleFields,
                items: {
                    create: items.map(({ product, qty, price }) => ({
                        product_id: product.product_id,
                        quantity: qty,
                        price_per_unit: price,
                    })),
                },
            },
        });
    }
    console.log(`   Created ${salesData.length} sales with items\n`);

    // ── 9. PAYMENTS ────────────────────────────────────────────────────────────
    console.log("💳  Seeding payments...");

    const paymentsData = [
        {
            user_id: IDS.RET1,
            order_id: orders[0].order_id,
            amount: 700.0,
            status: "pending",
        },
        {
            user_id: IDS.RET1,
            order_id: orders[1].order_id,
            amount: 375.0,
            status: "completed",
        },
        {
            user_id: IDS.RET1,
            order_id: orders[2].order_id,
            amount: 462.0,
            status: "completed",
        },
        {
            user_id: IDS.RET1,
            order_id: orders[3].order_id,
            amount: 330.0,
            status: "completed",
        },
        {
            user_id: IDS.RET2,
            order_id: orders[5].order_id,
            amount: 440.0,
            status: "pending",
        },
        {
            user_id: IDS.RET2,
            order_id: orders[7].order_id,
            amount: 168.0,
            status: "failed",
        },
        {
            user_id: IDS.RET2,
            order_id: orders[8].order_id,
            amount: 750.0,
            status: "completed",
        },
        {
            user_id: IDS.MAN1,
            order_id: orders[10].order_id,
            amount: 12750.0,
            status: "pending",
        },
        {
            user_id: IDS.MAN1,
            order_id: orders[11].order_id,
            amount: 6400.0,
            status: "completed",
        },
        {
            user_id: IDS.MAN2,
            order_id: orders[12].order_id,
            amount: 8100.0,
            status: "completed",
        },
    ];

    await prisma.payment.createMany({ data: paymentsData });
    console.log(`   Created ${paymentsData.length} payments\n`);

    // ── 10. REVENUE & EXPENSES ─────────────────────────────────────────────────
    console.log("📊  Seeding revenue & expenses...");

    const revenueData = [
        { user_id: IDS.MAN1, order_id: orders[11].order_id, amount: 6400.0 },
        { user_id: IDS.MAN1, order_id: orders[1].order_id, amount: 375.0 },
        { user_id: IDS.MAN2, order_id: orders[12].order_id, amount: 8100.0 },
        { user_id: IDS.MAN2, order_id: orders[8].order_id, amount: 750.0 },
        { user_id: IDS.SUP1, order_id: orders[10].order_id, amount: 12750.0 },
        { user_id: IDS.SUP2, order_id: orders[13].order_id, amount: 3360.0 },
        { user_id: IDS.RET1, order_id: orders[3].order_id, amount: 330.0 },
        { user_id: IDS.RET2, order_id: orders[8].order_id, amount: 750.0 },
        { user_id: IDS.SUP1, order_id: null, amount: 14250.0, revenue_update_date: new Date("2025-05-14T00:00:00.000Z") },
        { user_id: IDS.SUP1, order_id: null, amount: 15800.0, revenue_update_date: new Date("2025-06-18T00:00:00.000Z") },
        { user_id: IDS.SUP1, order_id: null, amount: 17150.0, revenue_update_date: new Date("2025-07-09T00:00:00.000Z") },
        { user_id: IDS.SUP1, order_id: null, amount: 18900.0, revenue_update_date: new Date("2025-08-22T00:00:00.000Z") },
        { user_id: IDS.SUP1, order_id: null, amount: 20300.0, revenue_update_date: new Date("2025-09-11T00:00:00.000Z") },
        { user_id: IDS.SUP1, order_id: null, amount: 21750.0, revenue_update_date: new Date("2025-10-27T00:00:00.000Z") },
        { user_id: IDS.SUP1, order_id: null, amount: 23100.0, revenue_update_date: new Date("2025-11-16T00:00:00.000Z") },
        { user_id: IDS.SUP1, order_id: null, amount: 22400.0, revenue_update_date: new Date("2025-12-08T00:00:00.000Z") },
    ];

    const expensesData = [
        {
            user_id: IDS.MAN1,
            order_id: orders[10].order_id,
            amount: 12750.0,
            category: "raw_materials",
        },
        {
            user_id: IDS.MAN1,
            order_id: orders[11].order_id,
            amount: 3200.0,
            category: "raw_materials",
        },
        {
            user_id: IDS.MAN1,
            order_id: null,
            amount: 5000.0,
            category: "operations",
        },
        {
            user_id: IDS.MAN2,
            order_id: orders[12].order_id,
            amount: 8100.0,
            category: "raw_materials",
        },
        {
            user_id: IDS.MAN2,
            order_id: null,
            amount: 3500.0,
            category: "operations",
        },
        {
            user_id: IDS.RET1,
            order_id: orders[2].order_id,
            amount: 462.0,
            category: "purchase",
        },
        {
            user_id: IDS.RET2,
            order_id: orders[7].order_id,
            amount: 168.0,
            category: "purchase",
        },
        {
            user_id: IDS.WHM1,
            order_id: null,
            amount: 2200.0,
            category: "logistics",
        },
        {
            user_id: IDS.WHM2,
            order_id: null,
            amount: 1800.0,
            category: "logistics",
        },
    ];

    await prisma.revenue.createMany({ data: revenueData });
    await prisma.expense.createMany({ data: expensesData });
    console.log(
        `   Created ${revenueData.length} revenue + ${expensesData.length} expense records\n`,
    );

    // ── 11. RATINGS ────────────────────────────────────────────────────────────
    console.log("⭐  Seeding ratings...");

    const ratingsData = [
        {
            given_by_id: IDS.RET1,
            given_to_id: IDS.MAN1,
            rating_value: 5,
            review: "Excellent quality and fast delivery",
        },
        {
            given_by_id: IDS.RET1,
            given_to_id: IDS.MAN2,
            rating_value: 4,
            review: "Good product, minor packaging issues",
        },
        {
            given_by_id: IDS.RET2,
            given_to_id: IDS.MAN1,
            rating_value: 4,
            review: "Reliable manufacturer, would recommend",
        },
        {
            given_by_id: IDS.RET2,
            given_to_id: IDS.MAN2,
            rating_value: 3,
            review: "Average experience, late on last order",
        },
        {
            given_by_id: IDS.MAN1,
            given_to_id: IDS.SUP1,
            rating_value: 5,
            review: "Consistent quality raw materials",
        },
        {
            given_by_id: IDS.MAN1,
            given_to_id: IDS.SUP2,
            rating_value: 4,
            review: "Good supplier, responsive team",
        },
        {
            given_by_id: IDS.MAN2,
            given_to_id: IDS.SUP2,
            rating_value: 5,
            review: "Always on time, great communication",
        },
        {
            given_by_id: IDS.WHM1,
            given_to_id: IDS.MAN1,
            rating_value: 4,
            review: "Shipments arrive well-packaged",
        },
        {
            given_by_id: IDS.WHM2,
            given_to_id: IDS.MAN2,
            rating_value: 3,
            review: "One rejected shipment last month",
        },
    ];

    await prisma.rating.createMany({ data: ratingsData });
    console.log(`   Created ${ratingsData.length} ratings\n`);

    // ── 12. ANALYTICS ──────────────────────────────────────────────────────────
    console.log("📈  Seeding analytics...");

    const analyticsData = [
        {
            user_id: IDS.SUP1,
            total_shipments: 12,
            ontime_shipments: 11,
            avg_shipment_delay: 0.5,
            ontime_delivery_rate: 91.67,
            total_revenue: 28000.0,
            total_expense: 14000.0,
            profit: 14000.0,
            avg_rating: 4.75,
            quality_score: 95.0,
        },
        {
            user_id: IDS.SUP2,
            total_shipments: 9,
            ontime_shipments: 8,
            avg_shipment_delay: 1.2,
            ontime_delivery_rate: 88.89,
            total_revenue: 18000.0,
            total_expense: 9500.0,
            profit: 8500.0,
            avg_rating: 4.5,
            quality_score: 90.0,
        },
        {
            user_id: IDS.MAN1,
            total_shipments: 18,
            ontime_shipments: 16,
            avg_shipment_delay: 0.8,
            ontime_delivery_rate: 88.89,
            total_revenue: 95000.0,
            total_expense: 60000.0,
            profit: 35000.0,
            avg_rating: 4.5,
            quality_score: 88.0,
        },
        {
            user_id: IDS.MAN2,
            total_shipments: 15,
            ontime_shipments: 12,
            avg_shipment_delay: 1.5,
            ontime_delivery_rate: 80.0,
            total_revenue: 76000.0,
            total_expense: 52000.0,
            profit: 24000.0,
            avg_rating: 3.67,
            quality_score: 82.0,
        },
        {
            user_id: IDS.RET1,
            total_shipments: 10,
            ontime_shipments: 9,
            avg_shipment_delay: 0.3,
            ontime_delivery_rate: 90.0,
            total_revenue: 42000.0,
            total_expense: 28000.0,
            profit: 14000.0,
            avg_rating: 4.5,
            quality_score: 91.0,
        },
        {
            user_id: IDS.RET2,
            total_shipments: 8,
            ontime_shipments: 7,
            avg_shipment_delay: 0.6,
            ontime_delivery_rate: 87.5,
            total_revenue: 35000.0,
            total_expense: 22000.0,
            profit: 13000.0,
            avg_rating: 3.5,
            quality_score: 85.0,
        },
        {
            user_id: IDS.WHM1,
            total_shipments: 20,
            ontime_shipments: 18,
            avg_shipment_delay: 0.7,
            ontime_delivery_rate: 90.0,
            total_revenue: 15000.0,
            total_expense: 12000.0,
            profit: 3000.0,
            avg_rating: 4.0,
            quality_score: 89.0,
        },
        {
            user_id: IDS.WHM2,
            total_shipments: 17,
            ontime_shipments: 14,
            avg_shipment_delay: 1.1,
            ontime_delivery_rate: 82.35,
            total_revenue: 12000.0,
            total_expense: 10000.0,
            profit: 2000.0,
            avg_rating: 3.0,
            quality_score: 80.0,
        },
    ];

    await prisma.analytics.createMany({ data: analyticsData });
    console.log(`   Created ${analyticsData.length} analytics records\n`);

    // ── 13. NOTIFICATIONS ──────────────────────────────────────────────────────
    console.log("🔔  Seeding notifications...");

    const notificationsData = [
        {
            user_id: IDS.SUP1,
            type: "order_received",
            description:
                "New order placed by Zain Manufacturing Co. for Raw Aluminum",
            is_read: false,
        },
        {
            user_id: IDS.SUP1,
            type: "order_received",
            description: "New order placed by Zain Manufacturing Co. for Steel Rods",
            is_read: true,
        },
        {
            user_id: IDS.SUP2,
            type: "order_received",
            description: "New order placed by Nova Industries for Cotton Fabric Roll",
            is_read: false,
        },
        {
            user_id: IDS.MAN1,
            type: "shipment_update",
            description: "Shipment to Warehouse Block A is now in transit",
            is_read: false,
        },
        {
            user_id: IDS.MAN1,
            type: "order_update",
            description: "Your order has been marked as processing by the supplier",
            is_read: false,
        },
        {
            user_id: IDS.MAN1,
            type: "low_stock",
            description: "ABS Plastic Housing inventory is below reorder level",
            is_read: true,
        },
        {
            user_id: IDS.MAN2,
            type: "shipment_update",
            description:
                "Shipment to Warehouse Block B was rejected — review damage notes",
            is_read: false,
        },
        {
            user_id: IDS.MAN2,
            type: "order_update",
            description:
                "Raw material order from Sara Textile Supply has been shipped",
            is_read: true,
        },
        {
            user_id: IDS.WHM1,
            type: "shipment_arrived",
            description:
                "Incoming shipment from Zain Manufacturing Co. has arrived — accept or reject",
            is_read: false,
        },
        {
            user_id: IDS.WHM1,
            type: "inventory_update",
            description: "Aluminum Frame Unit stock updated: +200 units added",
            is_read: true,
        },
        {
            user_id: IDS.WHM2,
            type: "shipment_arrived",
            description:
                "Incoming shipment from Nova Industries awaiting your review",
            is_read: false,
        },
        {
            user_id: IDS.WHM2,
            type: "low_stock",
            description:
                "Cotton Work Shirt stock has fallen below reorder level (50)",
            is_read: false,
        },
        {
            user_id: IDS.RET1,
            type: "order_shipped",
            description: "Your order for Polyester Track Jacket has been shipped",
            is_read: false,
        },
        {
            user_id: IDS.RET1,
            type: "return_update",
            description:
                "Your return request has been approved — refund of PKR 225 initiated",
            is_read: true,
        },
        {
            user_id: IDS.RET2,
            type: "order_delivered",
            description: "Your order from Zain Manufacturing has been delivered",
            is_read: false,
        },
        {
            user_id: IDS.RET2,
            type: "payment_failed",
            description: "Payment for your order failed — please retry",
            is_read: false,
        },
    ];

    await prisma.notification.createMany({ data: notificationsData });
    console.log(`   Created ${notificationsData.length} notifications\n`);

    // ── 14. AUDIT LOGS ─────────────────────────────────────────────────────────
    console.log("📋  Seeding audit logs...");

    const auditData = [
        {
            user_id: IDS.SUP1,
            action: "CREATE_MATERIAL",
            entity: "RawMaterial",
            entity_id: rawMaterials[0].material_id,
            details: { material_name: "Raw Aluminum", quantity: 5000 },
        },
        {
            user_id: IDS.SUP1,
            action: "UPDATE_ORDER_STATUS",
            entity: "Order",
            entity_id: orders[10].order_id,
            details: { old_status: "pending", new_status: "processing" },
        },
        {
            user_id: IDS.MAN1,
            action: "CREATE_PRODUCT",
            entity: "Product",
            entity_id: products[0].product_id,
            details: { product_name: "Aluminum Frame Unit" },
        },
        {
            user_id: IDS.MAN1,
            action: "UPDATE_STAGE",
            entity: "Product",
            entity_id: products[0].product_id,
            details: { old_stage: "assembly", new_stage: "completed" },
        },
        {
            user_id: IDS.MAN1,
            action: "CREATE_SHIPMENT",
            entity: "Shipment",
            entity_id: inventoryRecords[0].inventory_id,
            details: { warehouse_id: IDS.WHM1, quantity: 200 },
        },
        {
            user_id: IDS.MAN2,
            action: "CREATE_PRODUCT",
            entity: "Product",
            entity_id: products[5].product_id,
            details: { product_name: "Cotton Work Shirt" },
        },
        {
            user_id: IDS.WHM1,
            action: "ACCEPT_SHIPMENT",
            entity: "Shipment",
            entity_id: inventoryRecords[0].inventory_id,
            details: { quantity_received: 200 },
        },
        {
            user_id: IDS.WHM2,
            action: "REJECT_SHIPMENT",
            entity: "Shipment",
            entity_id: inventoryRecords[1].inventory_id,
            details: { reason: "Damaged on arrival" },
        },
        {
            user_id: IDS.WHM1,
            action: "UPDATE_INVENTORY",
            entity: "Inventory",
            entity_id: inventoryRecords[0].inventory_id,
            details: { old_qty: 100, new_qty: 300 },
        },
        {
            user_id: IDS.RET1,
            action: "PLACE_ORDER",
            entity: "Order",
            entity_id: orders[0].order_id,
            details: { total_amount: 700.0 },
        },
        {
            user_id: IDS.RET2,
            action: "PLACE_ORDER",
            entity: "Order",
            entity_id: orders[5].order_id,
            details: { total_amount: 440.0 },
        },
        {
            user_id: IDS.RET1,
            action: "CREATE_RETURN",
            entity: "Return",
            entity_id: orders[3].order_id,
            details: { reason: "Defective item", quantity: 2 },
        },
    ];

    await prisma.auditLog.createMany({ data: auditData });
    console.log(`   Created ${auditData.length} audit log entries\n`);

    // ── 15. PRINT JWT TOKENS ───────────────────────────────────────────────────
    console.log("─".repeat(70));
    console.log(
        "🔑  JWT TOKENS (valid 7 days) — copy into Postman / Authorization header:\n",
    );

    const allUsers = await prisma.user.findMany({
        select: { user_id: true, email: true, role: true, name: true },
    });

    for (const u of allUsers) {
        const token = generateToken(u);
        console.log(`  [${u.role.toUpperCase().padEnd(17)}]  ${u.email}`);
        console.log(`   ${token}\n`);
    }

    console.log("─".repeat(70));
    console.log("\n✅  Seed complete!\n");
    console.log("  Summary:");
    console.log(
        `  • ${usersData.length} users (2 suppliers, 2 manufacturers, 2 retailers, 2 warehouse managers)`,
    );
    console.log(`  • ${rawMaterials.length} raw materials`);
    console.log(
        `  • ${products.length} products (${completedProducts.length} completed, rest in pipeline)`,
    );
    console.log(`  • ${inventoryRecords.length} inventory records`);
    console.log(`  • ${orders.length} orders across all status states`);
    console.log(
        `  • ${shipmentsData.length} shipments (preparing / in_transit / delivered / rejected)`,
    );
    console.log(
        `  • ${returnsData.length} returns (pending / approved / rejected / completed)`,
    );
    console.log(`  • ${salesData.length} sales`);
    console.log(
        `  • ${paymentsData.length} payments (pending / completed / failed)`,
    );
    console.log(
        `  • ${revenueData.length} revenue + ${expensesData.length} expense records`,
    );
    console.log(`  • ${ratingsData.length} ratings`);
    console.log(`  • ${analyticsData.length} analytics records`);
    console.log(`  • ${notificationsData.length} notifications`);
    console.log(`  • ${auditData.length} audit log entries\n`);
    console.log("  All passwords: Password123!\n");
}

main()
    .catch((e) => {
        console.error("❌  Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
