import { readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";
import csv from "csvtojson";

const files = readdirSync(path.join(__dirname, "../data"));

const convertCsvToJson = async (filePath: string) => {
  const jsonArray = await csv().fromString(readFileSync(filePath, "utf-8"));
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

const createJsonData = async () => {
  const jsonData: { [key: string]: any } = {};

  for (const file of files) {
    const filePath = path.join(__dirname, "../data", file);
    const json = await convertCsvToJson(filePath);
    jsonData[file.replace(".csv", "")] = json;
  }

  const outputFilePath = path.join(__dirname, "../data/data.json");
  writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2));
};

createJsonData();
