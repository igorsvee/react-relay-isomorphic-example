import React from 'react';


export default function (Component) {

  const promises = [];

  return React.createClass({

    componentWillUnmount(){
      promises.forEach((promise) => {
        promise.cancel();
      })
    },

    render() {
      return (<Component cancelOnUnmount={(promise)=> promises.push(promise)}
                         {...this.props}
      />)
    }
  });


};
