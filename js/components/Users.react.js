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
    return this.props.store.userConnection.edgesPaginated.map((edge) => <User store={this.props.store}
                                                                              user={edge.node}/>)
  }

  handleSubmit(e) {
    e.preventDefault();

    // const user = {
    //   username: this.refs.username.value,
    //   password: this.refs.password.value,
    //   address: this.refs.address.value,
    //   //parent
    //   store: this.props.store
    // };
       console.log("this.props.store  submit:%O ",this.props.store)
    // console.log("creating... %O", user);
    Relay.Store.commitUpdate(new CreateUserMutation({
      username: this.refs.username.value,
      password: this.refs.password.value,
      address: this.refs.address.value,
      store:this.props.store
    }));
    // new UpdateUserMutation(
    //     {
    //       username, id, address
    //       , storeId: this.props.store.id
    //       , userBeforeUpdate
    //     }
    // )
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
    // console.log(this.props.relay.getPendingTransactions(this.props.store.userConnection.edgesPaginated));


  }

  componentWillReceiveProps(nextProps) {
    // console.log("this.props.store.userConnection %O", this.props.store.userConnection)
    // console.log("this.props %O, nextProps %O", this.props, nextProps)
    // console.log("this.props.store.userConnection.edgesPaginated.length %s nextProps.store.userConnection.edgesPaginated.length %s", this.props.store.userConnection.edgesPaginated.length, nextProps.store.userConnection.edgesPaginated.length)
  }

  handleNextPage() {
    this.props.relay.setVariables({page: this.props.relay.variables.page + 1})
  }

  handlePrevPage() {
    this.props.relay.setVariables({page: this.props.relay.variables.page - 1})
  }

  getBottomControls() {
    const usersNotEmpty = this.props.store.userConnection.edgesPaginated.length == 0;
    const {hasNextPage, hasPreviousPage} = this.props.store.userConnection.pageInfoPaginated;
    console.log("this.props.store.userConnection.pageInfoPaginated %O ",this.props.store.userConnection.pageInfoPaginated)
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

          Limit: {this.props.relay.variables.limit} {this.props.relay.variables.page === 1 && <select defaultValue={this.props.relay.variables.limit}  onChange={this.handleSelectLimit}>
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
console
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
    store: () => {
      const query = Relay.QL `
      fragment on Store {
         id
         userConnection(page: $page, records:$limit){
            pageInfoPaginated{
           hasNextPage,hasPreviousPage
         },
            edgesPaginated{
                 node{
                   ${User.getFragment('user')}
                 } 
                 
             }
          
         }
         
      }
      `;

      console.log("query ,%O", query)
      return query


    }
  }
});

export default Users;

