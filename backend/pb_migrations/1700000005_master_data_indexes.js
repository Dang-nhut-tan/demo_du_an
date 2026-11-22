/// <reference path="../pb_data/types.d.ts" />

migrate((db) => {
  const dao = new Dao(db);

  const tables = [
    { id: "col_shiplin0001", name: "shipping_lines" },
    { id: "col_locations01", name: "locations" },
    { id: "col_ports000001", name: "ports" },
    { id: "col_cargotyp001", name: "cargo_types" },
    { id: "col_conttyp0001", name: "container_types" }
  ];

  for (const tbl of tables) {
    try {
      const col = dao.findCollectionByNameOrId(tbl.id);
      col.indexes = [
        `CREATE UNIQUE INDEX IF NOT EXISTS \`idx_${tbl.name}_code\` ON \`${tbl.name}\` (\`code\`)`
      ];
      dao.saveCollection(col);
    } catch (e) {
      console.log(`Index notice for ${tbl.name}:`, e);
    }
  }
}, (db) => {
});
