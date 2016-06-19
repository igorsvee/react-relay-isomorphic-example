import  {
    globalIdField,
    fromGlobalId,

} from 'graphql-relay'

class User {

  constructor({_id, username, password, address}) {
    this._id = _id;
    this.username = username;
    this.password = password;
    this.address = address;
  }



}

export default User;