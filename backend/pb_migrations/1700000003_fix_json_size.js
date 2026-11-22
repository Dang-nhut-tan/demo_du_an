/// <reference path="../pb_data/types.d.ts" />

migrate((db) => {
  const dao = new Dao(db);
  try {
    const auditLogs = dao.findCollectionByNameOrId("col_auditlogs01");
    if (auditLogs) {
      const field = auditLogs.schema.getFieldByName("details");
      if (field) {
        field.options = { maxSize: 2000000 };
        dao.saveCollection(auditLogs);
      }
    }
  } catch (e) {
    console.log("Migration 1700000003 note:", e);
  }
}, (db) => {
});
