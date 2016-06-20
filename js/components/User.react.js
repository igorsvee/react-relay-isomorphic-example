import React from "react";
import Relay from 'react-relay'
import  {

    fromGlobalId,

} from 'graphql-relay'

import DeleteUserMutation from '../mutations/DeleteUserMutation';
import ToggleUserActivatedMutation from '../mutations/ToggleUserActivatedMutation';
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

  handleActivation(id,activated) {
    return () => {
      console.log("id %s activated %s storeId",id,activated,this.props.store.id)
      Relay.Store.commitUpdate(
          new ToggleUserActivatedMutation(
              {
                userId: id,
                activated
                , storeId: this.props.store.id
              }
          )
          , {
            onSuccess: () => {

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
          <td>         {user.activated === true ? 'YES' : 'NO'} {user.activated ?
              <button onClick={this.handleActivation(relayUserId,false)}>Deactivate</button>
              :<button onClick={this.handleActivation(relayUserId,true)}>Activate</button>

          }</td>
          <td>
            <button onClick={this.handleDetailsClick(relayUserId)}>Details</button>
          </td>
          <td>
            <button onClick={this.handleDeleteClick(relayUserId )}>X</button>
          </td>
          {this.props.relay.hasOptimisticUpdate(this.props.user) && <td>Activation/deactivation...</td> }
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
     activated,
       username,
       address,
       id
       
     }
     `
  }
});

export default User;