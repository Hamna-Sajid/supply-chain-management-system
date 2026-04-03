import { PrismaClient } from "../src/generated/prisma/index.js";
import { faker } from "@faker-js/faker";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma } from "../src/generated/prisma/index.js";
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ["query", "error"],
});

async function main() {
  console.log("--- Cleaning up database ---");
  // Order matters here to avoid foreign key violations
  await prisma.analytics.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.rawMaterial.deleteMany();
  await prisma.user.deleteMany();

  console.log("--- Seeding Users ---");
  const roles = ["supplier", "manufacturer", "retailer", "warehouse_manager"];
  const users = [];

  for (const role of roles) {
    for (let i = 1; i <= 5; i++) {
      const prefix = role.substring(0, 3).toUpperCase();
      const user_id = `${prefix}_${i.toString().padStart(5, "0")}`;

      const user = await prisma.user.create({
        data: {
          user_id,
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: "password123", // Use hashed passwords in real scenarios
          role: role,
          contact_number: faker.phone.number(),
          address: faker.location.streetAddress(),
        },
      });
      users.push(user);
    }
  }

  const suppliers = users.filter((u) => u.role === "supplier");
  const manufacturers = users.filter((u) => u.role === "manufacturer");
  const retailers = users.filter((u) => u.role === "retailer");
  const warehouseManagers = users.filter((u) => u.role === "warehouse_manager");

  console.log("--- Seeding Raw Materials ---");
  for (let i = 0; i < 10; i++) {
    await prisma.rawMaterial.create({
      data: {
        material_name: faker.commerce.productMaterial(),
        description: faker.commerce.productDescription(),
        quantity_available: faker.number.int({ min: 100, max: 1000 }),
        unit_price: faker.commerce.price({ min: 5, max: 50 }),
        supplier_id: faker.helpers.arrayElement(suppliers).user_id,
      },
    });
  }

  console.log("--- Seeding Products ---");
  const products = [];
  for (let i = 0; i < 10; i++) {
    const product = await prisma.product.create({
      data: {
        product_name: faker.commerce.productName(),
        category: faker.commerce.department(),
        size: faker.helpers.arrayElement(["Small", "Medium", "Large", "XL"]),
        color: faker.color.human(),
        cost_price: faker.commerce.price({ min: 20, max: 100 }),
        selling_price: faker.commerce.price({ min: 120, max: 300 }),
        production_stage: "Completed",
        manufacturer_id: faker.helpers.arrayElement(manufacturers).user_id,
      },
    });
    products.push(product);
  }

  console.log("--- Seeding Inventory ---");
  for (const product of products) {
    await prisma.inventory.create({
      data: {
        product_id: product.product_id,
        user_id: faker.helpers.arrayElement([...retailers, ...manufacturers])
          .user_id,
        warehouse_id: faker.helpers.arrayElement(warehouseManagers).user_id,
        quantity_available: faker.number.int({ min: 10, max: 200 }),
        cost_price: product.cost_price,
        selling_price: product.selling_price,
      },
    });
  }

  if (products.length === 0) throw new Error("No products to create orders");

  if (retailers.length === 0 || manufacturers.length === 0) {
    throw new Error("Missing required users for order relations");
  }

  console.log("--- Seeding Orders & OrderItems ---");
  for (let i = 0; i < 15; i++) {
    const quantity = faker.number.int({ min: 1, max: 10 });
    const unitPrice = new Prisma.Decimal(
      parseFloat(faker.commerce.price({ min: 50, max: 200 })),
    );
    const subtotal = new Prisma.Decimal(quantity * unitPrice.toNumber());

    await prisma.order.create({
      data: {
        order_status: faker.helpers.arrayElement([
          "pending",
          "shipped",
          "delivered",
        ]),
        total_amount: subtotal,

        ordered_by: {
          connect: {
            user_id: faker.helpers.arrayElement(retailers).user_id,
          },
        },

        delivered_by: {
          connect: {
            user_id: faker.helpers.arrayElement(manufacturers).user_id,
          },
        },

        shipping_address: faker.location.streetAddress(),

        items: {
          create: [
            {
              product_id: faker.helpers.arrayElement(products).product_id,
              quantity: quantity,
              unit_price: unitPrice,
              subtotal: subtotal,
            },
          ],
        },
      },
    });
  }

  console.log("--- Seeding Sales ---");
  for (let i = 0; i < 10; i++) {
    const qty = faker.number.int({ min: 1, max: 5 });
    const pricePerUnit = parseFloat(
      faker.commerce.price({ min: 150, max: 300 }),
    );
    const saleSubtotal = qty * pricePerUnit;

    await prisma.sale.create({
      data: {
        retailer_id: faker.helpers.arrayElement(retailers).user_id,
        total_amount: saleSubtotal,
        sale_note: "Bulk customer purchase",
        items: {
          create: [
            {
              product_id: faker.helpers.arrayElement(products).product_id,
              quantity: qty,
              price_per_unit: pricePerUnit,
              subtotal: saleSubtotal, // Passes cleanly now
            },
          ],
        },
      },
    });
  }

  console.log("--- Seeding Analytics ---");
  for (const user of users) {
    await prisma.analytics.create({
      data: {
        user_id: user.user_id,
        total_revenue: faker.commerce.price({ min: 1000, max: 50000 }),
        total_expense: faker.commerce.price({ min: 500, max: 20000 }),
        total_shipments: faker.number.int({ min: 10, max: 100 }),
      },
    });
  }

  console.log("--- Seeding Complete! ---");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
