var ObjectID = require('mongodb').ObjectID;


export default   (db) => {

  function getUserById(id) {
    return db.collection("users")
        .find({_id: new ObjectID(id)})
        .limit(1)
        .next();

  }

  return {
    getUserById
  }
};


