import React from "react";
import ReactDOM from "react-dom";
import Relay from 'react-relay'
// import applyRouterMiddleware from 'react-router-apply-middleware'
import {useRouterHistory,Router,applyRouterMiddleware, hashHistory} from 'react-router';
// import {RelayRouter} from 'react-router-relay';

import routes from './routes';
import useRelay from 'react-router-relay';

import createHashHistory from 'history/lib/createHashHistory';

Relay.injectNetworkLayer(
    new Relay.DefaultNetworkLayer('http://localhost:3000/graphql', {
      credentials: 'same-origin',
    })
);

const history = useRouterHistory(createHashHistory)({queryKey: false});

const container = document.createElement('div');
document.addEventListener("DOMContentLoaded", function () {

  document.body.appendChild(container);

  ReactDOM.render(
      <Router history={history}
              routes={routes}
              render={applyRouterMiddleware(useRelay)}
              environment={Relay.Store}
      />,
      container
  );

});

