sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("esdm.realtime.tracking.controller.ShuttleTracker", {
        onInit: function () {
            // Dummy Data
            var oData = {
                driverName: "John D.",
                plateNumber: "JVL 6145",
                busPosition: 0, // 0 to 100 percentage
                occupancyLevel: 45, // Percentage
                occupancyStatus: "Moderate",
                stops: [
                    { name: "KK TF/TDI", longName: "KOLEJ TUN DR ISMAIL", eta: "2 mins", walkingTime: "0 min", selected: true, position: 10 },
                    { name: "FKMP", longName: "FAKULTI KEJURUTERAAN MEKANIKAL", eta: "5 mins", walkingTime: "10 mins", selected: false, position: 25 },
                    { name: "Library", longName: "PERPUSTAKAAN TUNKU TUN AMINAH", eta: "8 mins", walkingTime: "15 mins", selected: false, position: 40 },
                    { name: "Dewan Sultan Ibrahim", longName: "DEWAN SULTAN IBRAHIM", eta: "12 mins", walkingTime: "18 mins", selected: false, position: 55 },
                    { name: "FPTV", longName: "FAKULTI PENDIDIKAN TEKNIKAL", eta: "15 mins", walkingTime: "22 mins", selected: false, position: 70 },
                    { name: "PKU & CARE", longName: "PUSAT KESIHATAN UNIVERSITI", eta: "18 mins", walkingTime: "25 mins", selected: false, position: 85 },
                    { name: "G3 (back)", longName: "BANGUNAN G3 (BELAKANG)", eta: "22 mins", walkingTime: "30 mins", selected: false, position: 95 }
                ],
                user: {
                    fullName: "Muhammad Haziq Bin Abdullah",
                    matricNumber: "AI210245",
                    course: "Bachelor of Computer Science (Software Engineering)"
                },
                selectedStop: {} // For the dialog
            };

            // Enhance stops with approximate positions (0-100) for logic
            // (Done inline above for simplicity)

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel);

            // Set initial selected stop for the dialog if needed
            oData.selectedStop = oData.stops[0];
            oModel.refresh();

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

        onStopPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oBindingContext = oItem.getBindingContext();
            var sPath = oBindingContext.getPath();
            var iIndex = parseInt(sPath.split("/").pop());

            var oModel = this.getView().getModel();
            var aStops = oModel.getProperty("/stops");

            // Reset all selection
            aStops.forEach(function (oStop) {
                oStop.selected = false;
            });

            // Set selected
            var oSelectedStop = aStops[iIndex];
            oSelectedStop.selected = true;

            oModel.setProperty("/stops", aStops);
            oModel.setProperty("/selectedStop", oSelectedStop);

            // Open Details Dialog
            if (!this._pStopDetailsDialog) {
                this._pStopDetailsDialog = this.loadFragment({
                    name: "esdm.realtime.tracking.view.StopDetails"
                });
            }

            this._pStopDetailsDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onStopDetailsClose: function () {
            this._pStopDetailsDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        _simulateMovement: function () {
            var iPosition = 0;
            var bForward = true;
            var bNotified = false;

            setInterval(function () {
                if (bForward) {
                    iPosition += 0.2;
                } else {
                    iPosition -= 0.2;
                }

                if (iPosition >= 100) {
                    bForward = false;
                    bNotified = false; // Reset notification for return trip
                } else if (iPosition <= 0) {
                    bForward = true;
                    bNotified = false;
                }

                // Update DOM directly for smooth animation
                var oViewDom = this.getView().getDomRef();
                if (oViewDom) {
                    var oIcon = oViewDom.querySelector(".shuttleIconWrapper");
                    if (oIcon) {
                        oIcon.style.top = iPosition + "%";
                    }
                }

                // --- ADVANCED FEATURES LOGIC ---
                var oModel = this.getView().getModel();
                if (!oModel) return;

                // 1. Bus Occupancy Fluctuation
                if (Math.random() > 0.95) { // Occasional update
                    var currentLevel = oModel.getProperty("/occupancyLevel");
                    var change = Math.floor(Math.random() * 5) - 2; // -2 to +2
                    var newLevel = Math.max(0, Math.min(100, currentLevel + change));
                    oModel.setProperty("/occupancyLevel", newLevel);

                    var newStatus = "Low";
                    if (newLevel > 80) newStatus = "High";
                    else if (newLevel > 50) newStatus = "Moderate";
                    oModel.setProperty("/occupancyStatus", newStatus);
                }

                // 2. Proximity Alert
                var selectedStop = oModel.getProperty("/selectedStop");
                if (selectedStop && bForward && !bNotified) {
                    // Check if bus is approaching (within 5% range before the stop)
                    if (selectedStop.position && iPosition >= (selectedStop.position - 5) && iPosition < selectedStop.position) {
                        MessageToast.show("Bus is approaching " + selectedStop.name + "!");
                        bNotified = true; // Prevent spamming
                    }
                }

            }.bind(this), 50); // Update every 50ms
        }
    });
});
