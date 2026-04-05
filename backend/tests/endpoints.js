/**
 * Automated API Endpoint Tester for SCM System
 * Run with: node test-api.js
 * (Requires Node.js v18+ for native fetch)
 */

// ─── 1. CONFIGURATION ────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:5000'; // Change if using a different port or /api prefix

// 🔑 PASTE YOUR SEED JWT TOKENS HERE
const TOKENS = {
    supplier: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MTVlYjY3My0wMDhiLTQzZWYtYWI4Ny0xMWU0NGRhZTNkMjEiLCJyb2xlIjoic3VwcGxpZXIiLCJpYXQiOjE3NzU0MTI1MjgsImV4cCI6MTc3NjAxNzMyOH0.m_EEzz-PPdpxVRTTJiZ8XRFyyNOn55UgQlKW-DiQv44',
    manufacturer: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmYmJkYzM1OC02YjI2LTQyY2YtYTcyZC0wZTk4OTE1MDdiNzgiLCJyb2xlIjoibWFudWZhY3R1cmVyIiwiaWF0IjoxNzc1NDEyNTI4LCJleHAiOjE3NzYwMTczMjh9.897y0PMMkbuPEYsT8ogq6EvA6Ir1Sxr--8zZebNYTV4',
    warehouse: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjMjQ5YzljNC04OWRkLTQ2YTMtOWY0Yi1hMjczN2RjNzA1N2UiLCJyb2xlIjoid2FyZWhvdXNlX21hbmFnZXIiLCJpYXQiOjE3NzU0MTI1MjgsImV4cCI6MTc3NjAxNzMyOH0.BMQ0ylNbUlHL43bCcILKER_rsFM6p-zV_taz4Jb5MJU',
    analytics: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjMjQ5YzljNC04OWRkLTQ2YTMtOWY0Yi1hMjczN2RjNzA1N2UiLCJyb2xlIjoid2FyZWhvdXNlX21hbmFnZXIiLCJpYXQiOjE3NzU0MTI1MjgsImV4cCI6MTc3NjAxNzMyOH0.BMQ0ylNbUlHL43bCcILKER_rsFM6p-zV_taz4Jb5MJU', // Can be any user's token
};

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
};

async function apiCall(method, endpoint, token, body = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);

        // Handle empty responses (like 204 No Content)
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        return { status: response.status, ok: response.ok, data };
    } catch (error) {
        return { status: 500, ok: false, error: error.message };
    }
}

function logResult(method, endpoint, result) {
    if (result.ok || result.status === 201) {
        console.log(`${colors.green}✔ [${result.status}] ${method.padEnd(6)} ${endpoint}${colors.reset}`);
    } else {
        const errorMsg = result.data?.error || result.error || JSON.stringify(result.data);
        console.log(`${colors.red}✖ [${result.status}] ${method.padEnd(6)} ${endpoint} - ${errorMsg}${colors.reset}`);
    }
}

// Safely extract the ID from an object regardless of the specific column name
const extractId = (item) =>
    item.id || item.product_id || item.material_id || item.order_id ||
    item.shipment_id || item.inventory_id || item.notification_id || item.user_id;


// ─── TEST SUITES ─────────────────────────────────────────────────────────────

async function testSupplier() {
    const t = TOKENS.supplier;
    if (!t || t.includes('PASTE')) return console.log(`${colors.yellow}⏭ Skipping Supplier tests (No token)${colors.reset}`);

    console.log(`\n${colors.cyan}─── Testing Supplier Endpoints ───${colors.reset}`);

    // GET Materials
    let res = await apiCall('GET', '/supplier/materials', t);
    logResult('GET', '/supplier/materials', res);

    // POST Material
    res = await apiCall('POST', '/supplier/materials', t, {
        material_name: 'Test Kevlar Mesh',
        quantity_available: 500,
        unit_price: 15.50
    });
    logResult('POST', '/supplier/materials', res);

    // GET & PATCH Orders
    res = await apiCall('GET', '/supplier/orders', t);
    logResult('GET', '/supplier/orders', res);

    if (res.data && res.data.length > 0) {
        const orderId = extractId(res.data[0]);
        let patchRes = await apiCall('PATCH', `/supplier/orders/${orderId}/status`, t, { status: 'confirmed' });
        logResult('PATCH', `/supplier/orders/${orderId}/status`, patchRes);
    } else {
        console.log(`${colors.yellow}  ↳ Skipped PATCH order status (No orders found)${colors.reset}`);
    }
}


