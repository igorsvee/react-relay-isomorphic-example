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

  handleDetailsClicked(id) {
    return () => {
      this.context.router.push("/users/" + id);
    }
  }

  handleDeleteClicked(id) {
    return () => {

      const deleteMutation = new DeleteUserMutation(
          {
            userId: id,
            store: this.props.store
          }
      );


      commitUpdate(Relay.Store, deleteMutation)
          .then(()=>this.setState({deletionFailed: false}))
          .catch(()=>this.setState({deletionFailed: true}))

    }
  }

  activateUser = this._setUserActivation.bind(this, true);
  deactivateUser = this._setUserActivation.bind(this, false);

  _setUserActivation(activated, userId) {
    return () => {
      const activationMutation = new ToggleUserActivatedMutation(
          {
            userId,
            activated
            , storeId: this.props.store.id
          }
      );

      commitUpdate(Relay.Store, activationMutation)
          .then(()=>this.setState({activationFailed: false}))
          .catch(()=>this.setState({activationFailed: true}))

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
    const getButton = ({title, clickHandler}) => <button onClick={clickHandler}>{title}</button>

    return (
        <tr style={styles} key={relayUserId}>
          <td>mongoId - {mongoId}, relayId - {relayUserId}</td>
          <td>{currentUsername}</td>
          <td>{user.address}</td>
          <td>         {user.activated ? 'YES' : 'NO'}
                       {user.activated ?
                           getButton({
                             title: 'Deactivate',
                             clickHandler: this.deactivateUser(relayUserId)
                           }) :
                           getButton({
                             title: 'Activate',
                             clickHandler: this.activateUser(relayUserId)
                           })}
          </td>
          <td>
            {
              getButton({
                title: 'Details',
                clickHandler: this.handleDetailsClicked(relayUserId)
              })
            }


          </td>
          <td>
            {
              getButton({
                title: 'X',
                clickHandler: this.handleDeleteClicked(relayUserId)
              })
            }

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