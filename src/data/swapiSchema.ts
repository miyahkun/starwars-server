/**
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PubSub, withFilter } from 'graphql-subscriptions';

import type { Character, Episode, Scalars, Starship } from '@/types/index';

import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';
import path from 'path';

const schema = loadSchemaSync(path.join(__dirname, '../../schema.graphql'), {
  loaders: [new GraphQLFileLoader()],
});

const pubsub = new PubSub();
const ADDED_REVIEW_TOPIC = 'new_review';

/**
 * This defines a basic set of data for our Star Wars Schema.
 *
 * This data is hard coded for the sake of the demo, but you could imagine
 * fetching this data from a backend service rather than from hardcoded
 * JSON objects in a more complex demo.
 */

const humans = [
  {
    id: '1000',
    name: 'Luke Skywalker',
    friends: ['1002', '1003', '2000', '2001'],
    appearsIn: ['NEWHOPE', 'EMPIRE', 'JEDI'],
    homePlanet: 'Tatooine',
    height: 1.72,
    mass: 77,
    starships: ['3001', '3003'],
  },
  {
    id: '1001',
    name: 'Darth Vader',
    friends: ['1004'],
    appearsIn: ['NEWHOPE', 'EMPIRE', 'JEDI'],
    homePlanet: 'Tatooine',
    height: 2.02,
    mass: 136,
    starships: ['3002'],
  },
  {
    id: '1002',
    name: 'Han Solo',
    friends: ['1000', '1003', '2001'],
    appearsIn: ['NEWHOPE', 'EMPIRE', 'JEDI'],
    height: 1.8,
    mass: 80,
    starships: ['3000', '3003'],
  },
  {
    id: '1003',
    name: 'Leia Organa',
    friends: ['1000', '1002', '2000', '2001'],
    appearsIn: ['NEWHOPE', 'EMPIRE', 'JEDI'],
    homePlanet: 'Alderaan',
    height: 1.5,
    mass: 49,
    starships: [],
  },
  {
    id: '1004',
    name: 'Wilhuff Tarkin',
    friends: ['1001'],
    appearsIn: ['NEWHOPE'],
    height: 1.8,
    mass: null,
    starships: [],
  },
];

type IHumanData = {
  [key: string]: Starship;
};

const humanData: IHumanData = {};
humans.forEach((ship) => {
  humanData[ship.id] = ship;
});

const droids = [
  {
    id: '2000',
    name: 'C-3PO',
    friends: ['1000', '1002', '1003', '2001'],
    appearsIn: ['NEWHOPE', 'EMPIRE', 'JEDI'],
    primaryFunction: 'Protocol',
  },
  {
    id: '2001',
    name: 'R2-D2',
    friends: ['1000', '1002', '1003'],
    appearsIn: ['NEWHOPE', 'EMPIRE', 'JEDI'],
    primaryFunction: 'Astromech',
  },
];

type IDroidData = {
  [key: string]: Starship;
};

const droidData: IDroidData = {};
droids.forEach((ship) => {
  droidData[ship.id] = ship;
});

const starships = [
  {
    id: '3000',
    name: 'Millenium Falcon',
    length: 34.37,
  },
  {
    id: '3001',
    name: 'X-Wing',
    length: 12.5,
  },
  {
    id: '3002',
    name: 'TIE Advanced x1',
    length: 9.2,
  },
  {
    id: '3003',
    name: 'Imperial shuttle',
    length: 20,
  },
];

type IStarshipData = {
  [key: string]: Starship;
};

const starshipData: IStarshipData = {};
starships.forEach((ship) => {
  starshipData[ship.id] = ship;
});

var reviews = {
  NEWHOPE: [],
  EMPIRE: [],
  JEDI: [],
};

/**
 * Helper function to get a character by ID.
 */
function getCharacter(id: Scalars['ID']) {
  // Returning a promise just to illustrate GraphQL.js's support.
  return Promise.resolve(humanData[id] || droidData[id]);
}

/**
 * Allows us to query for a character's friends.
 */
function getFriends(character: Character) {
  // @ts-ignore
  return character.friends?.map((id) => getCharacter(id));
}

/**
 * Allows us to fetch the undisputed hero of the Star Wars trilogy, R2-D2.
 */
function getHero(episode: Episode) {
  if (episode === 'EMPIRE') {
    // Luke is the hero of Episode V.
    return humanData['1000'];
  }
  // Artoo is the hero otherwise.
  return droidData['2001'];
}

/**
 * Allows us to fetch the ephemeral reviews for each episode
 */
function getReviews(episode: Episode) {
  return reviews[episode];
}

/**
 * Allows us to query for the human with the given id.
 */
function getHuman(id: Scalars['ID']) {
  return humanData[id];
}

/**
 * Allows us to query for the droid with the given id.
 */
function getDroid(id: Scalars['ID']) {
  return droidData[id];
}

function getStarship(id: Scalars['ID']) {
  return starshipData[id];
}

