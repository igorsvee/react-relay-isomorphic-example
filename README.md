# React-Relay-Isomorphic-Example
##FEATURES:
- Pagination prev/next
- Authentication
- CRUD operations
- Routing
- Optimistic updates - stopped working since isomorphic

Usage:
-------
First run
delete "./babelRelayPlugin" from .babelrc and 
```
$ npm run schema
```
revert the changes and
```
$ npm run webpack-client-dev
$ npm run server-babel
```

For subsequent runs:

```console
$ npm run schema
$ npm run webpack-client-dev
$ npm run server-babel
```

Then navigate to [http://localhost:3000](http://localhost:3000)

TODO:
- Fix mutations on the client side to avoid force fetching
- ~~refractor code related to the auth feature~~ 
- ~~isomorphism~~
- https
- code splitting
