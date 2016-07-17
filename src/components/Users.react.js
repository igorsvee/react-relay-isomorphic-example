import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';

import CreateUserMutation from '../mutations/CreateUserMutation'

import User from './User.react'
import NewUser from './NewUser.react'

import autobind from 'autobind-decorator'
// import {withRouter} from 'react-router'

import {setRelayVariables, forceFetch} from'../utils/RelayUtils'
@autobind
class Users extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      createTransaction: null,
      errorMessage: null,
      paginationError: null
    };

  }


  componentWillMount() {
    // this.forceFetchIfRequired();
    console.log("Users componentWillMount this.props %O ", this.props)

    if (this.isAuthenticated()) {
      this._setRelayVariables({
        isAuthenticated: true,
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log("Users componentWillReceiveProps this.props %O next %O", this.props, nextProps);
    // if(this.props.flag != nextProps.flag){
    //   console.warn("AUTHENTICATION FLAG CHANGED");
    //   this.props.relay.forceFetch({flag: nextProps.flag})
    // }
    const thisSessionId = this.getSessionIdFromProps(this.props);
    const nextSessionId = this.getSessionIdFromProps(nextProps);
    // console.log("UserApp componentWillReceiveProps this.props %O nextProps", this.props, nextProps)
    if (thisSessionId != nextSessionId) {
      this.props.relay.setVariables({
        isAuthenticated: nextSessionId != null,
      })
    }

  }

  _setRelayVariables = setRelayVariables.curry(this.props.relay);

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

    const forceFetchUsers = forceFetch.curry(this.props.relay);

    return this.props.store.userConnection.edges.map((edge) => {
      if (!edge.node.__dataID__) {// newly created node by optimistic mutation would not have this property
        return <NewUser key={edge.node.username} user={edge.node}/>
      } else {
        return <User
            key={edge.node.id} forceFetch={forceFetchUsers}
            store={this.props.store}
            afterDelete={this.afterDelete}
            sessionId={this.props.store.sessionId}
            user={edge.node}/>
      }

    })
  }


  isAuthenticated() {
    return this.getSessionIdFromProps(this.props) != null;
  }

  getSessionIdFromProps(props) {
    return props.store.sessionId
  }

  //optimistic update
  shouldComponentUpdate(nextProps) {
    if (this.isAuthenticated() && this.hasUsers() && this.hasUsers(nextProps)) {
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
    this.props.relay.forceFetch();
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

  handleNPage(n) {
    return ()=> {
      this.setRelayVariablesAndProcessReadyState({page: n})
    }
  }

  hasUsers(props = this.props) {
    return props.store.userConnection && props.store.userConnection.edges && props.store.userConnection.edges.length != 0;
  }

  getBottomControls() {
    if (!this.isAuthenticated() || !this.hasUsers()) {
      return null;
    }

    const {hasNextPage, hasPreviousPage, totalNumPages} = this.props.store.userConnection.pageInfoPaginated;

    let getButtonForPage = (_, ind) => {
      const page = ind + 1;
      return (<button disabled={this.props.relay.variables.page === page ? "disabled" : "" }
                      key={page}
                      onClick={this.handleNPage(page)}>{page}</button>    )
    };

    return (
        <div>
          {hasPreviousPage &&
          <button onClick={this.handlePrevPage}> &larr;</button>
          }
          {hasNextPage &&
          <button onClick={this.handleNextPage}> &rarr;</button>

          }
          <div>
            <h4>TOTAL: {totalNumPages}</h4>   {Array(totalNumPages).fill(null).map(getButtonForPage)}
          </div>
        </div>
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
    const isAuthenticated = relay.variables.isAuthenticated;

    return (
        <div>
          <h2>Users

            page#{currentPage} {relay.hasOptimisticUpdate(store) && 'Processing operation...'   } </h2>

          {this.isAuthenticated() && <p>Limit: {currentLimit}
            {currentPage === 1 &&
            <select defaultValue={currentLimit} onChange={this.handleSelectLimit}>
              <option value="1">1</option>
              <option value="3">3</option>

              <option value="999">999</option>
            </select>   }
          </p>
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

          {isAuthenticated ?
              <table>

                <thead key="thead">
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


                <tbody key="tbody">
                {this.getUsers()}
                </tbody>


              </table>

              : 'Please log in to see the users or create one first'
          }
          {this.getBottomControls()}

          {this.state.paginationError && <h3>{this.state.paginationError}</h3>}

        </div>
    )
  }
}

Users = Relay.createContainer(Users, {
  initialVariables: {
    limit: 999,
    page: 1,
    isAuthenticated: false //  transient field, based on sessionId fetched by the container
  },

  fragments: {
    store: () => Relay.QL `
      fragment on Store {
         id,
          sessionId,
          userConnection (page: $page, limit:$limit) @include(if: $isAuthenticated) {
            pageInfo{ hasNextPage, hasPreviousPage  },
            pageInfoPaginated (page: $page, limit:$limit)  { hasNextPage, hasPreviousPage , totalNumPages },
            
            edges{
              node{
              id ,
              ${User.getFragment('user')}
              }, cursor
                 
          }
          
         }
         
      }
      `
  }
});

export default Users;

