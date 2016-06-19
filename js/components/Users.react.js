import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';

import CreateUserMutation from '../mutations/CreateUserMutation'

import User from './User.react'

class Users extends React.Component {

  constructor(props) {
    super(props);

    this.renderUsers = this.renderUsers.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.clearInputFields = this.clearInputFields.bind(this);

  }

  renderUsers() {
    return this.props.store.userConnection.edges.map((edge) => {

      return (
          <User  store={this.props.store} user={edge.node}/>
      )
    })
  }

  handleSubmit(e) {
    e.preventDefault();

    const user = {
      username: this.refs.username.value,
      password: this.refs.password.value,
      address: this.refs.address.value,
      //parent
      store: this.props.store
    };
    
    console.log("creating... %O",user)
    Relay.Store.commitUpdate(
        new CreateUserMutation(user)
    );

    this.clearInputFields();
  }

  clearInputFields() {
    this.refs.username.value = "";
    this.refs.password.value = "";
    this.refs.address.value = "";
  }

  render() {
    const {relay} = this.props;

    return (
        <div>
          <h2>Users</h2>
          {relay.hasOptimisticUpdate(this.props.store) && <h2>Creating...</h2>}
          <form onSubmit={this.handleSubmit}>
            <input ref="username" type="text" placeholder="username"/>
            <input ref="password" type="text" placeholder="pass"/>
            <input ref="address" type="text" placeholder="address"/>
            <button type="submit">Create</button>
          </form>

          <table>
            <thead>
            <tr >
              <th>
                id
              </th>

              <th>
                username
              </th>

              <th>
                address
              </th>
            </tr>
            </thead>
            <tbody>
            {this.renderUsers()}
            </tbody>

          </table>
        </div>
    )
  }
}

Users = Relay.createContainer(Users, {
  initialVariables: {
    limit: 100 //todo find out why it hardcodes
    , query: ''//todo find out why it hardcodes
  },
  //  todo a store fragment will give us this.props.-> store <- this store prop

  fragments: {
    // and every fragment is a funtion that return a graphql query

    //  todo this.props. store (fragment ignored and then ) .  linkConnection
    //  read the global id from the store bc mutation is using it
    store: () => Relay.QL `
 
      fragment on Store {
      id,
         userConnection(first: $limit){
            edges{
                 node{
                   ${User.getFragment('user')}
                 } 
             }
          
         }
      }
      `
  }
});

export default Users;

