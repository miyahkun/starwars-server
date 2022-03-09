export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  hero?: Maybe<Character>;
  reviews?: Maybe<Array<Maybe<Review>>>;
  search?: Maybe<Array<Maybe<SearchResult>>>;
  character?: Maybe<Character>;
  droid?: Maybe<Droid>;
  human?: Maybe<Human>;
  starship?: Maybe<Starship>;
};

export type QueryHeroArgs = {
  episode?: InputMaybe<Episode>;
};

export type QueryReviewsArgs = {
  episode: Episode;
};

export type QuerySearchArgs = {
  text?: InputMaybe<Scalars['String']>;
};

export type QueryCharacterArgs = {
  id: Scalars['ID'];
};

export type QueryDroidArgs = {
  id: Scalars['ID'];
};

export type QueryHumanArgs = {
  id: Scalars['ID'];
};

export type QueryStarshipArgs = {
  id: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createReview?: Maybe<Review>;
};

export type MutationCreateReviewArgs = {
  episode?: InputMaybe<Episode>;
  review: ReviewInput;
};

export type Subscription = {
  __typename?: 'Subscription';
  reviewAdded?: Maybe<Review>;
};

export type SubscriptionReviewAddedArgs = {
  episode?: InputMaybe<Episode>;
};

export enum Episode {
  Newhope = 'NEWHOPE',
  Empire = 'EMPIRE',
  Jedi = 'JEDI',
}

export type Character = {
  id: Scalars['ID'];
  name: Scalars['String'];
  friends?: Maybe<Array<Maybe<Character>>>;
  friendsConnection: FriendsConnection;
  appearsIn: Array<Maybe<Episode>>;
};

export type CharacterFriendsConnectionArgs = {
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['ID']>;
};

export enum LengthUnit {
  Meter = 'METER',
  Foot = 'FOOT',
}

export type Human = Character & {
  __typename?: 'Human';
  id: Scalars['ID'];
  name: Scalars['String'];
  homePlanet?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Float']>;
  mass?: Maybe<Scalars['Float']>;
  friends?: Maybe<Array<Maybe<Character>>>;
  friendsConnection: FriendsConnection;
  appearsIn: Array<Maybe<Episode>>;
  starships?: Maybe<Array<Maybe<Starship>>>;
};

export type HumanHeightArgs = {
  unit?: InputMaybe<LengthUnit>;
};

export type HumanFriendsConnectionArgs = {
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['ID']>;
};

export type Droid = Character & {
  __typename?: 'Droid';
  id: Scalars['ID'];
  name: Scalars['String'];
  friends?: Maybe<Array<Maybe<Character>>>;
  friendsConnection: FriendsConnection;
  appearsIn: Array<Maybe<Episode>>;
  primaryFunction?: Maybe<Scalars['String']>;
};

export type DroidFriendsConnectionArgs = {
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['ID']>;
};

export type FriendsConnection = {
  __typename?: 'FriendsConnection';
  totalCount?: Maybe<Scalars['Int']>;
  edges?: Maybe<Array<Maybe<FriendsEdge>>>;
  friends?: Maybe<Array<Maybe<Character>>>;
  pageInfo: PageInfo;
};

export type FriendsEdge = {
  __typename?: 'FriendsEdge';
  cursor: Scalars['ID'];
  node?: Maybe<Character>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  startCursor?: Maybe<Scalars['ID']>;
  endCursor?: Maybe<Scalars['ID']>;
  hasNextPage: Scalars['Boolean'];
};

export type Review = {
  __typename?: 'Review';
  episode?: Maybe<Episode>;
  stars: Scalars['Int'];
  commentary?: Maybe<Scalars['String']>;
};

export type ReviewInput = {
  stars: Scalars['Int'];
  commentary?: InputMaybe<Scalars['String']>;
  favorite_color?: InputMaybe<ColorInput>;
};

export type ColorInput = {
  red: Scalars['Int'];
  green: Scalars['Int'];
  blue: Scalars['Int'];
};

export type Starship = {
  __typename?: 'Starship';
  id: Scalars['ID'];
  name: Scalars['String'];
  length?: Maybe<Scalars['Float']>;
  coordinates?: Maybe<Array<Array<Scalars['Float']>>>;
};

export type StarshipLengthArgs = {
  unit?: InputMaybe<LengthUnit>;
};

export type SearchResult = Human | Droid | Starship;
