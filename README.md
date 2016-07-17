# React-Relay-Example
##FEATURES:
- Pagination prev/next
- Authentication
- CRUD operations
- Routing
- Optimistic updates - don't work with isomorphic router

Usage:
-------
First run
delete "./babelRelayPlugin" from .babelrc
$ npm run schema
revert changes to babelrc
$ npm run webpack-client-dev
$ npm run server-babel

Subsequent runs:

```console
$ npm run schema
$ npm run webpack-client-dev
$ npm run server-babel
```

Then navigate to [http://localhost:3000](http://localhost:3000)

TODO:
- ~~refractor code related to the auth feature~~ 
- ~~isomorphism~~
- https
- code splitting
