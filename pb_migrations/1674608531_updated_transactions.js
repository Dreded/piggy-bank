migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("qsw1x6fu9izysoe")

  collection.listRule = "@request.auth.id = owner"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("qsw1x6fu9izysoe")

  collection.listRule = null

  return dao.saveCollection(collection)
})
