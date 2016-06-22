import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';

import CreateUserMutation from '../mutations/CreateUserMutation'

import User from './User.react'

import autobind from 'autobind-decorator'

@autobind
class Users extends React.Component {

  constructor(props, context) {
    super(props, context);
  }

  getUsers() {
    return this.props.store.userConnection.edges.map((edge) => <User store={this.props.store}
                                                                              user={edge.node}/>)
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

    console.log("creating... %O", user);
    Relay.Store.commitUpdate(new CreateUserMutation(user));

    this.clearInputFields();
  }

  clearInputFields() {
    this.refs.username.value = "";
    this.refs.password.value = "";
    this.refs.address.value = "";
  }

  handleSelectLimit(e) {
    const newLimit = Number(e.target.value);
    console.log("new newLimit: " + newLimit)
    this.props.relay.setVariables({limit: newLimit}, (obj) => {
      console.log("current: %O", obj)

    })
    // console.log(this.props.relay.getPendingTransactions(this.props.store));
    // console.log(this.props.relay.getPendingTransactions(this.props.store.userConnection));
    // console.log(this.props.relay.getPendingTransactions(this.props.store.userConnection.edges));


  }

  componentWillReceiveProps(nextProps) {
    console.log("this.props %O, nextProps %O", this.props, nextProps)
    console.log("this.props.store.userConnection.edges.length %s nextProps.store.userConnection.edges.length %s", this.props.store.userConnection.edges.length, nextProps.store.userConnection.edges.length)
  }

  handleNextPage() {
    this.props.relay.setVariables({page: this.props.relay.variables.page + 1})
  }

  handlePrevPage() {
    this.props.relay.setVariables({page: this.props.relay.variables.page - 1})
  }

  getBottomControls() {
    const usersNotEmpty = this.props.store.userConnection.edges.length == 0;
    const {hasNextPage, hasPreviousPage} = this.props.store.userConnection.pageInfo;
    //
    return (<tfoot>
    <tr>
      {hasPreviousPage && <td>
        <button onClick={this.handlePrevPage}> &larr;</button>
      </td>}
      {hasNextPage && <td>
        <button onClick={this.handleNextPage}> &rarr;</button>
      </td>}
    </tr>

    </tfoot>)
  }

  render() {
    const {relay} = this.props;
    // console.log("this.props in render %O", this.props)
    return (
        <div>
          <h2>Users
            page#{this.props.relay.variables.page} {relay.hasOptimisticUpdate(this.props.store) && 'Processing operation...'   } </h2>

          Limit: {this.props.relay.variables.limit} {this.props.relay.variables.page === 1 && <select defaultValue="999" onChange={this.handleSelectLimit}>
          <option value="1">1</option>
          <option value="3">3</option>

          <option value="999">999</option>
        </select>
        }

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
              <th>
                activated?
              </th>
            </tr>
            </thead>
            <tbody>
            {this.getUsers()}

            </tbody>

            {this.getBottomControls()}

          </table>

        </div>
    )
  }
}
// console
Users = Relay.createContainer(Users, {

  initialVariables: {
    limit: 999,
    page: 1
  },
  //  todo a store fragment will give us this.props.-> store <- this store prop

  fragments: {
    // and every fragment is a function that return a graphql query

    //  todo this.props. store (fragment ignored and then ) .  linkConnection
    //  read the global id from the store bc mutation is using it
    store: () => Relay.QL `
      fragment on Store {
         userConnection(page: $page, records:$limit){
        pageInfo{
           hasNextPage,hasPreviousPage
         },
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

