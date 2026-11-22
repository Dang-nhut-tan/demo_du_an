/// <reference path="../pb_data/types.d.ts" />

migrate((db) => {
  const dao = new Dao(db);

  // 1. customer_profiles
  const customerProfiles = new Collection({
    id: "col_custprof001",
    name: "customer_profiles",
    type: "base",
    system: false,
    listRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || user = @request.auth.id)",
    viewRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || user = @request.auth.id)",
    createRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || user = @request.auth.id)",
    updateRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || user = @request.auth.id)",
    deleteRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    schema: [
      {
        name: "user",
        type: "relation",
        required: true,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: "company",
        type: "relation",
        required: false,
        options: {
          collectionId: "col_companies01",
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: "fullName",
        type: "text",
        required: false
      },
      {
        name: "position",
        type: "text",
        required: false
      },
      {
        name: "phone",
        type: "text",
        required: false
      },
      {
        name: "department",
        type: "text",
        required: false
      },
      {
        name: "autoFillEnabled",
        type: "bool",
        required: false
      }
    ]
  });
  dao.saveCollection(customerProfiles);

  // 2. shipping_defaults
  const shippingDefaults = new Collection({
    id: "col_shipdef0001",
    name: "shipping_defaults",
    type: "base",
    system: false,
    listRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || company = @request.auth.company)",
    viewRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || company = @request.auth.company)",
    createRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || company = @request.auth.company)",
    updateRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || company = @request.auth.company)",
    deleteRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    schema: [
      {
        name: "company",
        type: "relation",
        required: true,
        options: {
          collectionId: "col_companies01",
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: "user",
        type: "relation",
        required: false,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: "shippingLine",
        type: "text",
        required: false
      },
      {
        name: "vesselName",
        type: "text",
        required: false
      },
      {
        name: "stuffingLocation",
        type: "text",
        required: false
      },
      {
        name: "emptyPickupLocation",
        type: "text",
        required: false
      },
      {
        name: "customsClearanceLocation",
        type: "text",
        required: false
      },
      {
        name: "destinationPort",
        type: "text",
        required: false
      },
      {
        name: "transshipmentPort",
        type: "text",
        required: false
      },
      {
        name: "cargoType",
        type: "text",
        required: false
      },
      {
        name: "defaultContainerType",
        type: "text",
        required: false
      },
      {
        name: "defaultQuantity",
        type: "number",
        required: false
      },
      {
        name: "notes",
        type: "text",
        required: false
      }
    ]
  });
  dao.saveCollection(shippingDefaults);

  // 3. booking_requests
  const bookingRequests = new Collection({
    id: "col_bookreq0001",
    name: "booking_requests",
    type: "base",
    system: false,
    listRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || company = @request.auth.company)",
    viewRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || company = @request.auth.company)",
    createRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || (company = @request.auth.company && (@request.data.status = 'DRAFT' || @request.data.status = 'PENDING')))",
    updateRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || (company = @request.auth.company && (status = 'DRAFT' || status = 'PENDING') && @request.data.status != 'APPROVED'))",
    deleteRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || (company = @request.auth.company && status = 'DRAFT'))",
    schema: [
      {
        name: "bookingNumber",
        type: "text",
        required: true,
        options: { min: 1, max: 100 }
      },
      {
        name: "customer",
        type: "relation",
        required: false,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: "company",
        type: "relation",
        required: true,
        options: {
          collectionId: "col_companies01",
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: "shippingLine",
        type: "text",
        required: false
      },
      {
        name: "vesselName",
        type: "text",
        required: false
      },
      {
        name: "voyageNumber",
        type: "text",
        required: false
      },
      {
        name: "requestedClosingBeforeDate",
        type: "text",
        required: false
      },
      {
        name: "requestedClosingAfterDate",
        type: "text",
        required: false
      },
      {
        name: "siCutoffTime",
        type: "text",
        required: false
      },
      {
        name: "cutoffTime",
        type: "text",
        required: false
      },
      {
        name: "emptyPickupDate",
        type: "text",
        required: false
      },
      {
        name: "departureDate",
        type: "text",
        required: false
      },
      {
        name: "stuffingLocation",
        type: "text",
        required: false
      },
      {
        name: "emptyPickupLocation",
        type: "text",
        required: false
      },
      {
        name: "customsClearanceLocation",
        type: "text",
        required: false
      },
      {
        name: "destinationPort",
        type: "text",
        required: false
      },
      {
        name: "transshipmentPort",
        type: "text",
        required: false
      },
      {
        name: "cargoType",
        type: "text",
        required: false
      },
      {
        name: "weight",
        type: "text",
        required: false
      },
      {
        name: "totalContainers",
        type: "number",
        required: false
      },
      {
        name: "notes",
        type: "text",
        required: false
      },
      {
        name: "status",
        type: "select",
        required: true,
        options: {
          values: ["DRAFT", "PENDING", "APPROVED", "REJECTED"],
          maxSelect: 1
        }
      },
      {
        name: "rejectReason",
        type: "text",
        required: false
      },
      {
        name: "approvedBy",
        type: "relation",
        required: false,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: "approvedAt",
        type: "text",
        required: false
      }
    ],
    indexes: [
      "CREATE UNIQUE INDEX IF NOT EXISTS `idx_booking_num` ON `booking_requests` (`bookingNumber`)"
    ]
  });
  dao.saveCollection(bookingRequests);

  // 4. booking_containers
  const bookingContainers = new Collection({
    id: "col_bookcon0001",
    name: "booking_containers",
    type: "base",
    system: false,
    listRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || booking.company = @request.auth.company)",
    viewRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || booking.company = @request.auth.company)",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || booking.company = @request.auth.company)",
    deleteRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || booking.company = @request.auth.company)",
    schema: [
      {
        name: "booking",
        type: "relation",
        required: true,
        options: {
          collectionId: "col_bookreq0001",
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: "containerType",
        type: "text",
        required: true
      },
      {
        name: "quantity",
        type: "number",
        required: true
      },
      {
        name: "requestedYCGCDate",
        type: "text",
        required: false
      },
      {
        name: "notes",
        type: "text",
        required: false
      }
    ]
  });
  dao.saveCollection(bookingContainers);

  // 5. booking_attachments
  const bookingAttachments = new Collection({
    id: "col_bookatt0001",
    name: "booking_attachments",
    type: "base",
    system: false,
    listRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || booking.company = @request.auth.company)",
    viewRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || booking.company = @request.auth.company)",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || booking.company = @request.auth.company)",
    schema: [
      {
        name: "booking",
        type: "relation",
        required: true,
        options: {
          collectionId: "col_bookreq0001",
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: "file",
        type: "file",
        required: false,
        options: {
          maxSelect: 1,
          maxSize: 52428800
        }
      },
      {
        name: "fileName",
        type: "text",
        required: false
      },
      {
        name: "fileType",
        type: "text",
        required: false
      },
      {
        name: "fileSize",
        type: "number",
        required: false
      },
      {
        name: "uploadedBy",
        type: "relation",
        required: false,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1
        }
      }
    ]
  });
  dao.saveCollection(bookingAttachments);

  // 6. schedule_change_requests
  const scheduleChangeRequests = new Collection({
    id: "col_schchgreq01",
    name: "schedule_change_requests",
    type: "base",
    system: false,
    listRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || company = @request.auth.company)",
    viewRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || company = @request.auth.company)",
    createRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || (company = @request.auth.company && @request.data.status = 'PENDING'))",
    updateRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin')",
    deleteRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    schema: [
      {
        name: "requestNumber",
        type: "text",
        required: true
      },
      {
        name: "booking",
        type: "relation",
        required: true,
        options: {
          collectionId: "col_bookreq0001",
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: "customer",
        type: "relation",
        required: false,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: "company",
        type: "relation",
        required: true,
        options: {
          collectionId: "col_companies01",
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: "reason",
        type: "text",
        required: true
      },
      {
        name: "status",
        type: "select",
        required: true,
        options: {
          values: ["PENDING", "APPROVED", "REJECTED"],
          maxSelect: 1
        }
      },
      {
        name: "reviewedBy",
        type: "relation",
        required: false,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: "reviewedAt",
        type: "text",
        required: false
      },
      {
        name: "reviewNote",
        type: "text",
        required: false
      },
      {
        name: "attachment",
        type: "file",
        required: false,
        options: {
          maxSelect: 1,
          maxSize: 52428800
        }
      }
    ]
  });
  dao.saveCollection(scheduleChangeRequests);

  // 7. schedule_change_items
  const scheduleChangeItems = new Collection({
    id: "col_schchgitm01",
    name: "schedule_change_items",
    type: "base",
    system: false,
    listRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || changeRequest.company = @request.auth.company)",
    viewRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || changeRequest.company = @request.auth.company)",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin')",
    deleteRule: "@request.auth.role = 'dispatcher' || @request.auth.role = 'admin'",
    schema: [
      {
        name: "changeRequest",
        type: "relation",
        required: true,
        options: {
          collectionId: "col_schchgreq01",
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: "fieldName",
        type: "text",
        required: true
      },
      {
        name: "fieldLabel",
        type: "text",
        required: false
      },
      {
        name: "oldValue",
        type: "text",
        required: false
      },
      {
        name: "newValue",
        type: "text",
        required: false
      },
      {
        name: "status",
        type: "select",
        required: false,
        options: {
          values: ["PENDING", "APPROVED", "REJECTED"],
          maxSelect: 1
        }
      }
    ]
  });
  dao.saveCollection(scheduleChangeItems);

  // 8. transport_progress
  const transportProgress = new Collection({
    id: "col_transprog01",
    name: "transport_progress",
    type: "base",
    system: false,
    listRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || booking.company = @request.auth.company)",
    viewRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || booking.company = @request.auth.company)",
    createRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin')",
    updateRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin')",
    deleteRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin')",
    schema: [
      {
        name: "booking",
        type: "relation",
        required: true,
        options: {
          collectionId: "col_bookreq0001",
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: "stage",
        type: "select",
        required: true,
        options: {
          values: ["received", "confirmed", "planning", "dispatched", "packing", "transporting", "completed"],
          maxSelect: 1
        }
      },
      {
        name: "stageOrder",
        type: "number",
        required: true
      },
      {
        name: "title",
        type: "text",
        required: true
      },
      {
        name: "description",
        type: "text",
        required: false
      },
      {
        name: "location",
        type: "text",
        required: false
      },
      {
        name: "driverName",
        type: "text",
        required: false
      },
      {
        name: "driverPhone",
        type: "text",
        required: false
      },
      {
        name: "licensePlate",
        type: "text",
        required: false
      },
      {
        name: "containerNumber",
        type: "text",
        required: false
      },
      {
        name: "sealNumber",
        type: "text",
        required: false
      },
      {
        name: "status",
        type: "select",
        required: true,
        options: {
          values: ["PENDING", "IN_PROGRESS", "COMPLETED"],
          maxSelect: 1
        }
      },
      {
        name: "completedAt",
        type: "text",
        required: false
      },
      {
        name: "updatedBy",
        type: "relation",
        required: false,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1
        }
      }
    ]
  });
  dao.saveCollection(transportProgress);

  // 9. notifications
  const notifications = new Collection({
    id: "col_notificat01",
    name: "notifications",
    type: "base",
    system: false,
    listRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || user = @request.auth.id)",
    viewRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || user = @request.auth.id)",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || user = @request.auth.id)",
    deleteRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin' || user = @request.auth.id)",
    schema: [
      {
        name: "user",
        type: "relation",
        required: true,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: "company",
        type: "relation",
        required: false,
        options: {
          collectionId: "col_companies01",
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: "title",
        type: "text",
        required: true
      },
      {
        name: "message",
        type: "text",
        required: true
      },
      {
        name: "type",
        type: "select",
        required: false,
        options: {
          values: ["booking", "schedule_change", "transport", "system"],
          maxSelect: 1
        }
      },
      {
        name: "referenceId",
        type: "text",
        required: false
      },
      {
        name: "isRead",
        type: "bool",
        required: false
      }
    ]
  });
  dao.saveCollection(notifications);

  // 10. audit_logs
  const auditLogs = new Collection({
    id: "col_auditlogs01",
    name: "audit_logs",
    type: "base",
    system: false,
    listRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin')",
    viewRule: "@request.auth.id != '' && (@request.auth.role = 'dispatcher' || @request.auth.role = 'admin')",
    createRule: "@request.auth.id != ''",
    updateRule: null,
    deleteRule: null,
    schema: [
      {
        name: "user",
        type: "relation",
        required: false,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: "action",
        type: "text",
        required: true
      },
      {
        name: "collection",
        type: "text",
        required: false
      },
      {
        name: "recordId",
        type: "text",
        required: false
      },
      {
        name: "details",
        type: "json",
        required: false,
        options: {
          maxSize: 2000000
        }
      },
      {
        name: "ipAddress",
        type: "text",
        required: false
      }
    ]
  });
  dao.saveCollection(auditLogs);
}, (db) => {
});