function toCursor(str: number) {
  // @ts-ignore
  return Buffer('cursor' + str).toString('base64');
}

function fromCursor(str: number) {
  // @ts-ignore
  return Buffer.from(str, 'base64').toString().slice(6);
}

const resolvers = {
  Query: {
    // @ts-ignore
    hero: (root, { episode }) => getHero(episode),
    // @ts-ignore
    character: (root, { id }) => getCharacter(id),
    // @ts-ignore
    human: (root, { id }) => getHuman(id),
    // @ts-ignore
    droid: (root, { id }) => getDroid(id),
    // @ts-ignore
    starship: (root, { id }) => getStarship(id),
    // @ts-ignore
    reviews: (root, { episode }) => getReviews(episode),
    // @ts-ignore
    search: (root, { text }) => {
      const re = new RegExp(text, 'i');

      const allData = [...humans, ...droids, ...starships];

      return allData.filter((obj) => re.test(obj.name));
    },
  },
  Mutation: {
    // @ts-ignore
    createReview: (_, { episode, review }) => {
      // @ts-ignore
      reviews[episode].push(review);
      review.episode = episode;
      pubsub.publish(ADDED_REVIEW_TOPIC, { reviewAdded: review });
      return review;
    },
  },
  Subscription: {
    reviewAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ADDED_REVIEW_TOPIC),
        (payload, variables) => {
          return (
            payload !== undefined &&
            (variables.episode === null ||
              payload.reviewAdded.episode === variables.episode)
          );
        }
      ),
    },
  },
  Character: {
    // @ts-ignore
    __resolveType(data, context, info) {
      if (humanData[data.id]) {
        return info.schema.getType('Human');
      }
      if (droidData[data.id]) {
        return info.schema.getType('Droid');
      }
      return null;
    },
  },
  Human: {
    // @ts-ignore
    height: ({ height }, { unit }) => {
      if (unit === 'FOOT') {
        return height * 3.28084;
      }

      return height;
    },
    // @ts-ignore
    friends: ({ friends }) => friends.map(getCharacter),
    // @ts-ignore
    friendsConnection: ({ friends }, { first, after }) => {
      first = first || friends.length;
      after = after ? parseInt(fromCursor(after), 10) : 0;
      const edges = friends
        // @ts-ignore
        .map((friend, i) => ({
          cursor: toCursor(i + 1),
          node: getCharacter(friend),
        }))
        .slice(after, first + after);
      // @ts-ignore
      const slicedFriends = edges.map(({ node }) => node);
      return {
        edges,
        friends: slicedFriends,
        pageInfo: {
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          hasNextPage: first + after < friends.length,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
        totalCount: friends.length,
      };
    },
    // @ts-ignore
    starships: ({ starships }) => starships.map(getStarship),
    // @ts-ignore
    appearsIn: ({ appearsIn }) => appearsIn,
  },
  Droid: {
    // @ts-ignore
    friends: ({ friends }) =>
      friends.map((id: string) => {
        return getCharacter(id);
      }),
    // @ts-ignore
    friendsConnection: ({ friends }, { first, after }) => {
      first = first || friends.length;
      after = after ? parseInt(fromCursor(after), 10) : 0;
      const edges = friends
        // @ts-ignore
        .map((friend, i) => ({
          cursor: toCursor(i + 1),
          node: getCharacter(friend),
        }))
        .slice(after, first + after);
      // @ts-ignore
      const slicedFriends = edges.map(({ node }) => node);
      return {
        edges,
        friends: slicedFriends,
        pageInfo: {
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          hasNextPage: first + after < friends.length,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
        totalCount: friends.length,
      };
    },
    // @ts-ignore
    appearsIn: ({ appearsIn }) => appearsIn,
  },
  FriendsConnection: {
    // @ts-ignore
    edges: ({ edges }) => edges,
    // @ts-ignore
    friends: ({ friends }) => friends,
    // @ts-ignore
    pageInfo: ({ pageInfo }) => pageInfo,
    // @ts-ignore
    totalCount: ({ totalCount }) => totalCount,
  },
  FriendsEdge: {
    // @ts-ignore
    node: ({ node }) => node,
    // @ts-ignore
    cursor: ({ cursor }) => cursor,
  },
  Starship: {
    // @ts-ignore
    length: ({ length }, { unit }) => {
      if (unit === 'FOOT') {
        return length * 3.28084;
      }

      return length;
    },
    coordinates: () => {
      return [
        [1, 2],
        [3, 4],
      ];
    },
  },
  SearchResult: {
    // @ts-ignore
    __resolveType(data, context, info) {
      if (humanData[data.id]) {
        return info.schema.getType('Human');
      }
      if (droidData[data.id]) {
        return info.schema.getType('Droid');
      }
      if (starshipData[data.id]) {
        return info.schema.getType('Starship');
      }
      return null;
    },
  },
};

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export const StarWarsSchema = addResolversToSchema({
  schema,
  resolvers,
});
