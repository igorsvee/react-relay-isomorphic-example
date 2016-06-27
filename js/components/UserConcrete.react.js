import React from "react";
import linkState from 'react-link-state';
import Relay from 'react-relay'
import UpdateUserMutation from '../mutations/UpdateUserMutation';
import  {

    fromGlobalId,

} from 'graphql-relay'
import autobind from 'autobind-decorator'
import {commitUpdate} from '../utils/RelayUtils'
@autobind
class UserConcrete extends React.Component {

  static propTypes = {
    userId: React.PropTypes.string.isRequired,
  } ;

  constructor(props, context) {
    super(props, context);

    this.state = {
      editMode: false,
      username: '',
      address: ''
    };

  }

  //todo not using constructor intentionally
  componentWillMount() {
    //  injected from react-router
    if (this.propsContainUser()) {
      this.updateUserStateFromProps()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.propsContainUser(nextProps)) {
      //  1st render with injected router props
      this.updateUserStateFromProps(nextProps)
      this.componentWillReceiveProps = function (nextProps) {
        if (this.props.store.userConnectionPaginated != nextProps.store.userConnectionPaginated) {
          console.log("user has changed ")
          this.updateUserStateFromProps(nextProps)
        }
      }

    }

  }

  userWasEdited() {
    const user = this.getUserFromProps();
    return this.state.username != user.username || this.state.address != user.address
  }

  turnOnEditMode() {
    this.setState({
      editMode: true
    })
  }

  propsContainUser(props = this.props) {
    return props.store.userConnectionPaginated.edgesPaginated.length != 0
  }

  getUserContent(user) {
    const idCell = (    <td>
      {fromGlobalId(user.id).id}
    </td>);

    if (this.state.editMode) {
      return (<tr>
        {idCell}
        <td>
          <input valueLink={linkState(this, 'username')} ref="username" type="text"/>
        </td>
        <td>
          <input valueLink={linkState(this, 'address')} ref="address" type="text"/>
        </td>
      </tr>)
    } else {
      return (<tr>
        {idCell}
        <td>
          {user.username}
        </td>
        <td>
          {user.address}
        </td>
      </tr>)
    }


  }

  getUserControls() {
    if (this.state.editMode) {
      return (
          <tr>
            <td>
              &nbsp;
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
    return this.state[propName] !== this.getUserFromProps()[propName]
  }

  getUserFromProps(props = this.props) {
    return props.store.userConnectionPaginated.edgesPaginated[0].node;
  }

  handleSaveChanges() {
    const userStore = this.getUserFromProps();

    //  won't change, using it
    const id = userStore.id;

    const username = this.propertyChanged('username') ? this.state.username : userStore.username;
    const address = this.propertyChanged('address') ? this.state.address : userStore.address;

    console.log("Update user %O...", {username, address, id});

    const updateMutation = new UpdateUserMutation(
        {
          username, id, address
          , storeId: this.props.store.id
        }
    );

    commitUpdate(Relay.Store, updateMutation)
        .then((resp)=>console.log("Updated successfully!"))
        .catch((transaction) =>console.log("Failed update"))

    this.turnOffEditMode();
  }

  turnOffEditMode() {
    this.setState({editMode: false});
  }

  updateUserStateFromProps(props = this.props) {
    const user = this.getUserFromProps(props);

    this.setState({
      username: user.username,
      address: user.address
    })
  }

  handleCancelChanges() {
    this.updateUserStateFromProps();
    this.turnOffEditMode();
  }


  render() {
    if (!this.propsContainUser()) {
      return <h3>No user with id #{this.props.userId} found</h3>
    }

    const {relay, store} = this.props;

    const user = this.getUserFromProps();

    return (
        <div>
          <h1>Concrete page for {user.username}:</h1>
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

            {this.getUserContent(user)}

            {this.getUserControls()}

          </table>

          {relay.hasOptimisticUpdate(store) && <h2>Updating...</h2>}
          {this.userWasEdited() && <h3>Has unsaved changes</h3>}

        </div>
    )
  }
}


UserConcrete = Relay.createContainer(UserConcrete, {
  initialVariables: {
    userId: null
  },

  fragments: {

    // console
// # This fragment only applies to objects of type 'Store'.
    store: (obj) => {
      console.log("obj %O", obj)

      return Relay.QL `
      fragment ff on Store {
             id,
            userConnectionPaginated(id: $userId) {
                edgesPaginated{
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

export default UserConcrete;
