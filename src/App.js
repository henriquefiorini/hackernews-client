import React, { Component } from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import {
  Header,
  CreateLink,
  LinkList,
  Login,
  Search,
} from './components';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="center w85">
          <Header />
          <div className="ph3 pv1 background-gray">
            <Switch>
              <Route exact path="/" render={() => <Redirect to="/new/1" />} />
              <Route exact path="/new/:page" component={LinkList} />
              <Route exact path="/top" component={LinkList} />
              <Route exact path="/search" component={Search} />
              <Route exact path="/create" component={CreateLink} />
              <Route exact path="/login" component={Login} />
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