async function testManufacturer() {
    const t = TOKENS.manufacturer;
    if (!t || t.includes('PASTE')) return console.log(`${colors.yellow}⏭ Skipping Manufacturer tests (No token)${colors.reset}`);

    console.log(`\n${colors.cyan}─── Testing Manufacturer Endpoints ───${colors.reset}`);

    // Simple GETs
    const gets = ['/dashboard', '/raw-materials', '/orders', '/products', '/inventory', '/warehouses', '/shipments', '/payments', '/production-stages'];
    for (const endpoint of gets) {
        let res = await apiCall('GET', `/manufacturer${endpoint}`, t);
        logResult('GET', `/manufacturer${endpoint}`, res);
    }

    // POST Order (Procurement)
    let matRes = await apiCall('GET', '/manufacturer/raw-materials', t);

    if (matRes.data && matRes.data.length > 0) {
        const material = matRes.data[0];
        const matId = extractId(material);
        const supplierId = material.supplier_id; // Grab the supplier ID attached to the material

        let orderRes = await apiCall('POST', '/manufacturer/orders', t, {
            supplier_id: supplierId,
            items: [
                {
                    material_id: matId,
                    quantity: 1000,
                    unit_price: material.unit_price,
                }
            ]
        });
        // logResult('POST', '/manufacturer/orders', orderRes);
    } else {
        console.log(`${colors.yellow}  ↳ Skipped POST /manufacturer/orders (No raw materials found to order)${colors.reset}`);
    }

    // POST Product Pipeline tests
    let prodRes = await apiCall('POST', '/manufacturer/products', t, {
        name: 'Test Automated Gadget', // Handled by swagger/controller
        product_name: 'Test Automated Gadget', // Handled if strict DB mapping
        quantity: 50
    });
    logResult('POST', '/manufacturer/products', prodRes);

    if (prodRes.ok && prodRes.data) {
        const pId = extractId(prodRes.data);

        let resStage = await apiCall('PUT', `/manufacturer/products/${pId}/stage`, t, { production_stage: 'completed' });
        logResult('PUT', `/manufacturer/products/${pId}/stage`, resStage);

        let resQty = await apiCall('PUT', `/manufacturer/products/${pId}/quantity`, t, { quantity: 120 });
        logResult('PUT', `/manufacturer/products/${pId}/quantity`, resQty);

        // let resDel = await apiCall('DELETE', `/manufacturer/products/${pId}`, t);
        // logResult('DELETE', `/manufacturer/products/${pId}`, resDel);
    }

    // Inventory Put
    let invRes = await apiCall('GET', '/manufacturer/inventory', t);
    if (invRes.data && invRes.data.length > 0) {
        const iId = extractId(invRes.data[0]);
        let priceRes = await apiCall('PUT', `/manufacturer/inventory/${iId}`, t, { selling_price: 199.99 });
        // logResult('PUT', `/manufacturer/inventory/${iId}`, priceRes);
    }

    // Shipments Put
    let shipRes = await apiCall('GET', '/manufacturer/shipments', t);
    if (shipRes.data && shipRes.data.length > 0) {
        const sId = extractId(shipRes.data[0]);
        let statusRes = await apiCall('PUT', `/manufacturer/shipments/${sId}/status`, t, { status: 'in_transit' });
        // logResult('PUT', `/manufacturer/shipments/${sId}/status`, statusRes);
    }
}


