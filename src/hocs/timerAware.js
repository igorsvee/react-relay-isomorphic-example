import React from 'react';
import TimerMixin from 'react-timer-mixin';


export default function (Component) {

  return React.createClass({

    mixins: [TimerMixin],

    render() {
      return (<Component {...this.props}  />)
    }
  });


};