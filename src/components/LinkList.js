import React, { Component, Fragment } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { LINKS_PER_PAGE } from '../constants';

import Link from './Link';

export const GET_FEED_QUERY = gql`
  query Feed($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      count
      links {
        id
        url
        description
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
        createdAt
      }
    }
  }
`;

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
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
`;

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
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
      user {
        id
      }
    }
  }
`;

class LinkList extends Component {
  getPageIndex = () => {
    return parseInt(this.props.match.params.page, 10);
  }

  getIsNewPage = () => {
    return this.props.location.pathname.includes('new');
  }

  getQueryVariables = () => {
    const page = this.getPageIndex();
    const isNewPage = this.getIsNewPage();

    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;

    return { first, skip, orderBy };
  }

  getLinksToRender = (data) => {
    const isNewPage = this.getIsNewPage();
    if (isNewPage) {
      return data.feed.links;
    }
    const rankedLinks = data.feed.links.slice();
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks;
  }

  nextPage = (data) => {
    const page = this.getPageIndex();
    if (page <= data.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1;
      this.props.history.push(`/new/${nextPage}`);
    }
  }

  previousPage = () => {
    const page = this.getPageIndex();
    if (page > 1) {
      const previousPage = page - 1;
      this.props.history.push(`/new/${previousPage}`);
    }
  }

  updateCacheAfterVote = (store, createVote, linkId) => {
    const page = this.getPageIndex();
    const isNewPage = this.getIsNewPage();

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    const data = store.readQuery({
      query: GET_FEED_QUERY,
      variables: { first, skip, orderBy },
    });

    const votedLink = data.feed.links.find(link => link.id === linkId);
    votedLink.votes = createVote.link.votes;
    store.writeQuery({ query: GET_FEED_QUERY, data });
  }

  subscribeToNewLinks = async (subscribeToMore) => {
    subscribeToMore({
      document: NEW_LINKS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const { newLink } = subscriptionData.data;
        const exists = prev.feed.links.find(({ id }) => id === newLink.id);
        if (exists) return prev;
        return Object.assign({}, prev, {
          feed: {
            links: [newLink, ...prev.feed.links],
            count: prev.feed.links.length + 1,
            __typename: prev.feed.__typename,
          },
        });
      },
    });
  }

  subscribeToNewVotes = subscribeToMore => {
    subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION,
    });
  }

  render() {
    return (
      <Query
        query={GET_FEED_QUERY}
        variables={this.getQueryVariables()}
      >
        {({ data, loading, error, subscribeToMore }) => {
          if (loading) return <div>Loading...</div>
          if (error) return <div>Error</div>

          this.subscribeToNewLinks(subscribeToMore);
          this.subscribeToNewVotes(subscribeToMore);

          const { links } = data.feed;
          const isNewPage = this.getIsNewPage();
          const pageIndex = this.props.match.params.page
            ? (this.props.match.params.page - 1) * LINKS_PER_PAGE
            : 0;

          return (
            <Fragment>
              {links.map((link, index) =>
                <Link
                  key={link.id}
                  link={link}
                  index={index + pageIndex}
                  updateStoreAfterVote={this.updateCacheAfterVote}
                />
              )}
              {isNewPage && (
                <div>
                  <div className="flex ml4 mv3 gray">
                    <div className="pointer mr2" onClick={this.previousPage}>
                      Previous
                    </div>
                    <div className="pointer" onClick={() => this.nextPage(data)}>
                      Next
                    </div>
                  </div>
                </div>
              )}
            </Fragment>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;
