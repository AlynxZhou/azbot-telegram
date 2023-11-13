/**
 * @module bot-utils
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as https from "node:https";

/**
 * @description A helper class for uploading file.
 * @example
 * new InputFile(path)
 */
class InputFile {
  /**
   * @param {String} filepath
   * @param {Buffer} [buffer] If no buffer provided it will read from file.
   * @return {InputFile}
   */
  constructor(filepath, buffer = null) {
    this.filename = path.basename(filepath);
    if (buffer == null) {
      // Read file content from path.
      this.buffer = fs.readFileSync(filepath);
    } else {
      this.buffer = buffer;
    }
  }
}

/**
 * @see https://core.telegram.org/bots/api#inputmedia
 * @example
 * new InputMedia(type, media)
 */
class InputMedia {
  /**
   * @param {String} type
   * @param {(String|InputFile)} media File ID, URL or InputFile.
   * @param {Object} [opts] Optional Telegram parameters.
   * @return {InputMedia}
   */
  constructor(type, media, opts = {}) {
    this.type = type;
    this.media = media;
    opts = toSnakeCaseObject(opts);
    Object.assign(this, opts);
  }
}

/**
 * @see https://core.telegram.org/bots/api#inputmediaphoto
 * @example
 * new InputMediaPhoto(media)
 */
class InputMediaPhoto extends InputMedia {
  /**
   * @param {(String|InputFile)} media File ID, photo URL or InputFile.
   * @param {Object} [opts] Optional Telegram parameters.
   * @return {InputMedia}
   */
  constructor(media, opts = {}) {
    super("photo", media, opts);
  }
}

/**
 * @see https://core.telegram.org/bots/api#inputmediavideo
 * @example
 * new InputMediaVideo(media)
 */
class InputMediaVideo extends InputMedia {
  /**
   * @param {(String|InputFile)} media File ID, video URL or InputFile.
   * @param {Object} [opts] Optional Telegram parameters.
   * @return {InputMedia}
   */
  constructor(media, opts = {}) {
    super("video", media, opts);
  }
}

/**
 * @see https://core.telegram.org/bots/api#inputmediaanimation
 * @example
 * new InputMediaAnimation(media)
 */
class InputMediaAnimation extends InputMedia {
  /**
   * @param {(String|InputFile)} media File ID, animation URL or InputFile.
   * @param {Object} [opts] Optional Telegram parameters.
   * @return {InputMedia}
   */
  constructor(media, opts = {}) {
    super("animation", media, opts);
  }
}

/**
 * @see https://core.telegram.org/bots/api#inputmediaaudio
 * @example
 * new InputMediaAudio(media)
 */
class InputMediaAudio extends InputMedia {
  /**
   * @param {(String|InputFile)} media File ID, audio URL or InputFile.
   * @param {Object} [opts] Optional Telegram parameters.
   * @return {InputMedia}
   */
  constructor(media, opts = {}) {
    super("audio", media, opts);
  }
}

/**
 * @see https://core.telegram.org/bots/api#inputmediadocument
 * @example
 * new InputMediaDocument(media)
 */
class InputMediaDocument extends InputMedia {
  /**
   * @param {(String|InputFile)} media File ID, document URL or InputFile.
   * @param {Object} [opts] Optional Telegram parameters.
   * @return {InputMedia}
   */
  constructor(media, opts = {}) {
    super("document", media, opts);
  }
}

/**
 * @description A simple FormData implemention,
 * does not support mixed files because Telegram Bot API does not use it.
 * It is designed for upload files,
 * so don't think you can get your value as original type.
 * @example
 * new FormData()
 */
