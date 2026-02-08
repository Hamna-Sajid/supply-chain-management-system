# Supply Chain Management System - Workflow Specifications

## Workflow 1: Supplier Order Fulfillment Workflow
**Actor:** Supplier (Raw Material Provider)
**Description:** This workflow enables suppliers to receive, process, and fulfill raw material orders from clothing manufacturers in the fashion industry. The supplier manages the complete order lifecycle from receipt to delivery and payment tracking.

**User-System Interaction Sequence:**
1. **Login & Authentication**
   - User Action: Supplier navigates to login page, enters email and password
   - System Response: Authenticates credentials, validates role, redirects to Supplier Dashboard displaying KPIs (Pending Orders: 5, Revenue: $15,000, Avg Rating: 4.2/5)

2. **Order Notification & Review**
   - User Action: Supplier clicks "Manufacturer Orders" tab
   - System Response: Displays table of all orders with columns: Order ID, Manufacturer, Material Type, Quantity, Order Date, Status
   - System Feature: Real-time order updates, color-coded status indicators

3. **Order Processing Initiation**
   - User Action: Supplier selects a "Cotton Fabric - 1000 meters" order with "Pending" status, clicks "Process Order"
   - System Response: Opens order detail view showing manufacturer contact, delivery address, special instructions
   - System Feature: Order history tracking, manufacturer performance data display

4. **Inventory Check & Allocation**
   - User Action: Supplier checks available stock
   - System Response: System auto-checks inventory, shows available quantity (1500 meters), allows allocation
   - System Feature: Inventory validation, automatic stock reservation

5. **Shipment Preparation**
   - User Action: Supplier clicks "Prepare Shipment", enters shipment details
   - System Response: Opens shipment form with fields: Tracking Number, Carrier, Estimated Delivery, Actual Quantity
   - System Feature: Carrier integration, shipment tracking setup

6. **Order Status Update**
   - User Action: Supplier updates status to "Shipped", submits shipment details
   - System Response: Updates order status, notifies manufacturer via email, creates shipment record
   - System Feature: Automated notifications, status transition validation

7. **Payment Tracking**
   - User Action: Supplier navigates to "Payments" section
   - System Response: Displays payment status for all shipped orders, highlights overdue payments
   - System Feature: Automated payment reminders, financial reporting

8. **Performance Review**
   - User Action: Supplier views "Ratings & Reviews"
   - System Response: Shows manufacturer feedback, calculates average rating, displays performance metrics
   - System Feature: Rating system, performance analytics dashboard

**Key Features Demonstrated:**
- Role-based dashboard access
- Real-time order tracking
- Inventory management integration
- Automated notification system
- Payment status monitoring
- Performance rating system


=== Workflow 2 ===
## Manufacturer Production Workflow

**Actor:** Manufacturer (Clothing Producer)

**Description:** This workflow supports clothing manufacturers in sourcing materials, managing production stages, and distributing finished garments through the supply chain.

---

### User-System Interaction Sequence

1. **Dashboard Access**
* **User Action:** Manufacturer logs in with credentials.
* **System Response:** Displays Manufacturer Dashboard with production metrics (Items in Production: 3, Finished Stock: 450 units).


2. **Material Sourcing**
* **User Action:** Clicks "Source Materials", searches for "Premium Denim".
* **System Response:** Shows supplier catalog with filters (material type, price, supplier rating).
* **System Feature:** Supplier comparison, bulk ordering capability.


3. **Purchase Order Creation**
* **User Action:** Selects material, enters quantity (500 meters), clicks "Place Order".
* **System Response:** Generates purchase order with auto-calculated total, requests confirmation.
* **System Feature:** Order template system, cost calculation automation.


4. **Production Management**
* **User Action:** Navigates to "Product Management", creates "Men's Designer Jeans" product.
* **System Response:** Provides production stage template (Design → Cutting → Sewing → Quality → Packaging).
* **System Feature:** Production pipeline visualization, stage dependency management.


