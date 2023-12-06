interface Data {
  leadership?: {
    [key: string]: {
      // year
      [key: string]: Round[]; // round (1, 2, 3, 4)
    };
  };
  general?: {
    [key: string]: {
      [key: string]: Round[];
    };
  };
}

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

  enum Variant {
    LEADERSHIP
    GENERAL
  }

  type Query {
    results(
      round: Int!
      year: Int!
      variant: Variant!
      association: String
    ): [Round]
  }
`;

export const resolvers = (data: Data) => ({
  Query: {
    results: (
      _parent: any,
      {
        round,
        year,
        variant,
        association,
      }: {
        round: number;
        year: number;
        variant: "LEADERSHIP" | "GENERAL";
        association?: string;
      },
      _context: any,
      _info: any
    ) => {
      if (association) {
        return data?.[variant.toLocaleLowerCase() as keyof typeof data]?.[
          `${year}`
        ][`${round}`].filter((r) => r.Association === association);
      }
      return data?.[variant.toLocaleLowerCase() as keyof typeof data]?.[
        `${year}`
      ][`${round}`];
    },
  },
});
