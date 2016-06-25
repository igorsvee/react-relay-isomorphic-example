import React from 'react';
import {IndexRoute, Route} from 'react-router';

import StoreQueries from './queries/StoreQueries';
import ConcreteUserQueries from './queries/ConcreteUserQueries';

import Users from './components/Users.react'
import UserConcrete from './components/UserConcrete.react'
import UserApp from './components/UserApp.react';

// render={({ props ,routerProps}) => {
//   console.log('Route path="users" props? %O ',props) ;
//   console.log('Route path="users" routerProps? %O ',routerProps) ;
//
//   return <Users {...props} />
// }}
export default (
    <Route path="/" component={UserApp} queries={StoreQueries}>

      <Route path="users" component={Users} queries={StoreQueries}/>

      <Route path="users/:userId"
             render={({ props ,routerProps}) => {
            console.log('path="users/:userId" props? %O ',props) ;
            console.log('path="users/:userId"routerProps props? %O ',routerProps) ;
      return <UserConcrete {...props} /> }}
             component={UserConcrete} queries={ConcreteUserQueries}/>


    </Route>
);

function prepareConcreteUserParams(params, route) {
  return {
    ...params,

  };
};

