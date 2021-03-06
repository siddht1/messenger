import 'babel-core/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { history } from 'react-router/lib/BrowserHistory';
import { reduxRouteComponent } from 'redux-react-router';
import createStore from 'app/utils/createStore';
import createPushClient from 'app/utils/createPushClient';
import App from 'app/containers/App';

const store = createStore();
const pushClient = createPushClient('/realtime', store);
const ReduxRouteComponent = reduxRouteComponent(store);
const app = (
  <App
    ReduxRouteComponent={ReduxRouteComponent}
    history={history}
  />
);

ReactDOM.render(app, document.getElementById('root'));

window.app = {
  store,
  pushClient,
};
