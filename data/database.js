var ObjectID = require('mongodb').ObjectID;


export default   (db) => {

  function getUserById(id) {
    return db.collection("users")
        .find({_id: new ObjectID(id)})
        .limit(1)
        .next();
    //     ;
    // console.log("cursor: %O", cursor)
    //
    // console.log("cursor: hasNext() " + cursor.hasNext())
    // const obj = cursor.next();
    // console.log("cursor NEXT: %O", obj)
    // return obj;
  }

  return {
    getUserById
  }
};


