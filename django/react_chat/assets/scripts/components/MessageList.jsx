import React from 'react';
import Message from './Message';

export default React.createClass({
  render: function() {
    let messages = []
    for (let i of '1234567890') {
      messages.push(<Message key={i} />);
    }
    return <div className="messages">{messages}</div>;
  }
});
