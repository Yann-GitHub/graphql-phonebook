// Extracted logging into a separate module for journalization and better control.

// Last Approach with custom log format for console and files logging 🤾
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize } = format;

// Custom format for file logging with traceId
const fileFormat = combine(
  timestamp(),
  printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ""
    }`;
  })
);

// Custom format for console logging without traceId
const consoleFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  printf(({ timestamp, level, message, ...meta }) => {
    // without traceId
    const metaString = Object.keys(meta).length
      ? meta.traceId
        ? ""
        : JSON.stringify(meta)
      : "";

    // Delete the traceId from the message for the console
    let cleanMessage = message;
    if (typeof message === "string" && message.includes("] ")) {
      cleanMessage = message.replace(/\[[0-9a-f-]+\] /, "");
    }

    return `${timestamp} [${level}]: ${cleanMessage} ${metaString}`;
  })
);

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",

  // Format for all logs - each transport get its own format

  transports: [
    // Console: Simpler format with color
    new transports.Console({
      format: consoleFormat,
    }),

    // Fichiers: Format with timestamp and traceId
    new transports.File({
      filename: "logs/combined.log",
      format: fileFormat,
    }),

    new transports.File({
      filename: "logs/errors.log",
      level: "error",
      format: fileFormat,
    }),
  ],
});

module.exports = logger;

//////////////////////////////////////////////////////////////////////////////
// 1. Simple approach: Use console.log and console.error directly in the code.
// Import this module in the files where you want to log messages.
// And use a script to run the server and log the output to a file.
// ex : node server.js > output.log 2>&1
// with thie approach you are loosing the log in the console. :(
////////

// const info = (...params) => {
//   console.log(...params);
// };

// const error = (...params) => {
//   console.error(...params);
// };

// module.exports = {
//   info,
//   error,
// };

//////////////////////////////////////////////////////////////////////////////
// 2. More advanced approach:
// This approach uses a custom logger module that formats the log messages with timestamps and writes them to both the console and a log file.
// This is a more structured way to handle logging, and it allows for better control over the log format and destination.
// Don't need to run the server with a script to log the output to a file.
//////////////////////////////////////////////////////////////////////////////
// const fs = require("fs");
// const util = require("util");

// // Flux d'écriture pour le fichier de log
// const logStream = fs.createWriteStream("output.log", { flags: "a" });

// // Fonction pour formater la date
// const getTimestamp = () => {
//   const now = new Date();
//   return now.toISOString();
// };

// // Créer les fonctions de log
// const logger = {
//   log: (message, ...args) => {
//     const formattedMessage = `${getTimestamp()} [INFO]: ${util.format(
//       message,
//       ...args
//     )}`;
//     console.log(formattedMessage);
//     logStream.write(formattedMessage + "\n");
//   },

//   error: (message, ...args) => {
//     const formattedMessage = `${getTimestamp()} [ERROR]: ${util.format(
//       message,
//       ...args
//     )}`;
//     console.error(formattedMessage);
//     logStream.write(formattedMessage + "\n");
//   },

//   warn: (message, ...args) => {
//     const formattedMessage = `${getTimestamp()} [WARN]: ${util.format(
//       message,
//       ...args
//     )}`;
//     console.warn(formattedMessage);
//     logStream.write(formattedMessage + "\n");
//   },
// };

// module.exports = logger;

/////////////////////////////////////////////////////////////////////////////////
// 3. Using Winston for logging and Apollo plugin (built-in logging)
// Winston is a versatile logging library for Node.js that allows you to log messages in different formats and to different transports (e.g., console, file, etc.).
// This is a more advanced and flexible approach to logging, allowing you to easily change the log format, level, and destination.
// We can also use traceId to track the request and response in the logs.
////////////////////////////////////////////////////////////////////////////////
// const { createLogger, format, transports } = require("winston");

// const logger = createLogger({
//   level: "debug",
//   format: format.combine(
//     format.timestamp(),
//     format.printf(({ timestamp, level, message, ...meta }) => {
//       return `${timestamp} [${level.toUpperCase()}]: ${message} ${
//         Object.keys(meta).length ? JSON.stringify(meta) : ""
//       }`;
//     })
//   ),
//   transports: [
//     new transports.Console(),
//     new transports.File({ filename: "logs/combined.log" }),
//     new transports.File({ filename: "logs/errors.log", level: "error" }),
//   ],
// });

// module.exports = logger;
