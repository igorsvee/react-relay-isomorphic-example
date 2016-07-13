// https://github.com/denvned/isomorphic-relay-router/blob/master/examples/todo/src/renderOnServer.js
import IsomorphicRouter from 'isomorphic-relay-router';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {match} from 'react-router';
import Relay from 'react-relay';

import routes from '../src/routes';

const GRAPHQL_URL = `http://localhost:3000/graphql`;

const networkLayer = new Relay.DefaultNetworkLayer(GRAPHQL_URL);

export default (req, res, next) => {
  match({routes, location: req.url}, (error, redirectLocation, renderProps) => {
    if (error) {
      next(error);
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    } else if (renderProps) {
      // console.log("renderProps %O",renderProps)
      IsomorphicRouter.prepareData(renderProps, networkLayer).then(render, next);
    } else {  //not found
      res.status(404);
      next(new Error('Not Found'));
    }

    function render({data, props}) {
      // console.log("render data!!! %O",data)
      // console.log("render props!!! %O",props)
      const reactOutput = ReactDOMServer.renderToString(IsomorphicRouter.render(props));
      // console.log("reactOutput %O", reactOutput)
      res.render(path.resolve(__dirname, './views/index.ejs'), {
        // res.render('index', {
        preloadedData: data,
        reactOutput
      });
    }
  });
};