import fs from "fs";
import readline from "readline";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { generateReport } from "./crawler";

import { getSheetData } from "./sheets";

yargs(hideBin(process.argv))
  .command(
    "generate <filename|spreadsheet>",
    `Generate a report on the list of web pages in the specified file or spreadsheet.`,
    (yargs) =>
      yargs.positional("filename", {
        description:
          "The name of the file containing the list of web pages to generate a report on",
        type: "string",
      }).option("range", {
        description:
        "A formula describing which row of the spreadsheet to access for generation of reports.",
        type: "string"
      }),
    async (argv: any) => {
      const filename = argv.filename;
      const range = argv.range;
      
      if (!fs.existsSync(filename)) {
        let entries: string[][] = [];
        try {
          entries = await getSheetData(filename, range)
        } catch (err) {
          throw new Error("File or spreadsheet does not exist!")
        }

        for (let entry of entries) {
          let website = entry[0];
          try {
            await generateReport(website);
          } catch (err) {
            console.log(err);
          }
        }

      } else {
        const fileStream = fs.createReadStream(filename);

        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity,
        });

        let lines: string[] = [];

        rl.on("line", (line) => {
          lines.push(line);
        });

        rl.on("close", async () => {
          for (let line of lines) {
            await generateReport(line);
          }
        });
      }
    }
  )
  .parse();
