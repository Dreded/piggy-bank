migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("qsw1x6fu9izysoe")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ldylgen3",
    "name": "type",
    "type": "text",
    "required": true,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("qsw1x6fu9izysoe")

  // remove
  collection.schema.removeField("ldylgen3")

  return dao.saveCollection(collection)
})
