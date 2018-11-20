//@exclude
'use strict';
//@endexclude

(function() {

    /**
     * A module to make iam requests.
     * @exports iam
     * @namespace
     * @memberof app.corbel
     */

    var Iam = corbel.Iam = function(driver) {
        this.driver = driver;
    };

    Iam.moduleName = 'iam';
    Iam.defaultPort = 8082;

    Iam.create = function(driver) {
        return new Iam(driver);
    };

    Iam.GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
    Iam.AUD = 'http://iam.corbel.io';
    Iam.IAM_TOKEN = 'iamToken';
    Iam.IAM_TOKEN_SCOPES = 'iamScopes';
    Iam.IAM_DOMAIN = 'domain';

    /**
     * COMMON MIXINS
     */

    /**
     * Private method to build a string uri
     * @private
     * @param  {String} uri
     * @param  {String|Number} id
     * @return {String}
     */
    Iam._buildUri = function(uri, id) {
        if (id) {
            uri += '/' + id;
        }

        var urlBase =  this.driver.config.getCurrentEndpoint(Iam.moduleName, corbel.Iam._buildPort(this.driver.config));

        return urlBase + uri;
    };
    
    /**
     * Private method to build a string uri with domain
     * @private
     * @param  {String} uri
     * @param  {String|Number} id
     * @return {String}
     */
    Iam._buildUriWithDomain = function(uri, id) {

        var urlBase =  this.driver.config.getCurrentEndpoint(Iam.moduleName, corbel.Iam._buildPort(this.driver.config));

        var domain = this.driver.config.get(corbel.Iam.IAM_DOMAIN, 'unauthenticated');
        var customDomain = this.driver.config.get(corbel.Domain.CUSTOM_DOMAIN, domain);
            
        this.driver.config.set(corbel.Domain.CUSTOM_DOMAIN, undefined);

        var uriWithDomain = urlBase + customDomain + '/' + uri;

        if (id) {
            uriWithDomain += '/' + id;
        }

        return uriWithDomain;        
    };

    Iam._buildPort = function(config) {
      return config.get('iamPort', null) || corbel.Iam.defaultPort;
    };

})();
