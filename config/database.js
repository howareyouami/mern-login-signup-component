const { DB_USERNAME, DB_PASSWORD, DB_CLUSTER } = require("./config");

console.log("DB_USERNAME===>", DB_USERNAME, "DB_PASSWORD", DB_PASSWORD, "DB_CLUSTER", DB_CLUSTER)
module.exports = {
  MongoURI: `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_CLUSTER}.mongodb.net/test?retryWrites=true&w=majority`
};
