migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("qsw1x6fu9izysoe")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "gmnumarh",
    "name": "date",
    "type": "date",
    "required": true,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("qsw1x6fu9izysoe")

  // remove
  collection.schema.removeField("gmnumarh")

  return dao.saveCollection(collection)
})
