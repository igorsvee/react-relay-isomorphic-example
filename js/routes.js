import React from 'react';
import {IndexRoute, Route} from 'react-router';

import StoreQueries from './queries/StoreQueries';
import ConcreteUserQueries from './queries/ConcreteUserQueries';

import Users from './components/Users.react'
// import RWD from './components/RWD.react'
import UserConcrete from './components/UserConcrete.react'
import RouteLoading from './components/RouteLoading.react'
import UserApp from './components/UserApp.react';


export default (
    <Route path="/" component={UserApp}>

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
               const userId = routerProps.routeParams.userId;
               if (error) {

                 const errorMessage = `Failed to load user #${userId}. Reason: ${error.message}` ;
                 return <RouteLoading message={errorMessage}/>
               }


               const loadingMessage = `Loading user #${userId} ...`;
               return props ? <UserConcrete {...props} /> : <RouteLoading message={loadingMessage}/>
             }  }

             component={UserConcrete} queries={ConcreteUserQueries}/>


    </Route>
);




