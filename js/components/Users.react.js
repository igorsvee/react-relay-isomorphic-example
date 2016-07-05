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
      errorMessage: null,
      paginationError: null
    }
  }

  afterDelete() {
    const {limit, page} = this.props.relay.variables;
    if (limit == 1 && page > 1) {
      this.handlePrevPage();
    }
  }

  getUsers() {
    if (!this.hasUsers()) {
      return <tr>
        <td>Empty result set</td>
      </tr>
    }

    return this.props.store.userConnection.edges.map((edge, ind) => {
      if (!edge.node.__dataID__) {// newly created node by optimistic mutation would not have this property
        return <NewUser key={ind} user={edge.node}/>
      } else {
        return <User store={this.props.store} afterDelete={this.afterDelete}
                     user={edge.node}/>
      }

    })
  }

  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps this.props.store.userConnection.edges  %O next %O", this.props.store.userConnection.edges, nextProps.store.userConnection.edges)
  }

  //optimistic update
  shouldComponentUpdate(nextProps) {
    if (this.hasUsers()) {
      const currentEdges = this.props.store.userConnection.edges;
      const currentLastEdge = currentEdges[currentEdges.length - 1];
      const nextEdges = nextProps.store.userConnection.edges;

      if (currentLastEdge.optimistic && currentEdges.length > nextEdges.length) {
        console.log("NOT Rerendering Users");
        return false;
      }
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

    const setEmptyErrorMessage = this._setErrorMessage.curry(null);

    const transaction = Relay.Store.applyUpdate(createUserMutation,
        {
          onFailure: transaction => this._setErrorMessage(transaction.getError())
          , onSuccess: setEmptyErrorMessage
        });
    transaction.commit();

    this.setState({createTransaction: transaction}, this.clearInputFields);
  }

  _setErrorMessage(message) {
    this.setState({errorMessage: message})
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

  setRelayVariablesAndProcessReadyState = this._setRelayVariablesAndCb.curry(this._processReadyState);

  handleNextPage() {
    this.setRelayVariablesAndProcessReadyState({page: this.props.relay.variables.page + 1})
  }

  handlePrevPage() {
    this.setRelayVariablesAndProcessReadyState({page: this.props.relay.variables.page - 1})
  }

  hasUsers() {
    return this.props.store.userConnection.edges.length != 0;
  }

  getBottomControls() {
    if (!this.hasUsers()) {
      return null;
    }

    const {hasNextPage, hasPreviousPage} = this.props.store.userConnection.pageInfo;

    return (
        <tr>
          {hasPreviousPage && <td>
            <button onClick={this.handlePrevPage}> &larr;</button>
          </td>}
          {hasNextPage && <td>
            <button onClick={this.handleNextPage}> &rarr;</button>
          </td>}
        </tr>
    )
  }

  _setRelayVariablesAndCb(cb, state) {
    this.props.relay.setVariables({...state}, cb)
  }

  _processReadyState(readyState) {
    if (readyState.error) {
      this.setState({paginationError: readyState.error.message})
    }
  }

  render() {
    const {relay, store} = this.props;
    const {createTransaction} = this.state;

    const currentPage = relay.variables.page;
    const currentLimit = relay.variables.limit;
    return (
        <div>
          <h2>Users

            page#{currentPage} {relay.hasOptimisticUpdate(store) && 'Processing operation...'   } </h2>

          Limit: {currentLimit} {currentPage === 1 &&
        <select defaultValue={currentLimit} onChange={this.handleSelectLimit}>
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

                { /*
                 [RelayMutationQueue] access transactions after callback has been called #1221

                 {  createTransaction && createTransaction.getStatus() === 'COMMIT_FAILED' &&
                 <h3>Creation failed {this.state.errorMessage}
                 <button onClick={() =>  createTransaction.recommit()}>Retry</button>
                 </h3>
                 }

                 */}


          </form>

          <table>

            <thead>
            <tr key="head">
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

            <tfoot>
            {this.getBottomControls()}
            </tfoot>
          </table>

                 {this.state.paginationError && <h3>{this.state.paginationError}</h3>}

        </div>
    )
  }
}

Users = Relay.createContainer(Users, {
  initialVariables: {
    limit: 999,
    page: 1
  },

  fragments: {
    // and every fragment is a function that return a graphql query
    //  read the global id from the store bc mutation is using it
    store: () => {
      return Relay.QL `
      fragment on Store {
         id
       userConnection: userConnectionPaginated(page: $page, limit:$limit){
           pageInfo: pageInfoPaginated{
              hasNextPage,hasPreviousPage
            },
           edges: edgesPaginated{
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

