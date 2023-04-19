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
//const periodicHandler = require("iipzy-shared/src/utils/periodicHandler");
const { processErrorHandler } = require("iipzy-shared/src/utils/utils");


//const piLocalEvents = require("./core/main/utils/piLocalEvents");
//const { IpcRecv } = require("./ipc/ipcRecv");
//const IpcSend = require("./ipc/ipcSend");
//const { setIpcRecv } = require("./ipc/eventWaiter");

//const heartbeat = require("./core/main/heartbeat");
//const pingPlot = require("./core/main/pingPlot");

//const scheduler = require("./core/main/scheduler");
//const throughputTest = require("./core/main/throughputTest");

const TrafficControl = require("./services/trafficControl");

//const { changeTimezoneIfNecessary } = require("./utils/timezone");

//const actionHandler = require("./main/actionHandler");
//const auth = require("./main/auth");
//const remoteJobManager = require("./main/remoteJobManager");
//const serverAddressMgr = require("./main/serverAddressMgr");

//const { NetworkMonitor } = require("./services/networkMonitor");
//let networkMonitor = null;
//const { sendAlert } = require("./services/alertService");

//require("./startup/routes")(app);
const { prerequisite } = require("./startup/prerequisite");

let configFile = null;

let logLevel = undefined;

//let ipcRecv = null;
//let ipcSend = null;

//let server = null;

let trafficControl = null;

async function main() {
  const platformInfo_ = platformInfo.init();

  configFile = new ConfigFile(userDataPath, Defs.configFilename);
  await configFile.init();
  configFile.watch(configWatchCallback);
  logLevel = configFile.get("logLevel");
  if (logLevel) setLogLevel(logLevel);
  else await configFile.set("logLevel", "info");

  const serverAddress = configFile.get("serverAddress");
  if (serverAddress) {
    log("serverAddress = " + serverAddress, "main", "info");
    // set
    try {
      http.setBaseURL(serverAddress);
    } catch (ex) {
      log("(Exception) main - setBaseURL: " + ex, "main", "error");
      http.clearBaseURL();
      await configFile.set("serverAddress", "");
    }
  }

  // NB: Won't leave here until successfully contacting server.
  const { gatewayIPAddress, localIPAddress, publicIPAddress, clientToken, authToken } = await prerequisite(
    http,
    configFile
  );

  const clientName = configFile.get("clientName");
  log("..clientName=" + clientName, "main", "info");

  const tcMode = configFile.get("tcMode");

  /*
  const clientToken = configFile.get("clientToken");
  log("..clientToken=" + clientToken, "main", "info");
  if (clientToken) {
    http.setClientTokenHeader(clientToken);
  }
  */

  http.setClientTokenHeader(clientToken);
  http.setAuthTokenHeader(authToken);


  //ipcRecv = new IpcRecv();
  //ipcSend = new IpcSend();

  const context = {
    //_clientName: clientName,
    //_clientType: "appliance",
    _configFile: configFile,
    _gatewayIPAddress: gatewayIPAddress,
    _http: http,
    //_ipcRecv: ipcRecv,
    //_ipcSend: ipcSend,
    _localIPAddress: localIPAddress,
    _platformInfo: platformInfo_,
    _publicIPAddress: publicIPAddress,
    //_sendAlert: sendAlert,
    //_serialNumber: serialNumber,
    //_standAlone: true,
    _tcMode: tcMode,
    _userDataPath: userDataPath,
  };

  //setIpcRecv(ipcRecv);

  //await serverAddressMgr.init(context);

  /*
  // attempt to login.
  await auth.init(context);
  await auth.login();
  */

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

  /*
  function netRateDataFunc(jsonString) {
    log("netRateDataFunc: date = " + jsonString, "main", "info");
  }

  function netRateDoneFunc(j) {
    log("netRateDoneFunc", "main", "info");
  }
  */

  /*
  // dump device table
  ipcRecv.registerReceiver(Defs.ipcDumpSentinelDeviceTable, (event, data) => {
    log("dump device table", "main", "info");
    networkMonitor.dumpDeviceTable();
  });

  ipcRecv.registerReceiver(Defs.ipcClientName, (event, data) => {
    // clientName
    log("ipcClientName: clientName = " + data.clientName, "main", "info");
    const clientName = data.clientName + "(appliance)";
    piLocalEvents.emit(Defs.ipcClientName, { clientName });
  });

  ipcRecv.registerReceiver(Defs.ipcServerAddress, async (event, data) => {
    // serverAddress
    log("ipcServerAddress: serverAddress = " + data.serverAddress, "main", "info");
    await serverAddressMgr.saveServerAddress(data.serverAddress);
    http.setBaseURL(data.serverAddress);

    // check timezone.
    if (await changeTimezoneIfNecessary(configFile)) {
      // restart.
      log("timezone change. Restarting in 5 seconds", "main", "info");
      setTimeout(() => {
        process.exit(99);
      }, 5 * 1000);
    }
  });

  ipcRecv.registerReceiver(Defs.ipcLoginStatus, (event, data) => {
    // client logged in/out
    log("ipcLoginStatus: loginStatus = " + data.loginStatus, "main", "info");
    piLocalEvents.emit(Defs.ipcLoginStatus, data);
  });

  piLocalEvents.on(Defs.pevLoginNeeded, async (data) => {
    log("pevLoginNeeded", "main", "info");
    await auth.login();
  });
  */

  //actionHandler.init(context);
  //periodicHandler.init(context);
  //await heartbeat.init(context, actionHandler.actionCB, periodicHandler.periodicCB);
  //await pingPlot.init(context);
  //await throughputTest.init(context);
  //scheduler.init(context);
  //remoteJobManager.init(context);

  /*
  networkMonitor = new NetworkMonitor(context);
  // start in 10 seconds
  setTimeout(async () => {
    await networkMonitor.start("br-lan", "udp port 53");
    //networkMonitor.start("eth0", "");
  }, 10 * 1000);
  */

  trafficControl = new TrafficControl("testing", context);
  // start in 10 seconds
  setTimeout(async () => {
    trafficControl.run();
  }, 10 * 1000);

  //??wifiService = new WifiService(context);

  /*
  log("__dirname: " + __dirname, "main", "info");
  const port = 8002;
  server = app.listen(port, async () => {
    log(`Listening on port ${port}...`, "main", "info");
  });
  */

  // server = https
  //   .createServer(
  //     {
  //       key: fs.readFileSync(__dirname + "/certificate/server.key"),
  //       cert: fs.readFileSync(__dirname + "/certificate/server.cert")
  //     },
  //     app
  //   )
  //   .listen(port, () => {
  //     log(`Listening on port ${port}...`, "main", "info");
  //   });

  //??
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

//module.exports = server;
