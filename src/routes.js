import React from 'react';
// import {IndexRoute, Route} from 'react-router';
//
import StoreQueries from './queries/StoreQueries';
import ConcreteUserQueries from './queries/ConcreteUserQueries';
//
import Users from './components/Users.react'
// import RWD from './components/RWD.react'
import UserConcrete from './components/UserConcrete.react'
import RouteLoading from './components/RouteLoading.react'
//
import UserApp from './components/UserApp.react';
import Login from './components/Login.react'

import WhenNoChildrenRoot from './components/WhenNoChildrenRoot.react'
// const rootRoute = {
//   path: '/',

// getChildRoutes(location, callback) {
//   require.ensure([], function (require) {
//     callback(null, [
//       require('./routes/LoginRoute').default
//       // , require('./routes/UnauthorizedRoute').default
//       // , require('./routes/UsersRoute').default
//       // , require('./routes/SendsRoute').default
//       // , require('./routes/NewUserRoute').default
//       // , require('./routes/NoMatchRoute').default
//     ])
//   })
// },


// // getIndexRoute(location, callback) {
// //   require.ensure([], function (require) {
// //     callback(null, {
// //       component: require('./components/WhenNoChildrenRoot.react').default
// //     })
// //   })
// // },

//   getComponents(location, callback) {
//     require.ensure([], function (require) {
//       callback(null, require('./components/User.react').default)
//     })
//   }
// };

export default [
  {
    path: '/',

    component: UserApp,
    queries: StoreQueries,
    indexRoute: {
      component: WhenNoChildrenRoot,
      // queries: StoreQueries,
      // prepareParams: () => ({status: 'any'}),
    },
    childRoutes: [
      {
        path: 'login',
        component: Login,
        queries: StoreQueries,
      },
      {
        path: 'users',
        component: Users,
        queries: StoreQueries,
      },

      {
        path: 'users/:userId',
        component: UserConcrete,
        queries: ConcreteUserQueries,
      },
    ],
  },
];


// export default (
//     <Route path="/" component={UserApp} queries={StoreQueries}>
//
//       <Route path="login" component={Login}  queries={StoreQueries}/>
//
//       <Route path="users"
//              render={({props, error}) => {
//                if (error) {
//                  const errorMessage = `Failed to load users. Reason: ${error.message}`;
//                  return <RouteLoading message={errorMessage}/>
//                }
//
//                return props ? <Users {...props} /> : <RouteLoading message="Loading users..."/>
//              }  }
//
//
//              component={Users} queries={StoreQueries}/>
//
//       <Route path="users/:userId"
//              render={({props, routerProps, error}) => {
//                const userId = routerProps.routeParams.sessionId;
//                if (error) {
//                  const errorMessage = `Failed to load user #${userId}. Reason: ${error.message}`;
//                  return <RouteLoading message={errorMessage}/>
//                }
//
//
//                const loadingMessage = `Loading user #${userId} ...`;
//                return props ? <UserConcrete {...props} /> : <RouteLoading message={loadingMessage}/>
//              }  }
//
//              component={UserConcrete} queries={ConcreteUserQueries}/>
//
//
//     </Route>
// );




