import React, { Component, Fragment } from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';

import Link from './Link';

const SEARCH_FEED_QUERY = gql`
  query Search($filter: String!) {
    feed(filter: $filter) {
      links {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

class Search extends Component {
  state = {
    links: [],
    filter: '',
  }

  handleSearch = async () => {
    const { filter } = this.state;
    const result = await this.props.client.query({
      query: SEARCH_FEED_QUERY,
      variables: { filter },
    });
    const links = result.data.feed.links;
    this.setState({ links });
  }

  render() {
    const { links } = this.state;
    return (
      <Fragment>
        <div>
          Search
          <input
            className="ml2"
            type="text"
            onChange={e => this.setState({ filter: e.target.value })}
          />
          <button onClick={this.handleSearch}>Search</button>
        </div>
        {links.map((link, index) =>
          <Link key={link.id} link={link} index={index} />
        )}
      </Fragment>
    );
  }
}

export default withApollo(Search);