class FormData {
  /**
   * @return {FormData}
   */
  constructor() {
    this.buffer = null;
    this.boundary = `${Math.random().toString(16)}`;
    this.data = {};
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/append
   * @param {String} name
   * @param {(String|Buffer)} value
   * @param {String} [filename] If you want to upload a file, Telegram Bot API needs this.
   */
  append(name, value, filename = null) {
    name = `${name}`;
    if (!(isString(value) || isBuffer(value))) {
      value = `${value}`;
    }
    if (this.data[name] == null) {
      this.data[name] = [];
    }
    this.data[name].push({name, value, filename});
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/delete
   * @param {String} name
   */
  delete(name) {
    if (this.data[name] != null) {
      delete this.data[name];
    }
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/get
   * @param {String} name
   * @return {(String|Buffer)} Value
   */
  get(name) {
    if (this.data[name] == null) {
      return null;
    }
    return this.data[name][0]["value"];
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/getAll
   * @param {String} name
   * @return {Array} Array of value.
   */
  getAll(name) {
    if (this.data[name] == null) {
      return null;
    }
    return this.data[name].map((o) => {
      return o["value"];
    });
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/append
   * @param {String} name
   * @param {(String|Buffer)} value
   * @param {String} [filename] If you want to upload a file, Telegram Bot API needs this.
   */
  set(name, value, filename = null) {
    name = `${name}`;
    if (!(isString(value) || isBuffer(value))) {
      value = `${value}`;
    }
    this.data[name] = [{name, value, filename}];
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/has
   * @param {String} name
   * @return {Boolean}
   */
  has(name) {
    return this.data[name] != null;
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/keys
   * @return {Iterator<String>}
   */
  *keys() {
    for (const key of Object.keys(this.data)) {
      yield key;
    }
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/values
   * @return {Iterator<(String|Buffer)>}
   */
  *values() {
    for (const value of Object.values(this.data).reduce((acc, curr) => {
      return acc.concat(curr.map((o) => {
        return o["value"];
      }));
    })) {
      yield value;
    }
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/entries
   * @return {Iterator<String, (String|Buffer)>}
   */
  *entries() {
    for (const entries of Object.entries(this.data).reduce((acc, curr) => {
      return acc.concat(curr[1].map((o) => {
        return [curr[0], o["value"]];
      }));
    })) {
      yield entries;
    }
  }

  /**
   * @description Get a buffer that can be written to http requests.
   * @return {Buffer}
   */
  getBuffer() {
    const array = [];
    for (const [name, values] of Object.entries(this.data)) {
      for (const o of values) {
        array.push(`\r\n--${this.boundary}\r\n`);
        array.push(`Content-Disposition: form-data; name="${name}"`);
        if (o["filename"] != null) {
          array.push(`; filename="${o["filename"]}"`);
        }
        array.push("\r\n\r\n");
        array.push(o["value"]);
      }
    }
    array.push(`\r\n--${this.boundary}--`);
    this.buffer = Buffer.concat(array.map(Buffer.from));
    return this.buffer;
  }

  /**
   * @description Get buffer length, you'd better call `getBuffer()` first.
   * @return {Number}
   */
  getLength() {
    if (this.buffer == null) {
      this.getBuffer();
    }
    return this.buffer.length;
  }

  /**
   * @description Get headers for buffer that can be past to http requests,
   * you'd better call `getBuffer()` first.
   * @return {Buffer}
   */
  getHeaders() {
    return {
      "Content-Type": `multipart/form-data; boundary=${this.boundary}`,
      "Transfer-Encoding": "chunked",
      "Content-Length": this.getLength()
    };
  }
}

/**
 * @param {String} url Target URL.
 * @param {Object} [headers]
 * @return {Promise<Buffer>}
 */
const get = (url, headers = {}) => {
  const opts = {
    "method": "GET",
    "timeout": 1500,
    "headers": {}
  };
  for (const [k, v] of Object.entries(headers)) {
    opts["headers"][k.toLowerCase()] = v;
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    const req = https.request(url, opts, (res) => {
      res.on("data", (chunk) => {
        chunks.push(chunk);
      });
      res.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
    }).on("error", reject);
    req.end();
  });
};

/**
 * @param {String} url Target URL.
 * @param {(String|Buffer|Object)} body Object will be JSON-serialized.
 * @param {Object} [headers]
 * @return {Promise<Buffer>}
 */
const post = (url, body, headers = {}) => {
  const opts = {
    "method": "POST",
    "timeout": 1500,
    "headers": {}
  };
  for (const [k, v] of Object.entries(headers)) {
    opts["headers"][k.toLowerCase()] = v;
  }
  if (!(isBuffer(body) || isString(body))) {
    body = JSON.stringify(body);
    opts["headers"]["content-type"] = "application/json";
    opts["headers"]["content-length"] = `${Buffer.byteLength(body)}`;
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    const req = https.request(url, opts, (res) => {
      res.on("data", (chunk) => {
        chunks.push(chunk);
      });
      res.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
    }).on("error", reject);
    req.write(body);
    req.end();
  });
};

/**
 * @param {Object} update Telegram update.
 * @return {String} A string which can be used as key.
 */
const perFromID = (update) => {
  if (update != null &&
      update["message"] != null &&
      update["message"]["from"] != null &&
      update["message"]["from"]["id"] != null) {
    return `${update["message"]["from"]["id"]}`;
  }
  return "0";
};

/**
 * @param {Object} update Telegram update.
 * @return {String} A string which can be used as key.
 */
const perChatID = (update) => {
  if (update != null &&
      update["message"] != null &&
      update["message"]["chat"] != null &&
      update["message"]["chat"]["id"] != null) {
    return `${update["message"]["chat"]["id"]}`;
  }
  return "0";
};

/**
 * @param {*} o
 * @return {Boolean}
 */
const isString = (o) => {
  return typeof (o) === "string" || o instanceof String;
};

/**
 * @param {*} o
 * @return {Boolean}
 */
const isArray = (o) => {
  return Array.isArray(o);
};

/**
 * @param {*} o
 * @return {Boolean}
 */
const isFunction = (o) => {
  return o instanceof Function;
};

/**
 * @param {*} o
 * @return {Boolean} Return `false` when `o == null`.
 */
const isObject = (o) => {
  return typeof (o) === "object" && o != null;
};

/**
 * @param {*} o
 * @return {Boolean}
 */
const isBuffer = (o) => {
  return Buffer.isBuffer(o);
};

/**
 * @param {*} o
 * @return {Boolean}
 */
const isFormData = (o) => {
  return o instanceof FormData;
};

/**
 * @description Replace camelCase to snake_case, e.g. `_ChatID` to `_chat_id`.
 * @param {String} camelCase
 * @return {String} snake_case of input.
 */
const toSnakeCase = (camelCase) => {
  // ['chatId', 'chatID', 'chat_ID', 'chat_id', 'chat__ID', 'chat_I_D', '_ChatID', 'chatID_', '_ID', 'ChatID'].map(toSnakeCase)
  return camelCase
    // CamelCase in line head is replaced by lower case.
    // This must be the first to escape from the 3rd regexp.
    // `Chat_id` to `chat_id`
    .replace(/^([A-Z]+)/g, (match, p1) => {
      return p1.toLowerCase();
    })
    // CamelCase after a underscore is replaced by lower case.
    // `chat_ID` to `chat_id`
    .replace(/(_[A-Z]+)/g, (match, p1) => {
      return p1.toLowerCase();
    })
    // CamelCase without a underscore and not in line head
    // is replaced by lower case with underscore.
    // `chatID` to `chat_id`
    .replace(/([A-Z]+)/g, (match, p1) => {
      return `_${p1.toLowerCase()}`;
    });
};

/**
 * @description Assign Objects into one Object which keys are all transfered
 * into snake_case.
 * @param {...Object}
 * @return {Object} Assigned snake_case Object.
 */
const toSnakeCaseObject = (...objects) => {
  const result = {};
  for (const object of objects) {
    for (const entry of Object.entries(object)) {
      // This does not work well with circular reference, but if you use
      // circular reference in API arguments, you are dead.
      result[toSnakeCase(entry[0])] =
        isObject(entry[1]) ? toSnakeCaseObject(entry[1]) : entry[1];
    }
  }
  return result;
};

/**
 * @description Assign Objects into one FormData which keys are all transfered
 * into snake_case.
 * @param {...Object}
 * @return {FormData} Assigned snake_case FormData.
 */
const toSnakeCaseFormData = (...objects) => {
  const formData = new FormData();
  for (const object of objects) {
    for (const entry of Object.entries(object)) {
      if (isObject(entry[1])) {
        // Append with a filename. We only handle file here, otherwise you
        // should not use FormData.
        formData.append(
          toSnakeCase(entry[0]),
          entry[1]["buffer"],
          entry[1]["filename"]
        );
      } else {
        formData.append(toSnakeCase(entry[0]), entry[1]);
      }
    }
  }
  return formData;
};

export {
  InputFile,
  InputMedia,
  InputMediaPhoto,
  InputMediaVideo,
  InputMediaAnimation,
  InputMediaAudio,
  InputMediaDocument,
  FormData,
  get,
  post,
  perFromID,
  perChatID,
  isString,
  isArray,
  isFunction,
  isObject,
  isBuffer,
  isFormData,
  toSnakeCase,
  toSnakeCaseObject,
  toSnakeCaseFormData
};