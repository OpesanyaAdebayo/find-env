#!/usr/bin/env node

const fs = require("fs");
const { spawn } = require("child_process");
const appRoot = require('app-root-path');

let uniqueVariableNames = new Set();

const child = spawn("grep", [
  "-R",
  "process.env",
  "--exclude-dir=node_modules",
  `${appRoot.toString()}/`
]);

child.stdout.on("data", data => {
  const str = data.toString();
  const environmentVariables = str.match(/process.env.\w+/gi);
  if (!environmentVariables) {
    console.log("No environment variables found");
    process.exit(0);
  }

  environmentVariables.forEach(variable => {
    uniqueVariableNames.add(variable.slice(12));
  });
  fs.readFile(`${appRoot.toString()}/.env.example`, (err, data) => {
    if (!data) {
      return;
    }
    const dataArray = data.toString().split("=\n");
    dataArray.forEach(variable => uniqueVariableNames.add(variable));
  });

  const formattedVariables = Array.from(uniqueVariableNames)
  .sort()
  .join("=\n");

  fs.writeFileSync(".env.example", formattedVariables);
  console.log('Successfully created .env.example file.');
});
console.log(appRoot.toString())