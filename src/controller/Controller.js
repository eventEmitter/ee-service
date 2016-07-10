(function() {
    'use strict';



    const type = require('ee-types');
    const EventEmitter = require('events');





    module.exports = class Service extends EventEmitter {




        // the controllers name
        get name() { return this._name; }


        // the service this controller is part of
        get service() { return this._service; }






        /**
         * set up the controller
         *
         * @param {string} controllerName the name of the controller
         * @param {object} serviceInstance the service this controller is part of
         */
        constructor(controllerName, serviceInstance) {
            super();


            // our name
            if (!type.string(controllerName) || !controllerName.length) throw new Error(`Please provide a controllerName!`);
            this._name = controllerName;


            // we need to be able to acces the service
            if (!type.object(serviceInstance)) throw new Error(`Pleasse provide the serviceInstance to the controller!`);
            this._service = serviceInstance;
        }












        /**
         * calls a method on the controller
         *
         * @param {string} methodName the name of the method to call
         * @param {request} request
         * @param {response} response
         *
         * @returns {promise}
         */
        callMethod(methodName, request, response) {
            if (type.function(this[methodName])) {
                let returnValue;

                // check what was returned from the call
                // if the method fails the catch block in the
                // service will handle the problems
                returnValue = this[methodName](request, response);


                // only aaccept promises as returnvalue
                if (type.promise(returnValue)) return returnValue;
                else {
                    response.status = response.statusCodes.serverError;
                    response.statusMessage = `The action '${request.action}' on the '${this.name}' failed!`;
                    response.statusError = new Error(`The action '${request.action}' on the '${this.name}' resource returned an invalid value. Èxpected a promise, got '${type(returnValue)}'!`);
                    response.send();

                    return Promise.resolve();
                }
            }
            else {
                response.status = response.statusCodes.notImplemented;
                response.statusMessage = `The action '${request.action}' on the '${this.name}' resource was not implemented!`;
                response.send();

                return Promise.resolve();
            }
        }









        /**
         * calls certain lifecycle methods. the actions
         * and methods are clearly defined in the service
         * itself
         *
         * @param {string} actionName the name of the action to call
         * @param {string} lifeCycle the name of the lifecycle
         * @param {request} request
         * @param {response} response
         *
         * @returns {promise}
         */
        callLifeCycleMethod(actionName, lifeCycle, request, response) {
            const methodName = `${lifeCycle}${actionName[0].toUpperCase()}${actionName.slice(1)}`;


            // let the callMethod method do the hard work
            // life cycle methods are optional
            if (type.function(this[methodName])) return this.callMethod(methodName, request, response);
            return Promise.resolve();
        }
    };
})();