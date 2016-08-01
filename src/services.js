//@exclude
'use strict';
//@endexclude
(function () {

  /**
   * A base object to inherit from for make corbel-js requests with custom behavior.
   * @exports Services
   * @namespace
   * @extends corbel.Object
   * @memberof corbel
   */
  var Services = corbel.Services = corbel.Object.inherit({ //instance props

    /**
     * Creates a new Services
     * @memberof corbel.Services.prototype
     * @param  {string}                         id String with the asset id or `all` key
     * @return {corbel.Services}
     */
    constructor: function (driver) {
      this.driver = driver;
    },
    /**
     * Execute the actual ajax request.
     * Retries request with refresh token when credentials are needed.
     * Refreshes the client when a force update is detected.
     * Returns a server error (corbel.Services._FORCE_UPDATE_STATUS_CODE - unsupported_version) when force update max retries are reached
     *
     * @memberof corbel.Services.prototype
     * @param  {Promise} dfd     The deferred object to resolve when the ajax request is completed.
     * @param  {object} args    The request arguments.
     */
    request: function (args) {

      this.driver.trigger('service:request:before', args);

      var that = this;

      return this._requestWithRetries(args).then(function (response) {
        that.driver.trigger('service:request:after', response);
        that.driver.config.set(corbel.Services._UNAUTHORIZED_NUM_RETRIES, 0);
        return response;
      }).catch(function (error) {
        that.driver.trigger('service:request:after', error);
        that.driver.config.set(corbel.Services._UNAUTHORIZED_NUM_RETRIES, 0);
        throw error;
      });

    },

    _requestWithRetries: function (args) {
      var that = this;
      var maxRetries = corbel.Services._UNAUTHORIZED_MAX_RETRIES;
      var requestParameters = that._buildParams(args);

      return that._doRequest(requestParameters)
        .catch(function (response) {

          var retries = that.driver.config.get(corbel.Services._UNAUTHORIZED_NUM_RETRIES, 0);
          if (retries < maxRetries && response.status === corbel.Services._UNAUTHORIZED_STATUS_CODE) {

            //A 401 request within, refresh the token and retry the request.
            return that._refreshToken()
              .then(function () {

                that.driver.config.set(corbel.Services._UNAUTHORIZED_NUM_RETRIES, retries + 1);
                //@TODO: see if we need to upgrade the token to access assets.
                return that._requestWithRetries(args).catch(function (retryResponse) {
                  // rejects whole promise with the retry response
                  response = retryResponse;
                  throw response;
                });
              }).catch(function () {
                //Has failed refreshing, reject request
                console.log('corbeljs:services:token:refresh:fail');

                throw response;
              });

          } else {
            console.log('corbeljs:services:token:no_refresh', response.status);
            throw response;
          }

        });
    },

    /**
     * Internal request method.
     * Has force update behavior
     * @param  {object} params
     * @return {Promise}
     */
    _doRequest: function (params) {
      var that = this;
      return corbel.request.send(params, that.driver).then(function (response) {

        that.driver.config.set(corbel.Services._FORCE_UPDATE_STATUS, 0);
        that.driver.config.set(corbel.Services._UNAUTHORIZED_NUM_RETRIES, 0);

        return response;

      }).catch(function (response) {
        // Force update
        if (response.status === corbel.Services._FORCE_UPDATE_STATUS_CODE &&
          response.textStatus === corbel.Services._FORCE_UPDATE_TEXT) {

          var retries = that.driver.config.get(corbel.Services._FORCE_UPDATE_STATUS, 0);
          if (retries < corbel.Services._FORCE_UPDATE_MAX_RETRIES) {
            retries++;
            that.driver.config.set(corbel.Services._FORCE_UPDATE_STATUS, retries);

            that.driver.trigger('force:update', response);

            throw response;
          } else {
            throw response;
          }
        } else {
          throw response;
        }

      });
    },


    _refreshToken: function () {
      var tokenObject = this.driver.config.get(corbel.Iam.IAM_TOKEN, {});

      return this._refreshHandler(tokenObject);
    },
    /**
     * Default token refresh handler
     * Only requested once at the same time
     * @return {Promise}
     */
    _refreshHandler: function (tokenObject) {
      var that = this;

      if (this.driver._refreshHandlerPromise) {
        return this.driver._refreshHandlerPromise;
      }

      if (tokenObject.refreshToken) {
        console.log('corbeljs:services:token:refresh');
        this.driver._refreshHandlerPromise = this.driver.iam.token().refresh(
          tokenObject.refreshToken,
          this.driver.config.get(corbel.Iam.IAM_TOKEN_SCOPES, '')
        );

      } else {
        console.log('corbeljs:services:token:create');
        this.driver._refreshHandlerPromise = this.driver.iam.token().create();
      }

      return this.driver._refreshHandlerPromise
        .then(function (response) {
          that.driver.trigger('token:refresh', response.data);
          that.driver._refreshHandlerPromise = null;
          return response;
        }).catch(function (err) {
          that.driver._refreshHandlerPromise = null;
          throw err;
        });
    },

    /**
     * Add Authorization header with default tokenObject
     * @param {object} params request builded params
     */
    _addAuthorization: function (params) {
      var accessToken = params.accessToken ? params.accessToken : this.driver.config
        .get(corbel.Iam.IAM_TOKEN, {}).accessToken;

      if (accessToken && !params.headers.Authorization) {
        params.headers.Authorization = 'Bearer ' + accessToken;
        params.withCredentials = true;
      } else if (params.headers.Authorization) {
        params.withCredentials = true;
      }

      return params;
    },

    /**
     * Returns a valid corbel.request parameters with default values
     * and authorization params if needed.
     * By default, all request are json (dataType/contentType)
     * with object serialization support
     *
     * @memberof corbel.Services.prototype
     * @param  {object} args
     * @return {object}
     */
    _buildParams: function (args) {

      // Default values
      var defaults = {
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        dataFilter: corbel.Services.addEmptyJson,
        headers: {
          Accept: 'application/json'
        },
        method: corbel.request.method.GET
      };

      // do not modify args object
      var params = corbel.utils.defaults({}, args);
      params = corbel.utils.defaults(params, defaults);

      if (!params.url) {
        throw new Error('You must define an url');
      }

      if (params.query) {
        params.url += '?' + params.query;
      }

      if (params.noRedirect) {
        params.headers['No-Redirect'] = true;
      }

      if (params.Accept) {
        params.headers.Accept = params.Accept;
        params.dataType = undefined; // Accept & dataType are incompatibles
      }

      // set correct accept & contentType in case of blob
      // @todo: remove contentType+accept same-type constraint
      if (params.dataType === 'blob') {
        if (corbel.Config.isBrowser) {
          params.headers.Accept = params.data.type;
          params.contentType = params.data.type;
          params.dataType = undefined; // Accept & dataType are incompatibles
        }
      }

      params = this._addAuthorization(params);

      return corbel.utils.pick(params, ['url', 'dataType', 'contentType', 'method', 'headers', 'data', 'dataFilter', 'responseType', 'withCredentials', 'success', 'error', 'extras']);
    },

    /**
     * @memberof corbel.Services.prototype
     * @return {string}
     */
    _buildUri: function () {

      var uri = '';
      if (this.urlBase.slice(-1) !== '/') {
        uri += '/';
      }

      Array.prototype.slice.call(arguments).forEach(function (argument) {
        if (argument) {
          uri += argument + '/';
        }
      });

      // remove last '/'
      uri = uri.slice(0, -1);

      return this.urlBase + uri;
    }

  }, {

    /**
     * _FORCE_UPDATE_TEXT constant
     * @constant
     * @memberof corbel.Services
     * @type {string}
     * @default
     */
    _FORCE_UPDATE_TEXT: 'unsupported_version',

    /**
     * _FORCE_UPDATE_MAX_RETRIES constant
     * @constant
     * @memberof corbel.Services
     * @type {number}
     * @default
     */
    _FORCE_UPDATE_MAX_RETRIES: 3,

    /**
     * _FORCE_UPDATE_STATUS constant
     * @constant
     * @memberof corbel.Services
     * @type {string}
     * @default
     */
    _FORCE_UPDATE_STATUS: 'fu_r',

    /**
     * _FORCE_UPDATE_STATUS_CODE constant
     * @constant
     * @memberof corbel.Services
     * @type {number}
     * @default
     */
    _FORCE_UPDATE_STATUS_CODE: 403,

    /**
     * _UNAUTHORIZED_MAX_RETRIES constant
     * @constant
     * @memberof corbel.Services
     * @type {number}
     * @default
     */
    _UNAUTHORIZED_MAX_RETRIES: 1,

    /**
     * _UNAUTHORIZED_NUM_RETRIES constant
     * @constant
     * @memberof corbel.Services
     * @type {string}
     * @default
     */
    _UNAUTHORIZED_NUM_RETRIES: 'un_r',
    /**
     * _UNAUTHORIZED_STATUS_CODE constant
     * @constant
     * @memberof corbel.Services
     * @type {number}
     * @default
     */
    _UNAUTHORIZED_STATUS_CODE: 401,

    /**
     * Extract a id from the location header of a requestXHR
     * @memberof corbel.Services
     * @param  {Promise} responseObject response from a requestXHR
     * @return {String}  id from the Location
     */
    getLocationId: function (responseObject) {
      var location = this._getLocationHeader(responseObject);
      return location ? location.substr(location.lastIndexOf('/') + 1) : undefined;
    },
    /**
     * Extracts the entire location header
     * @param {Promise} responseObject response from a requestXHR
     * @returns {String} location header content
     */
    getLocation: function (responseObject) {
      return this._getLocationHeader(responseObject);
    },
    /**
     * Extracts the location header
     * @param {Promise} responseObject response from a requestXHR
     * @returns {String} location header content
     * @private
     */
    _getLocationHeader: function (responseObject) {
      responseObject = responseObject || {};

      if (responseObject.xhr) {
        return responseObject.xhr.getResponseHeader('Location');
      } else if (responseObject.response && responseObject.response.headers.location) {
        return responseObject.response.headers.location;
      }
    },

    /**
     * @memberof corbel.Services
     * @param {mixed} response
     * @param {string} type
     * @return {midex}
     */
    addEmptyJson: function (response, type) {
      if (!response && type === 'json') {
        response = '{}';
      }
      return response;
    }
  });

  return Services;

})();
