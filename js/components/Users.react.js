import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';

import CreateUserMutation from '../mutations/CreateUserMutation'

import User from './User.react'
import NewUser from './NewUser.react'

import autobind from 'autobind-decorator'

@autobind
class Users extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      createTransaction: null,
      errorMessage: null
    }
  }

  getUsers() {
    if (this.props.store.userConnection.edgesPaginated.length == 0) {
      return 'Empty result set'
    }

    return this.props.store.userConnection.edgesPaginated.map((edge, ind) => {
      if (edge.node.__dataID__ == null) {
        return <NewUser key={ind} user={edge.node}/>
      } else {
        return <User store={this.props.store}
                     user={edge.node}/>
      }

    })
  }

  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps this.props.store.userConnection.edgesPaginated %O next %O", this.props.store.userConnection.edgesPaginated, nextProps.store.userConnection.edgesPaginated)
  }

  //optimistic update
  shouldComponentUpdate(nextProps) {
    const currentEdges = this.props.store.userConnection.edgesPaginated;
    const lastEdge = currentEdges[currentEdges.length - 1];
    if (lastEdge.notCreated && currentEdges.length > nextProps.store.userConnection.edgesPaginated.length) {
      console.log("NOT UPDATING")
      return false;
    }

    return true;

  }

  handleSubmit(e) {
    e.preventDefault();

    const createUserMutation = new CreateUserMutation({
      username: this.refs.username.value,
      password: this.refs.password.value,
      address: this.refs.address.value,
      store: this.props.store,
      limit: this.props.relay.variables.limit,
    });

    const transaction = Relay.Store.applyUpdate(createUserMutation, {
      onFailure: (transaction) => {
        console.log("onFailure transaction %O", transaction)
        this.setState({errorMessage: transaction.getError()})
      }, onSuccess: ()=>console.log("Created!")
    });

    this.setState({createTransaction: transaction}, ()=> {
      console.log("transaction state %O", this.state.createTransaction)
    });

    transaction.commit();

    this.clearInputFields();
  }


  clearInputFields() {
    this.refs.username.value = "";
    this.refs.password.value = "";
    this.refs.address.value = "";
  }

  handleSelectLimit(e) {
    const newLimit = Number(e.target.value);
    this.props.relay.setVariables({limit: newLimit})
  }


  handleNextPage() {
    this.props.relay.setVariables({page: this.props.relay.variables.page + 1})
  }

  handlePrevPage() {
    this.props.relay.setVariables({page: this.props.relay.variables.page - 1})
  }

  getBottomControls() {
    const usersNotEmpty = this.props.store.userConnection.edgesPaginated.length != 0;
    const {hasNextPage, hasPreviousPage} = this.props.store.userConnection.pageInfoPaginated;

    return (<tfoot> { usersNotEmpty &&
    <tr>
      {hasPreviousPage && <td>
        <button onClick={this.handlePrevPage}> &larr;</button>
      </td>}
      {hasNextPage && <td>
        <button onClick={this.handleNextPage}> &rarr;</button>
      </td>}
    </tr>

    }

    </tfoot>)
  }

  render() {
    const {relay} = this.props;
    // console.log("this.props in render %O", this.props)
    const {transaction} = this.state;
    return (
        <div>
          <h2>Users
            page#{this.props.relay.variables.page} {relay.hasOptimisticUpdate(this.props.store) && 'Processing operation...'   } </h2>

          Limit: {this.props.relay.variables.limit} {this.props.relay.variables.page === 1 &&
        <select defaultValue={this.props.relay.variables.limit} onChange={this.handleSelectLimit}>
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

            {  transaction && transaction.getStatus() === 'COMMIT_FAILED' &&
            <h3>Creation failed {this.state.errorMessage}
              <button onClick={() =>  this.state.createTransaction.recommit()}>Retry</button>
            </h3>


            }


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
      return Relay.QL `
      fragment on Store {
         id
         userConnection(page: $page, limit:$limit){
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
      `


    }
  }
});

export default Users;

