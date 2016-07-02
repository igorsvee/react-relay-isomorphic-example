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

  constructor(props, context) {
    super(props, context);

    this.state = {
      activationFailed: false
      , deletionFailed: false
    }
  }

  handleDetailsClick(id) {
    return () => {
      this.context.router.push("/users/" + id);
    }
  }

  handleDeleteClick(id) {
    return () => {

      const deleteMutation = new DeleteUserMutation(
          {
            userId: id,
            store: this.props.store
          }
      );


      const setErrorDeletionState = this._getStateThunkIfTruthy(this.state.deletionFailed === false, {deletionFailed: true});
      const setSuccessfulDeletionState = this._getStateThunkIfTruthy(this.state.deletionFailed === true, {deletionFailed: false});

      commitUpdate(Relay.Store, deleteMutation)
          .then(setSuccessfulDeletionState)
          .catch(setErrorDeletionState)

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

      const setErrorActivationState = this._getStateThunkIfTruthy(this.state.activationFailed === false, {activationFailed: true});
      const setSuccessfulActivationState = this._getStateThunkIfTruthy(this.state.activationFailed === true, {activationFailed: false});
      commitUpdate(Relay.Store, activationMutation)
          .then(setSuccessfulActivationState)
          .catch(setErrorActivationState)

    }

  }

  _getStateThunkIfTruthy(cond, state) {
    const thisFunc = this._getStateThunkIfTruthy;
    if (arguments.length < thisFunc.length) {
      return thisFunc.bind(...arguments)
    } else {
      return () => {
        if (cond) {
          this.setState({...state})
        }
      }
    }
  }


  render() {
    const {user, relay} = this.props;
    const relayUserId = user.id;
    const currentUsername = user.username;


    let styles = {};
    if (relayUserId == currentUsername) {//is set by delete mutation optimistic update
      styles = {display: 'none'};  // hide instead of returning null so the component doesn't get unmounted and the state is kept
    }

    const mongoId = fromGlobalId(relayUserId).id;

    return (
        <tr style={styles} key={relayUserId}>
          <td>mongoId - {mongoId}, relayId - {relayUserId}</td>
          <td>{currentUsername}</td>
          <td>{user.address}</td>
          <td>         {user.activated === true ? 'YES' : 'NO'} {user.activated === true ?
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
            {this.state.activationFailed && 'Activation Failed'}
            {this.state.deletionFailed && 'Deletion Failed'}
        </tr>)


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