5. **Production Tracking**
* **User Action:** Updates batch status through each production stage.
* **System Response:** Updates progress bar, records timestamps for each stage completion.
* **System Feature:** Production timeline, bottleneck identification.


6. **Inventory Update**
* **User Action:** Marks production as "Completed" for 200 pairs of jeans.
* **System Response:** Auto-adds to finished goods inventory, updates stock levels.
* **System Feature:** Automatic inventory synchronization, stock level alerts.


7. **Warehouse Distribution**
* **User Action:** Creates shipment to warehouse for 150 pairs.
* **System Response:** Generates shipment label, updates warehouse inventory expectations.
* **System Feature:** Shipping coordination, warehouse capacity planning.


8. **Order Fulfillment Monitoring**
* **User Action:** Views retailer orders for produced items.
* **System Response:** Shows order fulfillment status, delivery timelines.
* **System Feature:** Order tracking integration, delivery ETA calculations.



---

### Key Features Demonstrated

* Supplier catalog browsing
* Production pipeline management
* Automated inventory updates
* Warehouse coordination
* Order fulfillment tracking

=== Workflow 3 ===
\## Workflow 3: Warehouse Inventory Management Workflow

\*\*Actor:\*\* Warehouse Manager

\*\*Description:\*\* This workflow enables warehouse managers to receive, store, and distribute clothing items between manufacturers and retailers with real-time inventory tracking.



\*\*User-System Interaction Sequence:\*\*

1\. \*\*Dashboard Overview\*\*

&nbsp;  - User Action: Warehouse Manager logs into system

&nbsp;  - System Response: Displays warehouse dashboard with key metrics (Incoming: 3 shipments, Low Stock: 2 items)



2\. \*\*Shipment Receiving\*\*

&nbsp;  - User Action: Clicks "Incoming Shipments", sees notification for "Men's Jeans - 150 pairs"

&nbsp;  - System Response: Shows shipment details (Manufacturer, Product, Quantity, Expected Date)

&nbsp;  - System Feature: Shipment alert system, expected arrival tracking



3\. \*\*Physical Receipt \& Verification\*\*

&nbsp;  - User Action: Receives physical shipment, inspects, clicks "Accept Shipment"

&nbsp;  - System Response: Updates inventory count (+150), changes status to "Received"

&nbsp;  - System Feature: Receipt confirmation, damage reporting capability



4\. \*\*Storage Management\*\*

&nbsp;  - User Action: Assigns storage location (Aisle 3, Rack B) to received items

&nbsp;  - System Response: Updates inventory records with location data

&nbsp;  - System Feature: Location tracking, warehouse layout mapping



5\. \*\*Order Processing\*\*

&nbsp;  - User Action: System alerts for retailer order (50 pairs), clicks "Process Order"

&nbsp;  - System Response: Shows order details, suggests optimal picking route

&nbsp;  - System Feature: Order picking optimization, inventory allocation



6\. \*\*Shipment Preparation\*\*

&nbsp;  - User Action: Picks items, packages, updates status to "Ready for Shipping"

&nbsp;  - System Response: Generates shipping label, updates inventory (-50)

&nbsp;  - System Feature: Shipping integration, inventory deduction automation



7\. \*\*Low Stock Management\*\*

&nbsp;  - User Action: System highlights "Women's Dresses - Low Stock (15 units)"

&nbsp;  - System Response: Shows reorder suggestion, allows restock request to manufacturer

&nbsp;  - System Feature: Stock level monitoring, automated reorder triggers



8\. \*\*Reporting \& Analytics\*\*

&nbsp;  - User Action: Generates weekly inventory report

&nbsp;  - System Response: Produces report with stock movements, turnover rates, space utilization

&nbsp;  - System Feature: Analytics dashboard, report generation, trend analysis



\*\*Key Features Demonstrated:\*\*

\- Real-time inventory tracking

\- Shipment receiving workflow

\- Storage location management

\- Order picking optimization

\- Automated stock alerts

\- Comprehensive reporting

