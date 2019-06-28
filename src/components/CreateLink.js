import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { LINKS_PER_PAGE } from '../constants';

import { GET_FEED_QUERY } from './LinkList';

const POST_MUTATION = gql`
  mutation Post($url: String!, $description: String!) {
    post(url: $url, description: $description) {
      id
      url
      description
    }
  }
`;

class CreateLink extends Component {
  state = {
    url: '',
    description: '',
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

  render() {
    const { url, description } = this.state;
    return (
      <div>
        <div className="flex flex-column mt3">
          <input
            className="mb2"
            type="text"
            name="url"
            value={url}
            placeholder="URL"
            onChange={this.handleChange}
          />
          <input
            className="mb2"
            type="text"
            name="description"
            value={description}
            placeholder="Description"
            onChange={this.handleChange}
          />
        </div>
        <div className="flex mb3">
          <Mutation
            mutation={POST_MUTATION}
            variables={{ url, description }}
            onCompleted={() => this.props.history.push('/new/1')}
            update={(store, { data: { post } }) => {
              const first = LINKS_PER_PAGE;
              const skip = 0;
              const orderBy = 'createdAt_DESC';

              const data = store.readQuery({
                query: GET_FEED_QUERY,
                variables: { first, skip, orderBy },
              });
              data.feed.links.unshift(post);
              store.writeQuery({
                query: GET_FEED_QUERY,
                data,
                variables: { first, skip, orderBy },
              });
            }}
          >
            {mutation => (
              <button onClick={mutation}>Submit</button>
            )}
          </Mutation>
        </div>
      </div>
    );
  }
}

export default CreateLink;
