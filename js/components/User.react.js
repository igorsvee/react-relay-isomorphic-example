import React from "react";
import Relay from 'react-relay'
import  {

    fromGlobalId,

} from 'graphql-relay'

import {commitUpdate} from '../utils/RelayUtils'

import DeleteUserMutation from '../mutations/DeleteUserMutation';
import ToggleUserActivatedMutation from '../mutations/ToggleUserActivatedMutation';
class User extends React.Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  static propTypes = {
    store: React.PropTypes.object.isRequired,
    user: React.PropTypes.object.isRequired,
  };

  handleDetailsClick(id) {
    return () => {
      this.context.router.push("/users/" + id);
    }
  }

  handleDeleteClick(id) {
    return () => {
      console.log("deleting user #" + id)

      const deleteMutation = new DeleteUserMutation(
          {
            userId: id,
            store: this.props.store
          }
      );

      commitUpdate(Relay.Store, deleteMutation)
          .then((resp)=> this.props.afterDelete())
          .catch((transaction) =>console.log("Failed deletion"))


    }
  }

  setUserActivation(userId, activated) {
    return () => {
      const activationMutation = new ToggleUserActivatedMutation(
          {
            userId,
            activated
            , storeId: this.props.store.id
          }
      );

      commitUpdate(Relay.Store, activationMutation)
          .then((resp)=>console.log("Activated successfully!"))
          .catch((transaction) =>console.log("Failed activation"))

    }

  }

  render() {
    const {user, relay} = this.props;
    const relayUserId = user.id;
    const currentUsername = user.username;
    if (relayUserId == currentUsername) {//is set by delete mutation optimistic update
      return null;
    }

    const mongoId = fromGlobalId(relayUserId).id;

    return (
        <tr key={relayUserId}>
          <td>mongoId - {mongoId}, relayId - {relayUserId}</td>
          <td>{currentUsername}</td>
          <td>{user.address}</td>
          <td>         {user.activated === true ? 'YES' : 'NO'} {user.activated ?
              <button onClick={this.setUserActivation(relayUserId, false)}>Deactivate</button>
              : <button onClick={this.setUserActivation(relayUserId, true)}>Activate</button>

          }</td>
          <td>
            <button onClick={this.handleDetailsClick(relayUserId)}>Details</button>
          </td>
          <td>
            <button onClick={this.handleDeleteClick(relayUserId)}>X</button>
          </td>
            {relay.hasOptimisticUpdate(user) && <td>Processing node ...</td> }
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