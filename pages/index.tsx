import { Inter } from "next/font/google";
import axios from "axios";
import { Round } from "@/api/schema";
import { Chart } from "react-google-charts";

const query = (round: number) => /* GraphQL */ `
query {
  results(round: ${round}, year: 2023, variant: LEADERSHIP) {
    Hsu
    Erskine_Smith
    Crombie
    Naqvi
    Exhausted
  }
}
`;

const getData = async (query: string) => {
  return await axios.post<{
    data: {
      results: Round[];
    };
  }>(
    "http://localhost:4000/graphql",
    { query },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

const sankeyLinks = (rounds: Round[]) => {
  const links: (string | number)[][] = [];
  for (let i = 0; i < rounds.length - 1; i++) {
    const roundAKeys = Object.keys(rounds[i]).filter(
      (key) => (rounds[i][key as keyof Round] as number) > 0
    );
    const roundBKeys = Object.keys(rounds[i + 1]).filter(
      (key) => (rounds[i + 1][key as keyof Round] as number) > 0
    );

    const diff = roundAKeys.filter((x) => !roundBKeys.includes(x));

    roundAKeys.forEach((key) => {
      if (key === diff[0]) {
        roundBKeys.forEach((key2) => {
          links.push([
            `Round ${i + 1} ${key}`,
            `Round ${i + 2} ${key2}`,
            (rounds[i + 1][key2 as keyof Round] as number) -
              (rounds[i][key2 as keyof Round] as number),
          ]);
        });
      } else {
        links.push([
          `Round ${i + 1} ${key}`,
          `Round ${i + 2} ${key}`,
          rounds[i][key as keyof Round] as number,
        ]);
      }
    });
  }
  return links;
};

const total = (associations: Round[]) => {
  return associations.reduce((acc, curr) => {
    const tmp: any = { ...acc };
    Object.keys(curr).forEach((key) => {
      const accVal: number = tmp[key as keyof Round] || (0 as any);
      const currVal: number = curr[key as keyof Round] || (0 as any);
      if (typeof tmp[key as keyof Round] === "undefined") {
        tmp[key as keyof Round] = 0;
      }
      tmp[key as keyof Round] = accVal + currVal;
    });
    return tmp as Round;
  }, {} as Round);
};

// use getServersideProps to fetch data on the server with axios
export async function getServerSideProps() {
  const {
    data: {
      data: { results: round1 },
    },
  } = await getData(query(1));

  const {
    data: {
      data: { results: round2 },
    },
  } = await getData(query(2));

  const {
    data: {
      data: { results: round3 },
    },
  } = await getData(query(3));

  const round1Total = total(round1);
  const round2Total = total(round2);
  const round3Total = total(round3);

  return {
    props: {
      data: [
        [
          "round",
          ...Object.keys(round1Total).sort(
            (a, b) =>
              (round1Total[b as keyof Round] as any as number) -
              (round1Total[a as keyof Round] as any as number)
          ),
        ],
        [
          "Round 1",
          ...Object.values(round1Total).sort(
            (a, b) => (b as any as number) - (a as any as number)
          ),
        ],
        [
          "Round 2",
          ...Object.values(round2Total).sort(
            (a, b) => (b as any as number) - (a as any as number)
          ),
        ],
        [
          "Round 3",
          ...Object.values(round3Total).sort(
            (a, b) => (b as any as number) - (a as any as number)
          ),
        ],
      ],
      sankey: [
        ["From", "To", "Votes"],
        ...sankeyLinks([round1Total, round2Total, round3Total]),
      ],
    },
  };
}

const inter = Inter({ subsets: ["latin"] });

type Props = {
  data: any;
  sankey: (string | number)[][];
};

export default function Home({ data, sankey }: Props) {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="grid grid-cols-2 gap-4 w-full">
        <Chart
          options={{
            isStacked: "relative",
            legend: { position: "top", maxLines: 3 },
            vAxis: {
              minValue: 0,
            },
          }}
          chartType="AreaChart"
          width="100%"
          height="600px"
          data={data}
        />
        <Chart
          options={{
            legend: { position: "top", maxLines: 3 },
            vAxis: {
              minValue: 0,
            },
          }}
          chartType="AreaChart"
          width="100%"
          height="600px"
          data={data}
        />
        <Chart
          chartType="Sankey"
          width="100%"
          height="600px"
          data={sankey}
          options={{
            backgroundColor: "#f5f5f5",
          }}
        />
      </div>
    </main>
  );
}
