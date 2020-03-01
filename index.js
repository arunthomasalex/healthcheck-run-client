const basicHealthCheck = require("./src/checkers/BasicHealthCheck");
const memoryHealthCheck = require("./src/checkers/MemoryHealthCheck");

if (!global.starttime) {
  global.starttime = new Date().getTime();
}

let startHealthCheckServer = port => {
  let http = require("http");
  http
    .createServer((req, res) => {
      if (req.url === "/actuator/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(basicHealthCheck.toJson()));
      } else if (req.url === "/actuator/details") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(memoryHealthCheck.toJson()));
      } else if (req.url === "/shutdown") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "DOWN" }));
        process.exit(1);
      }
    })
    .listen(port);
};

let sendBeakon = ({ serverIp, serverPort, appName, port }) => {
  let client = require("dgram").createSocket("udp4");
  setInterval(() => {
    client.send(
      JSON.stringify({ appName, port }),
      serverPort,
      serverIp,
      err => {
        if (err) {
          throw err;
        }
      }
    );
  }, 5000);
};

exports.HealthCheckClient = options => {
  if (!options.port) options.port = 10200;
  if (options.serverIp && options.serverPort && options.appName) {
    sendBeakon(options);
  }
  startHealthCheckServer(options.port);
};

exports.HealthCheckClientInfo = {
  getBasicDetails: () => basicHealthCheck.toJson(),
  getMemoryDetails: () => memoryHealthCheck.toJson()
};
