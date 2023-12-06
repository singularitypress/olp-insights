import { readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";
import csv from "csvtojson";

type Data = {
  variant: "leadership" | "general";
  year: number;
  files: string[];
  dir: string;
};

const data: Data[] = [
  {
    variant: "leadership",
    year: 2023,
    files: readdirSync(path.join(__dirname, "../data/leadership-2023")),
    dir: path.join(__dirname, "../data/leadership-2023"),
  },
];

const convertCsvToJson = async (filePath: string) => {
  const csvStr = readFileSync(filePath, "utf-8");
  const [header] = csvStr.split("\n");
  const [_, pointKeys] = header.split(",Points,");
  const tmp = pointKeys
    .split(",")
    .map((key) => {
      if (key) {
        return `Points_${key}`;
      }
      return key;
    })
    .join(",");
  const jsonArray = await csv().fromString(
    csvStr.replace(/^.*/, header.replace(/,Points,.*/, `,Points,${tmp}`))
  );
  return jsonArray.map((item) => {
    Object.keys(item).forEach((key) => {
      if (item[key] === "" || item[key] === "-") {
        delete item[key];
      }

      if (!!item[key] && !isNaN(item[key].trim().replace(/,/g, ""))) {
        item[key] = Number(item[key].trim().replace(/,/g, ""));
      }
    });
    return item;
  });
};

const createJsonData = async ({ files, dir }: Data) => {
  const jsonData: { [key: string]: any } = {};

  for (const file of files) {
    const filePath = path.join(dir, file);
    const json = await convertCsvToJson(filePath);
    jsonData[file.replace(".csv", "")] = json;
  }

  return jsonData;
};

const writeJsonData = async (data: Data[]) => {
  const jsonData: {
    [key: string]: {
      [key: string]: any;
    };
  } = {};

  for (const item of data) {
    jsonData[item.variant] = {
      ...jsonData[item.variant],
      [item.year]: await createJsonData(item),
    };
  }
  const outputFilePath = path.join(__dirname, "../data/data.json");
  writeFileSync(outputFilePath, JSON.stringify(jsonData));
};

writeJsonData(data);
