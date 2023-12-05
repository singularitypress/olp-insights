import { type } from "os";

interface Round {
  Association: string;
  Crombie: number;
  ErskineSmith: number;
  Hsu?: number;
  Naqvi?: number;
  Valid: number;
  Invalid: number;
  Exhausted: number;
  Cast: number;
  Points: number;
  Eligible?: number;
}

export const typeDefs = /* GraphQL */ `
  type Round {
    Association: String
    Crombie: Float
    ErskineSmith: Float
    Hsu: Float
    Naqvi: Float
    Valid: Int
    Invalid: Int
    Exhausted: Int
    Cast: Int
    Points: Int
    Eligible: Int
  }

  enum RoundName {
    ROUND_01
    ROUND_02
    ROUND_03
  }

  type Query {
    results(round: RoundName!, association: String): [Round]
  }
`;

type RoundName = "ROUND_01" | "ROUND_02" | "ROUND_03";

const ROUND_NAMES = {
  ROUND_01: "olp-round-01",
  ROUND_02: "olp-round-02",
  ROUND_03: "olp-round-03",
};

export const resolvers = (data: { [key: string]: Round[] }) => ({
  Query: {
    results: (
      _parent: any,
      { round, association }: { round: RoundName; association?: string },
      _context: any,
      _info: any
    ) => {
      if (association) {
        return data[ROUND_NAMES[round]].filter(
          (r) => r.Association === association
        );
      }
      return data[ROUND_NAMES[round]];
    },
  },
});
