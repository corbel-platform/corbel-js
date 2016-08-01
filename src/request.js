//@exclude
'use strict';
//@endexclude

(function () {

  /**
   * Request object available for brwoser and node environment
   * @exports request
   * @namespace
   * @memberof corbel
   */
  var request = corbel.request = {
    /**
     * method constants
     * @namespace
     */
    method: {

      /**
       * GET constant
       * @constant
       * @type {string}
       * @default
       */
      GET: 'GET',
      /**
       * @constant
       * @type {string}
       * @default
       */
      POST: 'POST',
      /**
       * @constant
       * @type {string}
       * @default
       */
      PUT: 'PUT',
      /**
       * @constant
       * @type {string}
       * @default
       */
      DELETE: 'DELETE',
      /**
       * @constant
       * @type {string}
       * @default
       */
      OPTIONS: 'OPTIONS',
      /**
       * @constant
       * @type {string}
       * @default
       */
      PATCH: 'PATCH',
      /**
       * @constant
       * @type {string}
       * @default
       */
      HEAD: 'HEAD'
    }
  };

  /**
   * Serialize handlers
   * @namespace
   */
  request.serializeHandlers = {
    /**
     * JSON serialize handler
     * @param  {object} data
     * @return {string}
     */
    json: function (data, cb) {
      if (typeof data !== 'string') {
        cb(JSON.stringify(data));
      } else {
        cb(data);
      }
    },
    /**
     * Form serialize handler
     * @param  {object} data
     * @return {string}
     */
    'form-urlencoded': function (data, cb) {
      cb(corbel.utils.toURLEncoded(data));
    },
    /**
     * dataURI serialize handler
     * @param  {object} data
     * @return {string}
     */
    dataURI: function (data, cb) {
      if (corbel.Config.isNode) {
        // in node transform to stream
        cb(corbel.utils.toURLEncoded(data));
      } else {
        // in browser transform to blob
        cb(corbel.utils.dataURItoBlob(data));
      }
    },
    /**
     * blob serialize handler
     * @param  {object} data
     * @return {ArrayBuffer || Blob}
     */
    blob: function (data, cb) {
      if (data instanceof ArrayBuffer) {
        throw new Error('ArrayBuffer is not supported, please use Blob');
      } else {
        cb(data);
      }
    },
    /**
     * stream serialize handler
     * @param  {object || string} data
     * @return {UintArray}
     */
    stream: function (data, cb) {
      if (data instanceof ArrayBuffer) {
        throw new Error('ArrayBuffer is not supported, please use Blob, File, Stream or ArrayBufferView');
      } else {
        cb(data);
      }
    }
  };

  /**
   * Serialize hada with according contentType handler
   * returns data if no handler available
   * @param  {mixed} data
   * @param  {string} contentType
   * @return {Mixed}
   */
  request.serialize = function (data, contentType, cb) {
    var contentTypeSerializable = Object.keys(request.serializeHandlers).filter(function (type) {
      if (contentType.indexOf(type) !== -1) {
        return type;
      }
    });

    if (contentTypeSerializable.length > 0) {
      request.serializeHandlers[contentTypeSerializable[0]](data, cb);
    } else {
      cb(data);
    }
  };

  /**
   * Parse handlers
   * @namespace
   */
  request.parseHandlers = {
    /**
     * JSON parse handler
     * @param  {string} data
     * @return {mixed}
     */
    json: function (data) {
      data = data || '{}';
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      return data;
    }
    // 'blob' type do not require any process
    // @todo: xml
  };

  /**
   * Process the server response data to the specified object/array/blob/byteArray/text
   * @param  {mixed} data                             The server response
   * @param  {string} type='array'|'blob'|'json'      The class of the server response
   * @param  {Stirng} dataType                        Is an extra param to form the blob object (if the type is blob)
   * @return {mixed}                                  Processed data
   */
  request.parse = function (data, responseType, dataType) {
    var parsed;
    Object.keys(request.parseHandlers).forEach(function (type) {
      if (responseType && responseType.indexOf(type) !== -1) {
        parsed = request.parseHandlers[type](data, dataType);
      }
    });
    parsed = parsed || data;
    return parsed;
  };

  function doRequest(module, params, resolver) {
    if (corbel.Config.isBrowser) {
      //browser
      request._browserAjax.call(module, params, resolver);
    } else {
      //nodejs
      request._nodeAjax.call(module, params, resolver);
    }
  }

  /**
   * Public method to make ajax request
   * @param  {object} options                                     Object options for ajax request
   * @param  {string} options.url                                 The request url domain
   * @param  {string} options.method                              The method used for the request
   * @param  {object} options.headers                             The request headers
   * @param  {string} options.responseType                        The response type of the body: `blob` | `undefined`
   * @param  {string} options.contentType                         The content type of the body
   * @param  {boolean} options.withCredentials                    If is needed to set or send cookies
   * @param  {object | uint8array | blob} options.dataType        Optional data sent to the server
   * @param  {function} options.success                           Callback function for success request response
   * @param  {function} options.error                             Callback function for handle error in the request
   * @return {Promise}                                        Promise about the request status and response
   */
  request.send = function (options, driver) {
    options = options || {};
    var module = this;

    if (!options.url) {
      throw new Error('undefined:url');
    }

    if (typeof (options.url) !== 'string') {
      throw new Error('invalid:url', options.url);
    }

    options.withCredentials = typeof options.withCredentials === 'boolean' ? options.withCredentials : true;

    var params = {
      method: options.method || request.method.GET,
      url: options.url,
      headers: typeof options.headers === 'object' ? options.headers : {},
      callbackExtras: options.extras,
      callbackSuccess: options.success && typeof options.success === 'function' ? options.success : undefined,
      callbackError: options.error && typeof options.error === 'function' ? options.error : undefined,
      responseType: options.responseType,
      withCredentials: options.withCredentials,
      useCookies: options.useCookies || false
    };

    params = rewriteRequestToPostIfUrlLengthIsTooLarge(options, params);

    // default content-type
    params.headers['content-type'] = options.contentType || 'application/json';

    var dataMethods = [request.method.PUT, request.method.POST, request.method.PATCH];

    var resolver;
    var promise = new Promise(function (resolve, reject) {
      resolver = {
        resolve: resolve,
        reject: reject
      };

      if (driver) {
        driver.trigger('request', params);
      }
    });

    if (dataMethods.indexOf(params.method) !== -1) {
      request.serialize(options.data, params.headers['content-type'], function (serialized) {
        params.data = serialized;
        doRequest(module, params, resolver);
      });
    } else {
      doRequest(module, params, resolver);
    }

    return promise;
  };

  var xhrSuccessStatus = {
    // file protocol always yields status code 0, assume 200
    0: 200,
    // Support: IE9
    // #1450: sometimes IE returns 1223 when it should be 204
    1223: 204
  };

  /**
   * Process server response
   * @param  {object} response
   * @param  {object} resolver
   * @param  {function} callbackSuccess
   * @param  {function} callbackError
   */
  var processResponse = function (response, resolver, callbackSuccess, callbackError) {

    //xhr = xhr.target || xhr || {};
    var statusCode = xhrSuccessStatus[response.status] || response.status,
      statusType = Number(response.status.toString()[0]),
      promiseResponse;

    var data = response.response;
    var headers = corbel.utils.keysToLowerCase(response.headers);

    if (statusType <= 3 && !response.error) {

      if (response.response) {
        data = request.parse(response.response, response.responseType, response.dataType);
      }

      if (callbackSuccess) {
        callbackSuccess.call(this, data, statusCode, response.responseObject, headers);
      }

      promiseResponse = {
        data: data,
        status: statusCode,
        headers: headers
      };

      promiseResponse[response.responseObjectType] = response.responseObject;

      resolver.resolve(promiseResponse);
    } else {

      var disconnected = response.error && response.status === 0;
      statusCode = disconnected ? 0 : statusCode;

      if (callbackError) {
        callbackError.call(this, response.error, statusCode, response.responseObject, headers);
      }

      if (response.response) {
        data = request.parse(response.response, response.responseType, response.dataType);
      }

      promiseResponse = {
        data: data,
        status: statusCode,
        error: response.error,
        headers: headers
      };

      promiseResponse[response.responseObjectType] = response.responseObject;

      resolver.reject(promiseResponse);
    }
  };

  var rewriteRequestToPostIfUrlLengthIsTooLarge = function (options, params) {
    var AUTOMATIC_HTTP_METHOD_OVERRIDE = corbel.Config.AUTOMATIC_HTTP_METHOD_OVERRIDE || true;
    var HTTP_METHOD_OVERRIDE_WITH_URL_SIZE_BIGGER_THAN = corbel.Config.HTTP_METHOD_OVERRIDE_WITH_URL_SIZE_BIGGER_THAN || 2048;

    if (AUTOMATIC_HTTP_METHOD_OVERRIDE &&
      params.method === request.method.GET &&
      params.url.length > HTTP_METHOD_OVERRIDE_WITH_URL_SIZE_BIGGER_THAN) {
      var url = params.url.split('?');
      params.method = request.method.POST;
      params.headers['X-HTTP-Method-Override'] = request.method.GET;
      params.url = url[0];
      options.data = encodeUrlToForm(url[1]);
      options.contentType = 'application/x-www-form-urlencoded';
    }
    return params;
  };

  var encodeUrlToForm = function (url) {
    var form = {};
    url.split('&').forEach(function (formEntry) {
      var formPair = formEntry.split('=');
      //value require double encode in Override Method Filter
      form[formPair[0]] = formPair[1];
    });
    return form;
  };

  request._getNodeRequestAjax = function (params) {
    var requestAjax = require('request');
    if (request.isCrossDomain(params.url) && params.withCredentials && params.useCookies) {
      requestAjax = requestAjax.defaults({
        jar: true
      });
    }
    return requestAjax;
  };

  request._getNodeRequestCallback = function (context, params, resolver) {
    return function (error, response, body) {
      var responseType;
      var status;
      if (error) {
        responseType = undefined;
        status = 0;
      } else {
        responseType = response.responseType || response.headers['content-type'];
        status = response.statusCode;
      }

      processResponse.call(context, {
        responseObject: response,
        dataType: params.dataType,
        responseType: responseType,
        response: body,
        status: status,
        headers: response ? response.headers : {},
        responseObjectType: 'response',
        error: error
      }, resolver, params.callbackSuccess, params.callbackError);

    };
  };

  request._nodeAjax = function (params, resolver) {
    var requestAjax = request._getNodeRequestAjax(params);

    var requestOptions = {
      method: params.method,
      url: params.url,
      headers: params.headers,
    };

    var data = params.data || '';

    var callbackRequest = request._getNodeRequestCallback(this, params, resolver);

    if (corbel.utils.isStream(data)) {
      data.pipe(requestAjax(requestOptions, callbackRequest));
    } else {
      requestOptions.body = data;
      requestAjax(requestOptions, callbackRequest);
    }


  };

  /**
   * Check if an url should be process as a crossdomain resource.
   * @param {string} url
   * @return {Boolean}
   */
  request.isCrossDomain = function (url) {
    if (url && typeof (url) === 'string' && url.indexOf('http') !== -1) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * https://gist.github.com/monsur/706839
   * @param  {string} headerStr Headers in string format as returned in xhr.getAllResponseHeaders()
   * @return {Object}
   */
  request._parseResponseHeaders = function (headerStr) {
    var headers = {};
    if (!headerStr) {
      return headers;
    }
    var headerPairs = headerStr.split('\u000d\u000a');
    for (var i = 0; i < headerPairs.length; i++) {
      var headerPair = headerPairs[i];
      // Can't use split() here because it does the wrong thing
      // if the header value has the string ": " in it.
      var index = headerPair.indexOf('\u003a\u0020');
      if (index > 0) {
        var key = headerPair.substring(0, index);
        var val = headerPair.substring(index + 2);
        headers[key] = val;
      }
    }
    return headers;
  };

  request._browserAjax = function (params, resolver) {
    var httpReq = new XMLHttpRequest();

    httpReq.open(params.method, params.url, true);

    if (request.isCrossDomain(params.url) && params.withCredentials) {
      httpReq.withCredentials = true;
    }

    /* add request headers */
    for (var header in params.headers) {
      if (params.headers.hasOwnProperty(header)) {
        httpReq.setRequestHeader(header, params.headers[header]);
      }
    }

    // 'blob' support
    httpReq.responseType = params.responseType || httpReq.responseType;

    httpReq.onload = function (xhr) {
      xhr = xhr || httpReq;
      xhr = xhr.target || xhr; // only for mock testing purpose

      processResponse.call(this, {
        responseObject: xhr,
        dataType: xhr.dataType,
        responseType: xhr.responseType || xhr.getResponseHeader('content-type'),
        response: xhr.response || xhr.responseText,
        status: xhr.status,
        headers: request._parseResponseHeaders(xhr.getAllResponseHeaders()),
        responseObjectType: 'xhr',
        error: xhr.error
      }, resolver, params.callbackSuccess, params.callbackError);

      //delete callbacks
    }.bind(this);

    //response fail ()
    httpReq.onerror = function (xhr) {
      xhr = xhr || httpReq;
      xhr = xhr.target || xhr; // only for fake sinon response xhr

      var error = xhr.error ? xhr.error : true;

      processResponse.call(this, {
        responseObject: xhr,
        dataType: xhr.dataType,
        responseType: xhr.responseType || xhr.getResponseHeader('content-type'),
        response: xhr.response || xhr.responseText,
        status: xhr.status,
        responseObjectType: 'xhr',
        error: error
      }, resolver, params.callbackSuccess, params.callbackError);

    }.bind(this);

    if (params.callbackExtras) {
      if (params.callbackExtras.requestCallback) {
        params.callbackExtras.requestCallback(httpReq);
      }
      if (params.callbackExtras.progressCallback) {
        httpReq.upload.onprogress = params.callbackExtras.progressCallback;
      }
    }

    if (params.data) {
      httpReq.send(params.data);
    } else {
      //IE fix, send nothing (not null or undefined)
      httpReq.send();
    }

  };

  return request;

})();
