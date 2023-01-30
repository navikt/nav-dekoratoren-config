const fs = require("fs");
const { Validator } = require("jsonschema");

const validator = new Validator();

const fileOptions = {
  encoding: "utf8",
};

const parseJsonFile = (filename) => {
  try {
    return JSON.parse(fs.readFileSync(filename, fileOptions));
  } catch (e) {
    console.error(`Failed to parse file ${filename} - ${e}`);
    process.exitCode = 1;
  }
};

const validateJson = (filename, schema) => {
  const json = parseJsonFile(filename);

  const { errors } = validator.validate(json, schema);

  if (errors.length === 0) {
    console.log(`File "${filename}" validated without errors`);
    return;
  }

  process.exitCode = 1;

  console.error(`Validation errors in file "${filename}":`);

  errors.forEach((error) => {
    console.error(`${error.instance} in ${error.property} ${error.message}`);
  });
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
