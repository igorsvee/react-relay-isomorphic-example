import React from "react";
import linkState from 'react-link-state';
import Relay from 'react-relay'
import UpdateUserMutation from '../mutations/UpdateUserMutation';

import autobind from 'autobind-decorator'
import {commitUpdate, toMongoId} from '../utils/RelayUtils'
import R from'ramda';

@autobind
class UserConcrete extends React.Component {

  static propTypes = {
    userId: React.PropTypes.string.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      editMode: false,
      updateFailed: false,
      /*
       user: {
       propName1: '',
       propName2: '',
       },
       */
      user: this.editablePropNames.reduce((prev, propName)=> {
        prev[propName] = '';
        return prev
      }, {}),

    };
  }

  //  static properties don't work with ramda pick
  editablePropNames = ['username', 'address'];
  ignoredFields = ['__dataID__', '__status__', '__mutationStatus__'];

  //not using constructor intentionally
  componentWillMount() {
    //  injected from react-router
    if (this.propsContainUser()) {
      this.setUserStateFromProps(this.props)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.propsContainUser(nextProps)) {
      //  1st render with injected router props
      this.setUserStateFromProps(nextProps);
      this.componentWillReceiveProps = function (nextProps) {
        if (this.props.store.userConnection != nextProps.store.userConnection) {
          console.log("user has changed");
          this.setUserStateFromProps(nextProps)
        }
      }

    }

  }


  wasEdited() {
    const user = this.getUserFromProps();

    return this.editablePropNames.some((propName) => this.state.user[propName] != user[propName])
  }


  propsContainUser(props = this.props) {
    return props.store.userConnection.edges.length != 0
  }

  getUserContent(user) {

    const getInputField = (fieldName) => {
      return <td><input valueLink={linkState(this, `user.${fieldName}`)} ref={fieldName} type="text"/></td>
    };

    const getNormalField = (fieldName) => {
      return <td>
        {String(user[fieldName])}
      </td>
    };

    return ( <tr>
          {Object.keys(user).filter((fieldName)=> {
            return !this.ignoredFields.includes(fieldName)
          }).map((fieldName) => {
            if (this.state.editMode && this.editablePropNames.includes(fieldName)) {//  is editable and edit mode is turned on
              return getInputField(fieldName)
            } else {
              return getNormalField(fieldName);
            }
          })}
        </tr>
    );


  }

  getUserControls() {
    const getButton = ({title, clickHandler}) => <button onClick={clickHandler}>{title}</button>;

    return (
        <div>
          {
            this.state.editMode ?
                <p>
                  { getButton({
                    title: 'Cancel Changes',
                    clickHandler: this.setUserStateFromProps.bind(this, this.props)
                  })}

                  { getButton({
                    title: 'Update DB',
                    clickHandler: this.handleSaveChanges
                  })}
                </p>
                :
                getButton({
                  title: 'Edit',
                  clickHandler: this.turnOnEditMode
                })

          }
        </div>
    );


  }


  getUserFromProps(props = this.props) {
    // console.warn("props. store.userConnection.edges[0].node %O",props.store.userConnection.edges[0].node)
    return props.store.userConnection.edges[0].node;
  }

  handleSaveChanges() {
    const fieldNotChanged = (propName) => R.eqProps(propName, this.state.user, this.getUserFromProps(this.props));

    const userProps = this.getUserFromProps();

    //  won't change, using it
    const id = userProps.id;

    // if user has edited the prop then use edited version of it, otherwise use an old value for the prop
    const extractedProps = {};
    this.editablePropNames.reduce((prev, fieldName) => {
      prev[fieldName] = fieldNotChanged(fieldName) ? userProps[fieldName] : this.state.user[fieldName];
      return prev;

    }, extractedProps);

    const updateMutation = new UpdateUserMutation(
        {
          id,
          storeId: this.props.store.id,
          ...extractedProps
        }
    );

    commitUpdate(Relay.Store, updateMutation)
        .then((resp)=>this.setState({updateFailed: false}))
        .catch(()=> this.setState({updateFailed: true}))
        .finally(this.turnOffEditMode)

    ;
  }

  turnOnEditMode = this._setStateAndCb.bind(this, undefined, {editMode: true});
  turnOffEditMode = this._setStateAndCb.bind(this, undefined, {editMode: false});

  _setStateAndCb(cb, state) {
    const thisFunc = this._setStateAndCb;
    if (arguments.length < this._setStateAndCb.length) {
      return thisFunc.bind(this, ...arguments)
    } else {
      this.setState({...state}, cb)
    }
  }

  setUserStateFromProps(props) {
    const setStateAndTurnOffEditMode = this._setStateAndCb(this.turnOffEditMode);

    const buildUserState = (obj)=> {
      return {
        user: {
          ...obj
        }
      }
    };


    return R.compose(setStateAndTurnOffEditMode, buildUserState, R.pick(this.editablePropNames), this.getUserFromProps)(props)
  } ;

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
              {Object.keys(user).filter((fieldName) => {
                return !this.ignoredFields.includes(fieldName)
              })
                  .map((fieldName) => {

                    return <td>
                      {fieldName}
                    </td>
                  })
              }
            </tr>

            {this.getUserContent(user)}


          </table>

          {this.getUserControls()}

          {relay.hasOptimisticUpdate(store) && <h2>Updating...</h2>}
          {this.wasEdited() && <h3>Has unsaved changes</h3>}
          {this.state.updateFailed && <strong>Update failed</strong>}
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
    store: (obj) => {
      console.log("obj %O", obj)

      return Relay.QL `
      fragment ff on Store {
             id,
           userConnection: userConnectionPaginated(id: $userId) {
               edges: edgesPaginated{
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
