import React from "react";
import linkState from 'react-link-state';
import Relay from 'react-relay'
import User from './User.react'
import UpdateUserMutation from '../mutations/UpdateUserMutation';
import  {

    fromGlobalId,

} from 'graphql-relay'
import autobind from 'autobind-decorator'

@autobind
class UserConcrete extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      editMode: false,
      username: '',
      address: ''
    };

    // console.log("constructxqor {this.props.relay.route.params.userId} %s {this.props.relay.variables.userId} %s", props.relay.route.params.userId,props.relay.variables.userId)
    console.warn("constructor PROPS %O ", this.props)


  }

  //todo refractor
  //todo not using constructor intentionally
  componentWillMount() {
    //  injected from react-router
    if (this.hasRequiredPropsFromRouter()) {
      this.updateUserStateFromProps(this.props)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.hasRequiredPropsFromRouter()) {
      //  1st render with injected router props
      this.updateUserStateFromProps(nextProps)
      console.warn("componentWillReceiveProps PROPS %O ", nextProps)
      this.componentWillReceiveProps = function (nextProps) {
        if (this.hasRequiredPropsFromRouter() && (this.props.store.userConnection != nextProps.store.userConnection)) {
          console.log("user has changed ")
          this.updateUserStateFromProps(nextProps)
        }
      }

    }


  }

  usersEqualStateAndProps() {
    const user = this.getUserNodeFromProps(this.props);
    return this.state.username == user.username && this.state.address == user.address
  }

  turnOnEditMode() {
    this.setState({
      editMode: true
    })
  }

  hasRequiredPropsFromRouter() {
    return this.props.userId != null;
  }

  renderUserContent(user) {
    if (this.state.editMode) {
      return (<tr>
        <td>
          -
        </td>
        <td>
          <input valueLink={linkState(this, 'username')} ref="username" type="text"/>
        </td>
        <td>
          <input valueLink={linkState(this, 'address')} ref="address" type="text"/>
        </td>
      </tr>)
    } else {
      return (<tr>
        <td>
          {fromGlobalId(user.id).id}
        </td>
        <td>
          {user.username}
        </td>
        <td>
          {user.address}
        </td>
      </tr>)
    }


  }

  renderUserControls() {
    if (this.state.editMode) {
      return (
          <tr>
            <td>
              -
            </td>
            <td>
              <button onClick={this.handleCancelChanges}>Cancel Changes</button>
            </td>
            <td>
              <button onClick={this.handleSaveChanges}>Update DB</button>
            </td>

          </tr>
      )
    } else {
      return (
          <tr>
            <td>
              <button onClick={this.turnOnEditMode}>Edit</button>
            </td>
          </tr>
      )
    }


  }

  propertyChanged(propName) {
    return this.state[propName] !== this.getUserNodeFromProps(this.props)[propName]
  }

  getUserNodeFromProps(props) {
    return props.store.userConnection.edges[0].node;
  }


  handleSaveChanges() {
    const username = this.propertyChanged('username') ? this.state.username : undefined;
    const address = this.propertyChanged('address') ? this.state.address : undefined;

    const userStoreNode = this.getUserNodeFromProps(this.props);

    //  won't change, using it
    const id = userStoreNode.id;

    //  for optimistic comparison
    const userBeforeUpdate = {id, username: userStoreNode.username, address: userStoreNode.address}

    console.log("Saving %O...", {username, address, id});

    Relay.Store.commitUpdate(
        new UpdateUserMutation(
            {
              username, id, address
              , storeId: this.props.store.id
              , userBeforeUpdate
            }
        )
        , {
          onSuccess: () => {
            console.log("UPDATED ! ")
          }

        }
    );

    this.turnOffEditMode();
  }

  turnOffEditMode() {
    this.setState({editMode: false});
  }

  updateUserStateFromProps(props) {
    const user = this.getUserNodeFromProps(props);
    const {username, address} = user;

    this.setState({
      username,
      address
    })
  }

  handleCancelChanges() {
    this.updateUserStateFromProps(this.props)

    this.turnOffEditMode();
  }


  render() {
    if (!this.hasRequiredPropsFromRouter()) {
      return <h1>Loading...</h1>
    }

    const {relay} = this.props;

    const userDb = this.getUserNodeFromProps(this.props);

    return (
        <div>
          <h1>Concrete page for {userDb.username}:</h1>
          {relay.hasOptimisticUpdate(this.props.store) && <h2>Updating...</h2>}
          <table>
            <tr>
              <td>
                id
              </td>
              <td>
                username
              </td>
              <td>
                address
              </td>
            </tr>


            {this.renderUserContent(this.getUserNodeFromProps(this.props))}

            {this.renderUserControls()}
          </table>
          {!this.usersEqualStateAndProps() && <h3>Has unsaved changes</h3>}

        </div>
    )
  }
}


UserConcrete = Relay.createContainer(UserConcrete, {
  initialVariables: {
    userId: null
  },

  fragments: {


// # This fragment only applies to objects of type 'Store'.
    store: () => {
      // console.log("userID " + userId)

      return Relay.QL `
      fragment ff on Store {
             id,
            userConnection(id: $userId, first: 1) {
                edges{
                  node {
                    username,
    id,
    password,
    address,
    activated
                  }
          }
       }
      }
      `

    }


  }
})

// ${User.getFragment('user')}
export default UserConcrete;

// username,
//     id,
//     password,
//     address,
//     activated
