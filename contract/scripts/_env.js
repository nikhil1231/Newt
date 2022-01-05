const fs = require("fs");
const envfile = require('envfile');
const dotenv = require('dotenv');

const ENV_PATH = '../.env'

dotenv.config({ path: ENV_PATH });


module.exports = {

  addToEnv: (key, val) => {
    const envRaw = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH).toString() : ""
    const env = envfile.parse(envRaw)

    env[key] = val

    fs.writeFileSync(ENV_PATH, envfile.stringify(env))
  },

  keyExists: (key) => {
    if (!fs.existsSync(ENV_PATH)) return false

    const envRaw = fs.readFileSync(ENV_PATH).toString()
    const env = parse(envRaw)

    return key in env
  },

  getEntry: (key) => {
    return process.env[key]
  }
}