import { Inter } from "next/font/google";
import axios from "axios";
import { Round } from "@/api/schema";

const query = (round: number) => /* GraphQL */ `
query {
  results(round: ${round}, year: 2023, variant: LEADERSHIP) {
    Hsu
    Erskine_Smith
    Crombie
    Naqvi
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
      data: {
        round1Total,
        round2Total,
        round3Total,
      },
    },
  };
}

const inter = Inter({ subsets: ["latin"] });

type Props = {
  data: any;
};

export default function Home({ data }: Props) {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </main>
  );
}
