import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route, Router , Redirect } from "react-router-dom";
import createBrowserHistory from "history/createBrowserHistory";

import GithubAPI from './components/MainComponent/GithubAPI';

const history = createBrowserHistory();
const Root = document.getElementById("root");
if (Root === null) {
    throw new Error("Error")
}

ReactDOM.render(
    <Router history={history}>
        <Switch>
            <Route exact path="/">
                <Redirect to="/home"/>
            </Route>
            <Route path="/home" component={GithubAPI} />
        </Switch>
    </Router>,
    Root
);

