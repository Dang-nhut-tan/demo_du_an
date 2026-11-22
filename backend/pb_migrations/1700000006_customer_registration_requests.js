/// <reference path="../pb_data/types.d.ts" />

migrate((db) => {
  const dao = new Dao(db);

  // 1. Cập nhật schema users: thêm trường status và thắt chặt createRule
  const users = dao.findCollectionByNameOrId("_pb_users_auth_");

  if (!users.schema.getFieldByName("status")) {
    users.schema.addField(new SchemaField({
      name: "status",
      type: "select",
      required: false,
      options: {
        values: ["pending", "active", "rejected", "inactive"],
        maxSelect: 1
      }
    }));
  }

  // Khóa cứng quyền tạo tài khoản: chỉ cho phép role = 'customer' và status = 'pending'
  // Ngăn chặn triệt để lỗ hổng tự cấp quyền role = 'admin' hoặc status = 'active' qua frontend
  users.createRule = "@request.data.role = 'customer' && (@request.data.status = '' || @request.data.status = 'pending') && (@request.data.company = '' || @request.data.company = null)";
  dao.saveCollection(users);

  // 2. Tạo collection registration_requests
  const regRequests = new Collection({
    id: "col_regreq00001",
    name: "registration_requests",
    type: "base",
    system: false,
    listRule: "@request.auth.role = 'admin'",
    viewRule: "@request.auth.role = 'admin' || email = @request.auth.email",
    createRule: "status = 'PENDING'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
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
        name: "fullName",
        type: "text",
        required: true,
        options: { min: 2, max: 255 }
      },
      {
        name: "email",
        type: "email",
        required: true
      },
      {
        name: "phone",
        type: "text",
        required: true,
        options: { min: 8, max: 20 }
      },
      {
        name: "companyName",
        type: "text",
        required: true,
        options: { min: 2, max: 255 }
      },
      {
        name: "taxCode",
        type: "text",
        required: true,
        options: { min: 8, max: 20 }
      },
      {
        name: "companyAddress",
        type: "text",
        required: false,
        options: { max: 500 }
      },
      {
        name: "notificationEmail",
        type: "email",
        required: false
      },
      {
        name: "companyPhone",
        type: "text",
        required: false,
        options: { max: 20 }
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
        name: "rejectionReason",
        type: "text",
        required: false,
        options: { max: 1000 }
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
        type: "date",
        required: false
      }
    ],
    indexes: [
      "CREATE INDEX IF NOT EXISTS `idx_regreq_status` ON `registration_requests` (`status`)",
      "CREATE INDEX IF NOT EXISTS `idx_regreq_taxCode` ON `registration_requests` (`taxCode`)",
      "CREATE INDEX IF NOT EXISTS `idx_regreq_email` ON `registration_requests` (`email`)"
    ]
  });

  dao.saveCollection(regRequests);
}, (db) => {
  const dao = new Dao(db);
  try {
    const regRequests = dao.findCollectionByNameOrId("col_regreq00001");
    dao.deleteCollection(regRequests);
  } catch (e) {
    // ignore
  }
});