async function testWarehouse() {
    const t = TOKENS.warehouse;
    if (!t || t.includes('PASTE')) return console.log(`${colors.yellow}⏭ Skipping Warehouse tests (No token)${colors.reset}`);

    console.log(`\n${colors.cyan}─── Testing Warehouse Endpoints ───${colors.reset}`);

    const gets = ['/dashboard', '/shipments', '/inventory', '/low-stock', '/orders'];
    for (const endpoint of gets) {
        let res = await apiCall('GET', `/warehouse${endpoint}`, t);
        logResult('GET', `/warehouse${endpoint}`, res);
    }

    // Shipment Operations
    let shipRes = await apiCall('GET', '/warehouse/shipments', t);
    if (shipRes.data && shipRes.data.length > 0) {
        const sId = extractId(shipRes.data[0]);

        let statusRes = await apiCall('PUT', `/warehouse/shipments/${sId}/status`, t, { status: 'delivered' });
        // logResult('PUT', `/warehouse/shipments/${sId}/status`, statusRes);

        // Test accept
        let acceptRes = await apiCall('PUT', `/warehouse/shipments/${sId}/accept`, t);
        // logResult('PUT', `/warehouse/shipments/${sId}/accept`, acceptRes);

        // Test reject
        if (shipRes.data.length > 1) {
            const sId2 = extractId(shipRes.data[1]);
            let rejectRes = await apiCall('PUT', `/warehouse/shipments/${sId2}/reject`, t, { damage_notes: 'Crushed box in transit' });
            // logResult('PUT', `/warehouse/shipments/${sId2}/reject`, rejectRes);
        }
    } else {
        console.log(`${colors.yellow}  ↳ Skipped shipment PUT routes (No shipments found)${colors.reset}`);
    }

    // Inventory Operations
    let invRes = await apiCall('GET', '/warehouse/inventory', t);
    if (invRes.data && invRes.data.length > 0) {
        const iId = extractId(invRes.data[0]);
        let updateRes = await apiCall('PUT', `/warehouse/inventory/${iId}`, t, { quantity_available: 450, notes: 'Automated test count' });
        // logResult('PUT', `/warehouse/inventory/${iId}`, updateRes);
    }

    // Order Operations
    let orderRes = await apiCall('GET', '/warehouse/orders', t);
    if (orderRes.data && orderRes.data.length > 0) {
        const oId = extractId(orderRes.data[0]);
        let orderStatusRes = await apiCall('PUT', `/warehouse/orders/${oId}/status`, t, { status: 'shipped' });
        logResult('PUT', `/warehouse/orders/${oId}/status`, orderStatusRes);
    }
}


async function testAnalytics() {
    const t = TOKENS.analytics;
    if (!t || t.includes('PASTE')) return console.log(`${colors.yellow}⏭ Skipping Analytics tests (No token)${colors.reset}`);

    console.log(`\n${colors.cyan}─── Testing Analytics Endpoints ───${colors.reset}`);

    const gets = ['/dashboard', '/financial', '/inventory', '/orders', '/shipments', '/performance', '/audit'];
    for (const endpoint of gets) {
        let res = await apiCall('GET', `/analytics${endpoint}`, t);
        logResult('GET', `/analytics${endpoint}`, res);
    }
}


async function testNotifications() {
    const t = TOKENS.analytics; // Re-use analytics token to test notifications
    if (!t || t.includes('PASTE')) return console.log(`${colors.yellow}⏭ Skipping Notification tests (No token)${colors.reset}`);

    console.log(`\n${colors.cyan}─── Testing Notification Endpoints ───${colors.reset}`);

    let res = await apiCall('GET', '/notifications', t);
    logResult('GET', '/notifications', res);

    let unreadRes = await apiCall('GET', '/notifications?unread_only=true', t);
    logResult('GET', '/notifications?unread_only=true', unreadRes);

    let readAllRes = await apiCall('PUT', '/notifications/read-all', t);
    logResult('PUT', '/notifications/read-all', readAllRes);

    if (res.data && res.data.length > 0) {
        const nId = extractId(res.data[0]);

        let readRes = await apiCall('PUT', `/notifications/${nId}/read`, t);
        logResult('PUT', `/notifications/${nId}/read`, readRes);

        let delRes = await apiCall('DELETE', `/notifications/${nId}`, t);
        logResult('DELETE', `/notifications/${nId}`, delRes);
    } else {
        console.log(`${colors.yellow}  ↳ Skipped Notification PUT/DELETE (No notifications found for this user)${colors.reset}`);
    }
}

// ─── RUNNER ──────────────────────────────────────────────────────────────────
async function runAllTests() {
    console.log(`${colors.green}🚀 Starting SCM API Automated Test Suite...${colors.reset}\n`);

    await testSupplier();
    await testManufacturer();
    await testWarehouse();
    await testAnalytics();
    await testNotifications();

    console.log(`\n${colors.green}✅ All test suites completed!${colors.reset}`);
}

runAllTests();