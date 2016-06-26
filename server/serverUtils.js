import  {

    fromGlobalId,

} from 'graphql-relay'


var ObjectID = require('mongodb').ObjectID;

export function toMongoId(relayId) {
  return new ObjectID(fromGlobalId(relayId).id);
}

