import React from "react";
import Relay from 'react-relay'
import  {

    fromGlobalId,

} from 'graphql-relay'

import DeleteUserMutation from '../mutations/DeleteUserMutation';
class User extends React.Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  handleDetailsClick(id) {
    return () =>{
      this.context.router.push("/users/" + id);
    }
  }

  handleDeleteClick (id) {
    return () => {
      console.log("deleting user #... " + id)

      Relay.Store.commitUpdate(
          new DeleteUserMutation(
              {
                userId: id
                , store: this.props.store
              }
          )
          , {
            onSuccess: () => {
              console.log("Deleted successfully! ")
            }

          }
      );
    }
  }

  render() {
    const {user} = this.props;

    const relayUserId = user.id;
    const realId = fromGlobalId(relayUserId).id;

    return (
        <tr key={relayUserId}>
          <td>realId - {realId}, relayId - {relayUserId}</td>
          <td>{user.username}</td>
          <td>{user.address}</td>
          <td>
            <button onClick={this.handleDetailsClick(relayUserId)}>Details</button>
          </td>
          <td>
            <button onClick={this.handleDeleteClick(relayUserId )}>X</button>
          </td>
        </tr>

    )
  }
}

// fragment on User type!!!
User = Relay.createContainer(User, {
  fragments: {
    //  needs 3 fields from the User type
    user: () => Relay.QL`
     fragment UserInfo on User{
       username,
       address,
       id
     }
     `
  }
});

export default User;