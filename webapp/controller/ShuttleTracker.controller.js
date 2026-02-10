sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("esdm.realtime.tracking.controller.ShuttleTracker", {
        onInit: function () {
            // Dummy Data
            var oData = {
                driverName: "John D.",
                plateNumber: "JVL 6145",
                busPosition: 0, // 0 to 100 percentage
                stops: [
                    { name: "KK TF/TDI", selected: true },
                    { name: "FKMP", selected: false },
                    { name: "Library", selected: false },
                    { name: "Dewan Sultan Ibrahim", selected: false },
                    { name: "FPTV", selected: false },
                    { name: "PKU & CARE", selected: false },
                    { name: "G3 (back)", selected: false }
                ],
                user: {
                    fullName: "Muhammad Haziq Bin Abdullah",
                    matricNumber: "AI210245",
                    course: "Bachelor of Computer Science (Software Engineering)"
                }
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel);

            // Simulate Bus Movement
            this._simulateMovement();
        },

        onProfilePress: function () {
            var oView = this.getView();

            if (!this._pProfileDialog) {
                this._pProfileDialog = this.loadFragment({
                    name: "esdm.realtime.tracking.view.ProfileDialog"
                });
            }

            this._pProfileDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onProfileClose: function () {
            this._pProfileDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        _simulateMovement: function () {
            var iPosition = 0;
            var bForward = true;

            setInterval(function () {
                if (bForward) {
                    iPosition += 0.2;
                } else {
                    iPosition -= 0.2;
                }

                if (iPosition >= 100) {
                    bForward = false;
                } else if (iPosition <= 0) {
                    bForward = true;
                }

                // Update the bus icon position via DOM manipulation for smoothness or Model binding if using CSS vars
                // Here I will use direct DOM manipulation for the specific element ID for simplicity in this demo,
                // or I could simply update a model property connected to a custom control.
                // For this XML view, I used a standard html:div with an ID. 
                // Note: In UI5, IDs are prefixed. I need to find the element.

                var oBusIcon = this.getView().byId("busIcon"); // This won't work for html:div directly if not a UI5 control.
                // Better approach: Use a model property and bind it to style in a custom control, or just find DOM.

                // Let's try finding the DOM element strictly by class or query within the view.
                var oViewDom = this.getView().getDomRef();
                if (oViewDom) {
                    var oIcon = oViewDom.querySelector(".shuttleIconWrapper");
                    if (oIcon) {
                        oIcon.style.top = iPosition + "%";
                    }
                }

            }.bind(this), 50); // Update every 50ms
        }
    });
});
