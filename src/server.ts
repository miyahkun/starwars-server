import { ApolloServer } from 'apollo-server';

import { schema } from '@/src/data/schema';

const PORT = 8081;

const server = new ApolloServer({
  schema,
});

server.listen({ port: PORT }).then(() => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
});
