import React from "react";
import Relay from 'react-relay'


import {commitUpdate, toMongoId} from '../utils/RelayUtils'

import DeleteUserMutation from '../mutations/DeleteUserMutation';
import ToggleUserActivatedMutation from '../mutations/ToggleUserActivatedMutation';

import cancelPromises from '../hocs/promisesCancellator';

import autobind from 'autobind-decorator'
@cancelPromises
  @autobind
class User extends React.Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  static propTypes = {
    store: React.PropTypes.object.isRequired,
    user: React.PropTypes.object.isRequired,
    sessionId: React.PropTypes.string,
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
      const {store, cancelOnUnmount} = this.props;

      console.log("delete mutation store %O",store)
      const deleteMutation = new DeleteUserMutation(
          {
            userId: id,
            store
          }
      );


      const cancellablePromise = commitUpdate(Relay.Store, deleteMutation);
      cancelOnUnmount(cancellablePromise);

      cancellablePromise
          .getPromise()
          .then(this.setDeletionOk)
          .catch((err)=> {
            if (!err.isCanceled) {

              this.setDeletionFailed();
              throw err;
            }
          })

    }
  }

  setDeletionFailed = this._setDeletionStatus.curry(true)
  setDeletionOk = this._setDeletionStatus.curry(false)

  _setDeletionStatus (status){
    this.setState({deletionFailed: status})
  }

  activateUser = this._setUserActivation.curry(true);
  deactivateUser = this._setUserActivation.curry(false);

  _setUserActivation(activated, userId) {
    return () => {
      const activationMutation = new ToggleUserActivatedMutation(
          {
            userId,
            activated
            , storeId: this.props.store.id
          }
      );

      const cancellablePromise = commitUpdate(Relay.Store, activationMutation)
      this.props.cancelOnUnmount(cancellablePromise);

      cancellablePromise
          .getPromise()
          .then(()=>this.setState({activationFailed: false}))
          .catch((err)=> {
            if (!err.isCanceled) {
              this.setState({activationFailed: true})
            }
          })

    }
  }


  render() {
    const {user, relay} = this.props;
    const relayUserId = user.id;
    const currentUsername = user.username;


    let styles = {};
    if (relayUserId == currentUsername) {//is set by delete mutation optimistic update
      styles = {display: 'none'};  // hide instead of returning null so the component doesn't get unmounted and to preserve it's state
    }

    const mongoId = toMongoId(relayUserId);
    const getButton = ({title, clickHandler, disabled}) => (<button disabled={disabled && "disabled"}
                                                                    onClick={clickHandler}>{title}</button>  )

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
                clickHandler: this.handleDeleteClicked(relayUserId),
                // disable in case it is the same authenticated user
                disabled: this.props.sessionId == relayUserId ? "disabled" : null
              })
            }

          </td>
          {relay.hasOptimisticUpdate(user) && <td>Processing node ...</td> }
          {this.state.activationFailed && 'Activation Failed'}
          {this.state.deletionFailed && 'Deletion Failed'}
        </tr>)


  }
}

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