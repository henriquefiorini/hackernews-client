import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { AUTH_TOKEN } from '../constants';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      token
    }
  }
`;

class Login extends Component {
  state = {
    login: true,
    email: '',
    password: '',
    name: '',
  }

  handleChange = e => {
    const { name, type } = e.target;
    const value = type === 'number'
      ? parseFloat(e.target.value)
      : e.target.value;
    this.setState({
      [name]: value,
    });
  };

  handleAuthentication = async (data) => {
    const { token } = this.state.login
      ? data.login
      : data.signup;

    localStorage.setItem(AUTH_TOKEN, token);
    this.props.history.push(`/`);
  }

  render() {
    const {
      login,
      email,
      password,
      name,
    } = this.state;

    return (
      <div>
        <h4 className="mv3">
          {login ? 'Login' : 'Sign Up'}
        </h4>
        <div className="flex flex-column">
          {!login && (
            <input
              className="mb2"
              name="name"
              value={name}
              onChange={this.handleChange}
              type="text"
              placeholder="Your name"
            />
          )}
          <input
            className="mb2"
            name="email"
            value={email}
            onChange={this.handleChange}
            type="text"
            placeholder="Your email address"
          />
          <input
            className="mb2"
            name="password"
            value={password}
            onChange={this.handleChange}
            type="password"
            placeholder="Choose a safe password"
          />
        </div>
        <div className="flex mb3">
          <Mutation
            mutation={login ? LOGIN_MUTATION : SIGNUP_MUTATION}
            variables={{ email, password, name }}
            onCompleted={data => this.handleAuthentication(data)}
          >
            {mutation => (
              <div className="pointer mr2 button" onClick={mutation}>
                {login ? 'login' : 'create account'}
              </div>
            )}
          </Mutation>
          <div
            className="pointer button"
            onClick={() => this.setState({ login: !login })}
          >
            {login
              ? 'create account'
              : 'back to login'}
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
