import React from 'react';
import {IndexRoute, Route} from 'react-router';

import StoreQueries from './queries/StoreQueries';
import ConcreteUserQueries from './queries/ConcreteUserQueries';

import Users from './components/Users.react'
// import RWD from './components/RWD.react'
import UserConcrete from './components/UserConcrete.react'
import RouteLoading from './components/RouteLoading.react'
import UserApp from './components/UserApp.react';
import Login from './components/Login.react'

async function prepareUsersParams(params) {
  var query = Relay.createQuery(Relay.QL`query qqq {  store { sessionId  }  } `, {});

  const promise = new Promise((resolve, reject)=> {
    Relay.Store.primeCache({query}, readyState => {
      if (readyState.done) {
        // When all data is ready, read the data from the cache:
        const data = Relay.Store.readQuery(query)[0];
        resolve(data)
      }
    });
  })

  const data = await promise;
  const sessionId = data.sessionId;
  console.log("prepareUsersParams data  : %O", data) ;
  console.log("prepareUsersParams params :%O", params) ;


  return {
    ...params,
    sessionId,
  };
}
//     prepareParams={prepareUsersParams}
export default (
    <Route path="/" component={UserApp} queries={StoreQueries}>

      <Route path="login" component={Login}  queries={StoreQueries}/>

      <Route path="users"
             render={({props, error}) => {
               if (error) {
                 const errorMessage = `Failed to load users. Reason: ${error.message}`;
                 return <RouteLoading message={errorMessage}/>
               }

               return props ? <Users {...props} /> : <RouteLoading message="Loading users..."/>
             }  }


             component={Users} queries={StoreQueries}/>

      <Route path="users/:userId"
             render={({props, routerProps, error}) => {
               const userId = routerProps.routeParams.sessionId;
               if (error) {
                 const errorMessage = `Failed to load user #${userId}. Reason: ${error.message}`;
                 return <RouteLoading message={errorMessage}/>
               }


               const loadingMessage = `Loading user #${userId} ...`;
               return props ? <UserConcrete {...props} /> : <RouteLoading message={loadingMessage}/>
             }  }

             component={UserConcrete} queries={ConcreteUserQueries}/>


    </Route>
);




