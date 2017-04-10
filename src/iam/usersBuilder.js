//@exclude
// jshint unused: false
'use strict';
//@endexclude

(function() {

    /**
     * Starts a user request
     * @param  {string} [id=id|'me'] Id of the user to perform the request
     * @return {corbel.Iam.UserBuilder|corbel.Iam.UserMeBuilder}    The builder to create the request
     */
     corbel.Iam.prototype.user = function(id) {
         var builder;

         if (id === 'me') {
           builder = new UserBuilder('me');
         }
         else if (id) {
             builder = new UserBuilder(id);
         } else {
             builder = new UserMeBuilder('me');
         }

         builder.driver = this.driver;
         return builder;
     };

     /**
      * Starts a users request
      * @return {corbel.Iam.UserBuilder|corbel.Iam.UsersBuilder}    The builder to create the request
      */
     corbel.Iam.prototype.users = function() {
         var builder =  new UsersBuilder();

         builder.driver = this.driver;
         return builder;
     };

    /**
     * getUser mixin for UserBuilder & UsersBuilder
     * @param  {string} uri
     * @param  {string} id
     * @param  {Bolean} postfix
     * @return {Promise}
     */
    corbel.Iam._getUser = function(method, uri, id, postfix) {
        var url = (postfix ? this._buildUriWithDomain(uri, id) + postfix : this._buildUriWithDomain(uri, id));
        return this.request({
            url: url,
            method: corbel.request.method.GET
        });
    };

    /**
     * Builder for a specific user requests
     * @class
     * @memberOf iam
     * @param {string} id The id of the user
     */
    var CommonUserBuilder = corbel.Iam.CommonUserBuilder = corbel.Services.inherit({

        constructor: function(id) {
            this.uri = 'user';
            this.id = id;
        },

        /**
         * Gets the user
         * @method
         * @memberOf corbel.Iam.UserBuilder
         * @return {Promise}  Q promise that resolves to a User {Object} or rejects with a {@link corbelError}
         */
        get: function() {
            console.log('iamInterface.user.get');
            corbel.validate.value('id', this.id);
            return this._getUser(corbel.request.method.GET, this.uri, this.id);
        },

        /**
         * Updates the user
         * @method
         * @memberOf corbel.Iam.UserBuilder
         * @param  {Object} options Request options (e.g accessToken) - Optional
         * @return {Promise}        Q promise that resolves to undefined (void) or rejects with a {@link corbelError}
         */
        _update: function(data, options) {
            console.log('iamInterface.user.update', data);
            corbel.validate.value('id', this.id);
            var args = corbel.utils.extend(options || {}, {
                url: this._buildUriWithDomain(this.uri, this.id),
                method: corbel.request.method.PUT,
                data: data
            });
            return this.request(args);
        },

        /**
         * Deletes the user
         * @method
         * @memberOf corbel.Iam.UserBuilder
         * @return {Promise}  Q promise that resolves to undefined (void) or rejects with a {@link corbelError}
         */
        _delete: function() {
            console.log('iamInterface.user.delete');
            corbel.validate.value('id', this.id);
            return this.request({
                url: this._buildUriWithDomain(this.uri, this.id),
                method: corbel.request.method.DELETE
            });
        },

        /**
         * Sign Out the logged user.
         * @example
         * iam().user('me').signOut();
         * @method
         * @memberOf corbel.Iam.UsersBuilder
         * @return {Promise} Q promise that resolves to a User {Object} or rejects with a {@link corbelError}
         */
        _signOut: function() {
            console.log('iamInterface.users.signOutMe');
            corbel.validate.value('id', this.id);
            return this.request({
                url: this._buildUriWithDomain(this.uri, this.id) + '/signout',
                method: corbel.request.method.PUT
            });
        },

        /**
         * disconnect the user, all his tokens are deleted
         * @method
         * @memberOf corbel.Iam.UserBuilder
         * @return {Promise}  Q promise that resolves to undefined (void) or rejects with a {@link corbelError}
         */
        _disconnect: function() {
            console.log('iamInterface.user.disconnect');
            corbel.validate.value('id', this.id);
            return this.request({
                url: this._buildUriWithDomain(this.uri, this.id) + '/disconnect',
                method: corbel.request.method.PUT
            });
        },

        /**
         * retrieves current user session.
         * @method
         * @memberOf corbel.Iam.UserBuilder
         * @return {Promise}  Q promise that resolves to undefined (void) or rejects with a {@link corbelError}
         */
        _getSession: function() {
            console.log('iamInterface.user.get.session');
            corbel.validate.value('id', this.id);
            return this.request({
                url: this._buildUriWithDomain(this.uri, this.id) + '/session',
                method: corbel.request.method.GET
            });
        },


        /**
         * close all users sessions. All access token are deleted.
         * @method
         * @memberOf corbel.Iam.UserBuilder
         * @return {Promise}  Q promise that resolves to undefined (void) or rejects with a {@link corbelError}
         */
        _closeSessions: function() {
            console.log('iamInterface.user.close.sessions');
            corbel.validate.value('id', this.id);
            return this.request({
                url: this._buildUriWithDomain(this.uri, this.id) + '/session',
                method: corbel.request.method.DELETE
            });
        },

        /**
         * Adds an identity (link to an oauth server or social network) to the user
         * @method
         * @memberOf corbel.Iam.UserBuilder
         * @param {Object} identity     The data of the identity
         * @param {string} oauthId      The oauth ID of the user
         * @param {string} oauthService The oauth service to connect (facebook, twitter, google, corbel)
         * @return {Promise}  Q promise that resolves to undefined (void) or rejects with a {@link corbelError}
         */
        addIdentity: function(identity) {
            corbel.validate.isValue(identity, 'Missing identity');
            corbel.validate.value('id', this.id);
            console.log('iamInterface.user.addIdentity', identity);
            return this.request({
                url: this._buildUriWithDomain(this.uri, this.id) + '/identity',
                method: corbel.request.method.POST,
                data: identity
            });
        },

        /**
         * Get user identities (links to oauth servers or social networks)
         * @method
         * @memberOf corbel.Iam.UserBuilder
         * @return {Promise}  Q promise that resolves to {Array} of Identity or rejects with a {@link corbelError}
         */
        _getIdentities: function() {
            console.log('iamInterface.user.getIdentities');
            corbel.validate.value('id', this.id);
            return this.request({
                url: this._buildUriWithDomain(this.uri, this.id) + '/identity',
                method: corbel.request.method.GET
            });
        },

        /**
          * User device register
          * @method
          * @memberOf corbel.Iam.UserBuilder
          * @param  {string} deviceId  The device id
          * @param  {Object} data      The device data
          * @param  {Object} data.URI  The device token
          * @param  {Object} data.name The device name
          * @param  {Object} data.type The device type (ANDROID, APPLE, WEB)
          * @return {Promise} Q promise that resolves to a User {Object} or rejects with a {@link corbelError}
          */
         _registerDevice: function(deviceId, data) {
            console.log('iamInterface.user.registerDevice');
            corbel.validate.values(['id', 'deviceId'], {
                'id':this.id,
                'deviceId': deviceId
            });
            return this.request({
                url: this._buildUriWithDomain(this.uri, this.id) + '/device/' + deviceId,
                method: corbel.request.method.PUT,
                data: data
            }).then(function(res) {
                return corbel.Services.getLocationId(res);
            });
         },

         /**
          * Get device
          * @method
          * @memberOf corbel.Iam.UserBuilder
          * @param  {string}  deviceId    The device id
          * @return {Promise} Q promise that resolves to a Device {Object} or rejects with a {@link corbelError}
          */
         _getDevice: function(deviceId) {
            console.log('iamInterface.user.getDevice');
            corbel.validate.values(['id', 'deviceId'], {
                'id':this.id,
                'deviceId': deviceId
            });
            return this.request({
                url: this._buildUriWithDomain(this.uri, this.id) + '/device/' + deviceId,
                method: corbel.request.method.GET
            });
         },

         /**
          * Get all user devices
          * @method
          * @memberOf corbel.Iam.UserBuilder
          * @return {Promise} Q promise that resolves to a Device {Object} or rejects with a {@link corbelError}
          */
         _getDevices: function(params) {
            console.log('iamInterface.user.getDevices', params);
            corbel.validate.value('id', this.id);
            return this.request({
                url: this._buildUriWithDomain(this.uri, this.id) + '/device',
                method: corbel.request.method.GET,
                query: params ? corbel.utils.serializeParams(params) : null
            });
         },

         /**
          * Delete user device
          * @method
          * @memberOf corbel.Iam.UserBuilder
          * @param  {string}  deviceId    The device id
          * @return {Promise} Q promise that resolves to a Device {Object} or rejects with a {@link corbelError}
          */
         _deleteDevice: function(deviceId) {
             console.log('iamInterface.user.deleteDevice');
             corbel.validate.values(['id', 'deviceId'], {
                 'id':this.id,
                 'deviceId': deviceId
             });
             return this.request({
                 url: this._buildUriWithDomain(this.uri, this.id) + '/device/' + deviceId,
                 method: corbel.request.method.DELETE
             });
         },

         /**
          * Get user profiles
          * @method
          * @memberOf corbel.Iam.UserBuilder
          * @return {Promise}  Q promise that resolves to a User Profile or rejects with a {@link corbelError}
          */
        _getProfile: function() {
            console.log('iamInterface.user.getProfile');
            corbel.validate.value('id', this.id);
            return this.request({
                url: this._buildUriWithDomain(this.uri, this.id) + '/profile',
                method: corbel.request.method.GET
            });
        },

        /**
         * Add groups to the user
         * @method
         * @memberOf iam.UserBuilder
         * @param {Object} groups     The data of the groups
         * @return {Promise}  Q promise that resolves to undefined (void) or rejects with a {@link SilkRoadError}
         */
        addGroups: function(groups) {
            console.log('iamInterface.user.addGroups');
            corbel.validate.value('id', this.id);
            return this.request({
                url: this._buildUriWithDomain(this.uri, this.id) + '/group',
                method: corbel.request.method.PUT,
                data: groups
            });
        },

        /**
         * Delete group to user
         * @method
         * @memberOf iam.UserBuilder
         * @param {Object} groups     The data of the groups
         * @return {Promise}  Q promise that resolves to undefined (void) or rejects with a {@link SilkRoadError}
         */
        _deleteGroup: function(group) {
            console.log('iamInterface.user.deleteGroup');
            corbel.validate.values(['id', 'group'], {
                'id':this.id,
                'group': group
            });
            return this.request({
                url: this._buildUriWithDomain(this.uri, this.id) + '/group/'+group,
                method: corbel.request.method.DELETE
            });
        },

        /**
         * Sends a email to the logged user or user to validate his email address
         * @method
         * @memberOf iam.UsersBuilder
         *
         * @return {Promise}  Q promise that resolves to undefined (void) or rejects with a {@link CorbelError}
         */
        _sendValidateEmail: function () {
            console.log('iamInterface.user.sendValidateEmail');
            corbel.validate.value('id', this.id);

            return this.request({
                url: this._buildUriWithDomain(this.uri, this.id) + '/validateEmail',
                method: corbel.request.method.GET
            });
        },

        _buildUriWithDomain: corbel.Iam._buildUriWithDomain,
        _getUser: corbel.Iam._getUser,

    });

    var UserBuilder = corbel.Iam.CommonUserBuilder.inherit({
        deleteGroup : function(){
            return this._deleteGroup.apply(this, arguments);
        },
        update : function(){
            return this._update.apply(this, arguments);
        },
        delete :function(){
             return this._delete.apply(this, arguments);
        },
        registerDevice : function(){
             return this._registerDevice.apply(this, arguments);
        },
        getDevices : function(){
             return this._getDevices.apply(this, arguments);
        },
        getDevice : function(){
             return this._getDevice.apply(this, arguments);
        },
        deleteDevice : function(){
             return this._deleteDevice.apply(this, arguments);
        },
        signOut : function(){
             return this._signOut.apply(this, arguments);
        },
        disconnect : function(){
             return this._disconnect.apply(this, arguments);
        },
        closeSessions : function(){
             return this._closeSessions.apply(this, arguments);
        },
        getIdentities :function(){
             return this._getIdentities.apply(this, arguments);
        },
        getProfile : function(){
             return this._getProfile.apply(this, arguments);
        },
        sendValidateEmail : function(){
             return this._sendValidateEmail.apply(this, arguments);
        },
    });

    var UserMeBuilder = corbel.Iam.CommonUserBuilder.inherit({
        deleteMyGroup : function(){
            return this._deleteGroup.apply(this, arguments);
        },
        updateMe : function(){
            return this._update.apply(this, arguments);
        },
        deleteMe :function(){
             return this._delete.apply(this, arguments);
        },
        registerMyDevice :function(){
             return this._registerDevice.apply(this, arguments);
        },
        getMyDevices :function(){
             return this._getDevices.apply(this, arguments);
        },
        getMyDevice :function(){
             return this._getDevice.apply(this, arguments);
        },
        getMySession : function(){
            return this._getSession.apply(this, arguments);
        },
        deleteMyDevice :function(){
             return this._deleteDevice.apply(this, arguments);
        },
        signOutMe :function(){
             return this._signOut.apply(this, arguments);
        },
        disconnectMe :function(){
             return this._disconnect.apply(this, arguments);
        },
        closeSessionsMe :function(){
             return this._closeSessions.apply(this, arguments);
        },
        getMyIdentities :function(){
             return this._getIdentities.apply(this, arguments);
        },
        getMyProfile : function(){
             return this._getProfile.apply(this, arguments);
        },
        sendMyValidateEmail :function(){
             return this._sendValidateEmail.apply(this, arguments);
        },
    });

    /**
     * Builder for creating requests of users collection
     * @class
     * @memberOf iam
     */
     var UsersBuilder = corbel.Iam.UsersBuilder = corbel.Services.inherit({

        constructor: function() {
            this.uri = 'user';
        },

        /**
         * Sends a reset password email to the email address recived.
         * @method
         * @memberOf iam.UsersBuilder
         * @param  {string} userEmailToReset The email to send the message
         * @param  {Object} options Request options (e.g accessToken) - Optional
         * @return {Promise}                 Q promise that resolves to undefined (void) or rejects with a {@link corbelError}
         */
        sendResetPasswordEmail: function(userEmailToReset, options) {
            console.log('iamInterface.users.sendResetPasswordEmail', userEmailToReset);
            var query = 'email=' + encodeURIComponent(userEmailToReset);
            var args = corbel.utils.extend(options || {}, {
                url: this._buildUriWithDomain(this.uri + '/resetPassword'),
                method: corbel.request.method.GET,
                query: query
            });
            return this.request(args);
        },

        /**
         * Validates the email of a user or the logged user
         * @method
         * @memberOf iam.UsersBuilder
         *
         * @return {Promise}  Q promise that resolves to undefined (void) or rejects with a {@link CorbelError}
         */
        emailConfirmation: function () {
            console.log('iamInterface.users.emailConfirmation');
            return this.request({
                url: this._buildUriWithDomain(this.uri + '/emailConfirmation'),
                method: corbel.request.method.PUT
            });
        },

        /**
         * Creates a new user.
         * @method
         * @memberOf corbel.Iam.UsersBuilder
         * @param  {Object} data The user data.
         * @param  {Object} options Request options (e.g accessToken) - Optional
         * @return {Promise}     A promise which resolves into the ID of the created user or fails with a {@link corbelError}.
         */
        create: function(data, options) {
            console.log('iamInterface.users.create', data);
            var args = corbel.utils.extend(options || {}, {
                url: this._buildUriWithDomain(this.uri),
                method: corbel.request.method.POST,
                data: data
            });
            return this.request(args).then(function(res) {
                return corbel.Services.getLocationId(res);
            });
        },

        /**
         * Gets all users of the current domain
         * @method
         * @memberOf corbel.Iam.UsersBuilder
         * @return {Promise} Q promise that resolves to an {Array} of Users or rejects with a {@link corbelError}
         */
        get: function(params) {
            console.log('iamInterface.users.get', params);
            return this.request({
                url: this._buildUriWithDomain(this.uri),
                method: corbel.request.method.GET,
                query: params ? corbel.utils.serializeParams(params) : null
            });
        },

        getProfiles: function(params) {
            console.log('iamInterface.users.getProfiles', params);
            return this.request({
                url: this._buildUriWithDomain(this.uri) + '/profile',
                method: corbel.request.method.GET,
                query: params ? corbel.utils.serializeParams(params) : null //TODO cambiar por util e implementar dicho metodo
            });
        },

        _buildUriWithDomain: corbel.Iam._buildUriWithDomain

    });
})();
