const express = require("express");
const app = express();
const fs = require("fs");
const https = require("https");
const { spawn } = require("child_process");

const Defs = require("iipzy-shared/src/defs");
const { log, logInit, setLogLevel } = require("iipzy-shared/src/utils/logFile");
const platformInfo = require("iipzy-shared/src/utils/platformInfo");

const userDataPath = "/etc/iipzy";
const logPath = process.platform === "win32" ? "c:/temp/" : "/var/log/iipzy";
logInit(logPath, "iipzy-tc");
const { ConfigFile } = require("iipzy-shared/src/utils/configFile");
const http = require("iipzy-shared/src/services/httpService");
const { processErrorHandler } = require("iipzy-shared/src/utils/utils");

const TrafficControl = require("./services/trafficControl");

//require("./startup/routes")(app);
const { prerequisite } = require("./startup/prerequisite");

let configFile = null;

let logLevel = undefined;

let server = null;

let trafficControl = null;

function createServer() {
  log("main.createServer", "strt", "info");
  try {
    server = app.listen(Defs.port_traffic_control, 'localhost', async () => {
      log(`Listening on port ${Defs.port_traffic_control}...`, "main", "info");
    });
  } catch (ex) {
    log("(Exception) main.createServer: " + ex, "strt", "error");
    return false;
  }
  return true;
}

async function main() {
  const platformInfo_ = platformInfo.init();

  configFile = new ConfigFile(userDataPath, Defs.configFilename);
  await configFile.init();
  configFile.watch(configWatchCallback);

  http.setBaseURL(configFile.get("serverAddress") + ":" + Defs.port_server);

  // NB: Won't leave here until successfully contacting server.
  const { gatewayIPAddress, localIPAddress, publicIPAddress, clientToken, authToken } = await prerequisite(
    http,
    configFile
  );

  const clientName = configFile.get("clientName");
  log("..clientName=" + clientName, "main", "info");

  const tcMode = configFile.get("tcMode");

  http.setClientTokenHeader(clientToken);
  http.setAuthTokenHeader(authToken);

  const context = {
    _configFile: configFile,
    _gatewayIPAddress: gatewayIPAddress,
    _http: http,
    _localIPAddress: localIPAddress,
    _platformInfo: platformInfo_,
    _publicIPAddress: publicIPAddress,
    _tcMode: tcMode,
    _userDataPath: userDataPath,
  };

  // local server only.
  createServer();

  trafficControl = new TrafficControl("testing", context);
  // start in 10 seconds
  setTimeout(async () => {
    trafficControl.run();
  }, 10 * 1000);
}

function configWatchCallback() {
  log("configWatchCallback", "main", "info");
  const logLevel_ = configFile.get("logLevel");
  if (logLevel_ !== logLevel) {
    log(
      "configWatchCallback: logLevel change: old = " + logLevel + ", new = " + logLevel_,
      "main",
      "info"
    );
  }
  if (logLevel_) {
    // tell log.
    logLevel = logLevel_;
    setLogLevel(logLevel);
  }
}

main();

processErrorHandler(processStopHandler, processAlertHandler);

async function processStopHandler(message) {
  // await http.post("/client/trace", {
  //   trace: { where: "processStopHandler", messageString: message }
  // });
}

async function processAlertHandler(message) {
  // await http.post("/client/trace", {
  //   trace: { where: "processAlertHandler", messageString: message }
  // });
}

module.exports = server;
