/// <reference path="../pb_data/types.d.ts" />

migrate((db) => {
  const dao = new Dao(db);

  const masterDataCols = [
    { id: "col_shiplin0001", name: "shipping_lines" },
    { id: "col_locations01", name: "locations" },
    { id: "col_ports000001", name: "ports" },
    { id: "col_cargotyp001", name: "cargo_types" },
    { id: "col_conttyp0001", name: "container_types" }
  ];

  for (const item of masterDataCols) {
    const col = dao.findCollectionByNameOrId(item.id);

    // 1. Ensure code field exists
    if (!col.schema.getFieldByName("code")) {
      col.schema.addField(new SchemaField({
        name: "code",
        type: "text",
        required: false
      }));
    }

    // 2. Ensure description field exists
    if (!col.schema.getFieldByName("description")) {
      col.schema.addField(new SchemaField({
        name: "description",
        type: "text",
        required: false
      }));
    }

    // 3. Ensure isActive field exists
    if (!col.schema.getFieldByName("isActive")) {
      col.schema.addField(new SchemaField({
        name: "isActive",
        type: "bool",
        required: false
      }));
    }

    // 4. Ensure sortOrder field exists
    if (!col.schema.getFieldByName("sortOrder")) {
      col.schema.addField(new SchemaField({
        name: "sortOrder",
        type: "number",
        required: false
      }));
    }

    // Update API Rules
    col.listRule = "@request.auth.role = 'admin' || isActive = true";
    col.viewRule = "@request.auth.role = 'admin' || isActive = true";
    col.createRule = "@request.auth.role = 'admin'";
    col.updateRule = "@request.auth.role = 'admin'";
    col.deleteRule = "@request.auth.role = 'admin'";

    dao.saveCollection(col);
  }

  // Create form_field_config collection
  const formFieldConfig = new Collection({
    id: "col_formcfg00001",
    name: "form_field_config",
    type: "base",
    system: false,
    listRule: "@request.auth.role = 'admin' || isVisible = true",
    viewRule: "@request.auth.role = 'admin' || isVisible = true",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    schema: [
      {
        name: "fieldKey",
        type: "text",
        required: true
      },
      {
        name: "label",
        type: "text",
        required: true
      },
      {
        name: "placeholder",
        type: "text",
        required: false
      },
      {
        name: "helpText",
        type: "text",
        required: false
      },
      {
        name: "displayOrder",
        type: "number",
        required: false
      },
      {
        name: "isVisible",
        type: "bool",
        required: false
      },
      {
        name: "defaultValue",
        type: "text",
        required: false
      }
    ],
    indexes: [
      "CREATE UNIQUE INDEX IF NOT EXISTS `idx_form_field_key` ON `form_field_config` (`fieldKey`)"
    ]
  });
  dao.saveCollection(formFieldConfig);

  // Update booking_requests with historical snapshot fields
  const bookingRequests = dao.findCollectionByNameOrId("col_bookreq0001");
  const snapshotFields = [
    "shippingLineName",
    "packingLocationName",
    "stuffingLocationName",
    "emptyPickupLocationName",
    "customsClearanceLocationName",
    "destinationPortName",
    "transshipmentPortName",
    "cargoTypeName",
    "containerTypesSnapshot"
  ];
  for (const fName of snapshotFields) {
    if (!bookingRequests.schema.getFieldByName(fName)) {
      bookingRequests.schema.addField(new SchemaField({
        name: fName,
        type: "text",
        required: false
      }));
    }
  }
  dao.saveCollection(bookingRequests);
}, (db) => {
});
