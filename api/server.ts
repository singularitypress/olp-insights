import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";
import dotenv from "dotenv";
import { resolvers, typeDefs } from "@olp/gql";
import { readFileSync } from "node:fs";
import path from "node:path";

dotenv.config();

const dataPath = path.join(__dirname, "../data/data.json");
const rawData = readFileSync(dataPath, "utf-8");
const data = JSON.parse(rawData);

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers: resolvers(data),
  }),
  graphiql: {
    defaultQuery: /* GraphQL */ `
      {
        round_1: results(year: 2023, variant: LEADERSHIP, round: 1) {
          Association
          Hsu
          Erskine_Smith
        }
      }
    `,
  },
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
