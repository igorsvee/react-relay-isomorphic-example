import React from "react";
import linkState from 'react-link-state';
import Relay from 'react-relay'
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

  }

  //todo not using constructor intentionally
  componentWillMount() {
    //  injected from react-router
    if (this.hasRequiredPropsFromRouter() && this.propsContainUser()) {
      this.updateUserStateFromProps()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.hasRequiredPropsFromRouter() && this.propsContainUser(nextProps)) {
      //  1st render with injected router props
      this.updateUserStateFromProps(nextProps)
      this.componentWillReceiveProps = function (nextProps) {
        if (this.hasRequiredPropsFromRouter() && (this.props.store.userConnection != nextProps.store.userConnection)) {
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

  hasRequiredPropsFromRouter() {
    return this.props.userId != null;
  }

  propsContainUser(props = this.props) {
    return props.store.userConnection.edgesPaginated.length != 0
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
    return this.state[propName] !== this.getUserFromProps(this.props)[propName]
  }

  getUserFromProps(props = this.props) {
    return props.store.userConnection.edgesPaginated[0].node;
  }


  handleSaveChanges() {
    const username = this.propertyChanged('username') ? this.state.username : undefined;
    const address = this.propertyChanged('address') ? this.state.address : undefined;

    const userInStore = this.getUserFromProps();

    //  won't change, using it
    const id = userInStore.id;

    //  for optimistic comparison
    const userBeforeUpdate = {id, username: userInStore.username, address: userInStore.address}

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

  updateUserStateFromProps(props = this.props) {
    const user = this.getUserFromProps(props);
    const {username, address} = user;

    this.setState({
      username,
      address
    })
  }

  handleCancelChanges() {
    this.updateUserStateFromProps();
    this.turnOffEditMode();
  }


  render() {
    if (!this.hasRequiredPropsFromRouter()) {
      return <h1>Loading...</h1>
    }

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
            userConnection(id: $userId) {
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

// ${User.getFragment('user')}
export default UserConcrete;
//
// username,
//     id,
//     password,
//     address,
//     activated
