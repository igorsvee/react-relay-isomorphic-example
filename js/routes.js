import React from 'react';
import {IndexRoute, Route} from 'react-router';

import StoreQueries from './queries/StoreQueries';
import ConcreteUserQueries from './queries/ConcreteUserQueries';

import Users from './components/Users.react'
// import RWD from './components/RWD.react'
import UserConcrete from './components/UserConcrete.react'
import UserApp from './components/UserApp.react';


export default (
    <Route path="/" component={UserApp}>

      <Route path="users" component={Users} queries={StoreQueries}/>


      <Route path="users/:userId"
             render={({ props ,routerProps}) => {
      return props ? <UserConcrete {...props} />  : <h3>Loading user...</h3>  }   }
             component={UserConcrete} queries={ConcreteUserQueries}/>


    </Route>
);




