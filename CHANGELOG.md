
# Changelog

### v0.6.0 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.5.0...v0.6.0)
 
#### Features

- EC admin interface
- Relations now accepts mediaType

#### Fix

- React native does not define window.location
- Atob to base 64
- Some browsers not define xhr onLoad onError


### v0.5.0 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.4.0...v0.5.0)

#### Breaking changes

- [Corbel] Review IAM plural endpoints 
    - `/sessions` to `/session`
    - `/groups` to `/group`
    - `/scopes` to `/scope`
    - `/devices` to `/device`

#### Features

- Iam endpoints with domain parameters
- Adds a util that checks delay between server-client
- Delete endpoint for webfs and path prefix

#### Fixes

- fix encoding problem in reset password methods
- changed paymentplan builder
- evci does not return location in header
- fix request without credentials
- Path & Domain order inversion in webfs

### v0.4.0 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.3.10...v0.4.0)

#### Breaking changes

Devices api changes:
* iam.user().registerMyDevice(data) -> iam.user().registerMyDevice(deviceId, data)
* iam.user().registerDevice(data) -> iam.user().registerDevice(deviceId, data)

update to devices from device endpoint

#### Features

* iam get session endpoints
* minification

### v0.3.10 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.3.9...v0.3.10)

#### Breaking changes

Notifications api changes:
* notifications.notification.create -> notifications.template.create
* notifications.notification.get -> notifications.template.get
* notifications.notification.update -> notifications.template.update
* notifications.notification.delete -> notifications.template.delete
* notifications.notification.sendNotification -> notifications.notification.send

#### Features

* Added notifications domain interface

### v0.3.9 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.3.8...v0.3.9)

#### Feature

* Updated EC module with payment methods
* Updated lodash

### v0.3.8 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.3.7...v0.3.8)

#### Features
* Oauth support updated

#### Test
* Updated oauth tests

#### Fix
* Fixes codeclimate build
* Reset password does not return location header

### v0.3.7 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.3.6...v0.3.7)

#### Fix

* Fixes refresh token handler

### v0.3.6 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.3.5...v0.3.6)

#### Fix

* Fixes ftsearch query

### v0.3.5 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.3.4...v0.3.5)

#### Features

* Binaries and blob support
* Get current endpoint function

### v0.3.4 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.3.3...v0.3.4)

#### Features

* Merged with 0.2.X, adds `.domain` implementation

### v0.3.3 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.3.2...v0.3.3)

#### Features

* Refactor to encode query params in SerializeParams function

### v0.3.2 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.3.0...v0.3.2)

#### Features

* Includes updates ACL
* Webfs

### v0.3.0 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.2.10...v0.3.0)

#### Features

* Added `blob`, `dataURI`, `stream` serializers to `request.js`

### v0.2.21 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.2.10...v0.2.21)

#### Fixes

* Fixes bug with encoded urls
* Support requests in IE
* Only 1 token refresh at the time
* Fixed events hashmap

#### Features

* Added `.domain` implementation for custom domain requests

### v0.2.10 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.2.9...v0.2.10)

#### Features

* Event handler support `addEventListener/on`, `removeEventListener/off` and `dispatch/trigger`


### v0.2.8 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.2.0...v0.2.8)

#### Breaking changes

* Assets and notifications' API have changed so now, both modules follow the main syntax

    ```
    corbelDriver.assets(.*).get() -> corbelDriver.assets.asset(.*).get()
    corbelDriver.notifications(.*).get() -> corbelDriver.notifications.notification(.*).get()

    ```


### v0.2.0 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.1.2...v0.2.0)

#### Breaking changes

* In users in module IAM, the existing methods `sendResetPasswordEmail`, `create`, `get` and `getProfiles` now require the constructor `users()` instead of `user()`

    ```
    corbelDriver.iam.users().create(data)

    ```
* It's important to note that `get` method exist also with constructor `user()`, but is equivalent to write `user('me')`, and if you had it implemented in previous version, now you must use `users()`


### v0.1.0 [view commit logs](https://github.com/corbel-platform/corbel-sdk-js/compare/v0.0.10...v0.1.0)

#### Breaking changes

* Pagination change in query, `size` renamed to `pageSize`

    ```
    {
      pagination : {
        page : 1,
        pageSize : 10
      }
    }

    ```

#### Fixes

* Response errornow it responds with an object instead of a string.





## Changelog template

### vX.Y.Z [view commit logs](https://github.com/marionettejs/backbone.marionette/compare/vX.Y.Z...vX.Y.[Z-1])

#### Breaking changes

* ...

#### Fixes

* ...

#### Docs

* ...

#### Misc

* ...
