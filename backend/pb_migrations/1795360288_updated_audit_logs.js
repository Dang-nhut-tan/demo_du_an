/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("col_auditlogs01")
  if (!collection) return

  const existingField = collection.schema.getFieldByName("details")
  if (existingField) {
    existingField.options = { maxSize: 2000000 }
    return dao.saveCollection(collection)
  }

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "gaovbwu3",
    "name": "details",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("col_auditlogs01")
  if (!collection) return
  const existingField = collection.schema.getFieldByName("details")
  if (existingField) {
    existingField.options = { maxSize: 0 }
    return dao.saveCollection(collection)
  }
})
