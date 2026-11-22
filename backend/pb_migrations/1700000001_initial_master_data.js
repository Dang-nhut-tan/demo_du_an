/// <reference path="../pb_data/types.d.ts" />

migrate((db) => {
  const dao = new Dao(db);

  // 1. companies
  const companies = new Collection({
    id: "col_companies01",
    name: "companies",
    type: "base",
    system: false,
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    schema: [
      {
        name: "name",
        type: "text",
        required: true,
        options: { min: 1, max: 255 }
      },
      {
        name: "code",
        type: "text",
        required: false,
        options: { min: 1, max: 50 }
      },
      {
        name: "taxId",
        type: "text",
        required: false,
        options: { min: 1, max: 50 }
      },
      {
        name: "address",
        type: "text",
        required: false,
        options: { min: 1, max: 500 }
      },
      {
        name: "phone",
        type: "text",
        required: false,
        options: { min: 1, max: 50 }
      },
      {
        name: "email",
        type: "email",
        required: false
      },
      {
        name: "status",
        type: "select",
        required: false,
        options: {
          values: ["active", "inactive"],
          maxSelect: 1
        }
      }
    ],
    indexes: [
      "CREATE UNIQUE INDEX IF NOT EXISTS `idx_company_code` ON `companies` (`code`)"
    ]
  });
  dao.saveCollection(companies);

  // 2. update users collection
  const users = dao.findCollectionByNameOrId("_pb_users_auth_");
  users.schema.addField(new SchemaField({
    name: "role",
    type: "select",
    required: true,
    options: {
      values: ["customer", "dispatcher", "admin"],
      maxSelect: 1
    }
  }));
  users.schema.addField(new SchemaField({
    name: "company",
    type: "relation",
    required: false,
    options: {
      collectionId: "col_companies01",
      cascadeDelete: false,
      maxSelect: 1
    }
  }));
  users.schema.addField(new SchemaField({
    name: "phone",
    type: "text",
    required: false
  }));
  users.listRule = "@request.auth.id != ''";
  users.viewRule = "@request.auth.id != ''";
  dao.saveCollection(users);

  // 3. shipping_lines
  const shippingLines = new Collection({
    id: "col_shiplin0001",
    name: "shipping_lines",
    type: "base",
    system: false,
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    schema: [
      {
        name: "name",
        type: "text",
        required: true
      },
      {
        name: "code",
        type: "text",
        required: false
      },
      {
        name: "active",
        type: "bool",
        required: false
      }
    ]
  });
  dao.saveCollection(shippingLines);

  // 4. locations
  const locations = new Collection({
    id: "col_locations01",
    name: "locations",
    type: "base",
    system: false,
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    schema: [
      {
        name: "name",
        type: "text",
        required: true
      },
      {
        name: "code",
        type: "text",
        required: false
      },
      {
        name: "type",
        type: "select",
        required: false,
        options: {
          values: ["depot", "warehouse", "factory", "return_point", "other"],
          maxSelect: 1
        }
      },
      {
        name: "address",
        type: "text",
        required: false
      },
      {
        name: "active",
        type: "bool",
        required: false
      }
    ]
  });
  dao.saveCollection(locations);

  // 5. ports
  const ports = new Collection({
    id: "col_ports000001",
    name: "ports",
    type: "base",
    system: false,
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    schema: [
      {
        name: "name",
        type: "text",
        required: true
      },
      {
        name: "code",
        type: "text",
        required: false
      },
      {
        name: "country",
        type: "text",
        required: false
      },
      {
        name: "type",
        type: "select",
        required: false,
        options: {
          values: ["destination", "transshipment", "both"],
          maxSelect: 1
        }
      },
      {
        name: "active",
        type: "bool",
        required: false
      }
    ]
  });
  dao.saveCollection(ports);

  // 6. cargo_types
  const cargoTypes = new Collection({
    id: "col_cargotyp001",
    name: "cargo_types",
    type: "base",
    system: false,
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    schema: [
      {
        name: "name",
        type: "text",
        required: true
      },
      {
        name: "code",
        type: "text",
        required: false
      },
      {
        name: "active",
        type: "bool",
        required: false
      }
    ]
  });
  dao.saveCollection(cargoTypes);

  // 7. container_types
  const containerTypes = new Collection({
    id: "col_conttyp0001",
    name: "container_types",
    type: "base",
    system: false,
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    schema: [
      {
        name: "name",
        type: "text",
        required: true
      },
      {
        name: "code",
        type: "text",
        required: false
      },
      {
        name: "description",
        type: "text",
        required: false
      },
      {
        name: "active",
        type: "bool",
        required: false
      }
    ]
  });
  dao.saveCollection(containerTypes);
}, (db) => {
});
