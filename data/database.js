const ObjectID = require('mongodb').ObjectID;

const dbManager = (db) => {

  function findUserByName(username) {
    return db.collection("users")
        .find({username})
        .limit(1)
        .next();

  }

  function findUserById(id) {
    return db.collection("users")
        .find({_id: new ObjectID(id)})
        .limit(1)
        .next();

  }

  function getProductById(id) {
    return db.collection("products")
        .find({_id: new ObjectID(id)})
        .limit(1)
        .next();
  }

  return {
    findUserById, getProductById, findUserByName
  }
};

export default  dbManager
