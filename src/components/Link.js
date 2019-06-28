import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { AUTH_TOKEN } from '../constants';
import { timeDifferenceForDate } from '../utils';

const VOTE_MUTATION = gql`
  mutation Vote($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
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

class Link extends Component {
  render() {
    const { index, link, updateStoreAfterVote } = this.props;
    const authToken = localStorage.getItem(AUTH_TOKEN);
    return (
      <div className="flex mt2 items-start">
        <div className="flex items-center">
          <span className="gray">{index + 1}.</span>
          {authToken && (
            <Mutation
              mutation={VOTE_MUTATION}
              variables={{ linkId: link.id }}
              update={(store, { data: { vote } }) =>
                updateStoreAfterVote(store, vote, link.id)
              }
            >
              {mutation => (
                <div className="ml1 gray fl1 pointer" onClick={mutation}>
                  ▲
                </div>
              )}
            </Mutation>
          )}
        </div>
        <div className="ml1">
          <div>
            {link.description} <span className="f6 gray">({link.url})</span>
          </div>
          <div className="f6 lh-copy gray">
            {link.votes.length} votes | by{' '}
            {link.postedBy
              ? link.postedBy.name
              : 'Unknown'}{' '}
            {timeDifferenceForDate(link.createdAt)}
          </div>
        </div>
      </div>
    );
  }
}

export default Link;