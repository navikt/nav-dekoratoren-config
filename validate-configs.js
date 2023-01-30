const fs = require("fs");
const { Validator } = require("jsonschema");

Validator.prototype.customFormats["datetime"] = (input) => {
  return !isNaN(Date.parse(input));
};

const validator = new Validator();

const fileOptions = {
  encoding: "utf8",
};

const parseJsonFile = (filename) => {
  try {
    return JSON.parse(fs.readFileSync(filename, fileOptions));
  } catch (e) {
    console.error(`Failed to parse file ${filename} - ${e}`);
    return null;
  }
};

const validateJson = (filename, schema) => {
  const json = parseJsonFile(filename);
  if (!json) {
    process.exitCode = 1;
    return;
  }

  const { errors } = validator.validate(json, schema);
  if (errors.length === 0) {
    console.log(`File "${filename}" validated without errors`);
    return;
  }

  console.error(`Validation errors in file "${filename}":`);
  errors.forEach((error) => {
    console.error(`${error.instance} in ${error.property} ${error.message}`);
  });

  process.exitCode = 1;
};

const validateConfigs = (env) => {
  if (env !== "dev" && env !== "prod") {
    console.error("Invalid environment specified");
    process.exitCode = 1;
    return;
  }

  const taSchema = parseJsonFile("schemas/ta-config.schema.json");

  validateJson(`configs/${env}/ta-config.json`, taSchema);
};

module.exports = {
  validateConfigs,
};
