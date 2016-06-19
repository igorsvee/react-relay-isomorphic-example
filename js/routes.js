import React from 'react';
import {IndexRoute, Route} from 'react-router';

import StoreQueries from './queries/StoreQueries';
import ConcreteUserQueries from './queries/ConcreteUserQueries';

import Users from './components/Users.react'
import UserConcrete from './components/UserConcrete.react'
import UserApp from './components/UserApp.react';


export default (
    <Route path="/" component={UserApp} queries={StoreQueries}>
      <Route path="users" component={Users} queries={StoreQueries}/>

      <Route path="users/:userId" render={({ props }) => {
            console.log("Route props? %O ",props) ;
            // todo maybe pass flag props=exist as a prop  instead of plain text rendering 
      return props ? <UserConcrete {...props} /> : <h2>loading</h2>

      }} component={UserConcrete} queries={ConcreteUserQueries}/>
    </Route>
);

function prepareConcreteUserParams(params, route) {
  return {
    ...params,

  };
};

