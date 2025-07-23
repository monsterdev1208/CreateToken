const ethers = require("ethers");

class ReconnectableEthers {
    /** 
     * Constructs the class
    */
    constructor() {
        this.wssProvider = undefined;
        this.config = undefined;

        this.KEEP_ALIVE_CHECK_INTERVAL = 1000;

        this.keepAliveInterval = undefined;
        this.pingTimeout = undefined;
        this.tried = 0;
    }

    /**
     * Load assets.
     * @param {Object} config Config object.
     */
    load(config) {
        try {
            this.config = config;

            this.wssProvider = new ethers.providers.WebSocketProvider(this.config["WSS_PROVIDER_ADDRESS"][this.tried % this.config["WSS_PROVIDER_ADDRESS"].length]);
            this.defWsOpen = this.wssProvider._websocket.onopen;
            this.defWsClose = this.wssProvider._websocket.onclose;
            this.tried = this.tried + 1;
            this.wssProvider._websocket.onopen = (event) => this.onWsOpen(event);
            this.wssProvider._websocket.onclose = (event) => this.onWsClose(event);
        } catch (err) {
            console.log(err);
        }



    }

    /**
     * Check class is loaded.
     * @returns Bool
     */
    isLoaded() {
        if (!this.wssProvider) return false;
        return true;
    }

    /**
     * Triggered when wssProvider's websocket is open.
     */
    onWsOpen(event) {
        console.log("Connected to the WS!");
        console.log(this.config["WSS_PROVIDER_ADDRESS"]);
        this.keepAliveInterval = setInterval(() => {
            if (
                this.wssProvider._websocket.readyState === 0 ||
                this.wssProvider._websocket.readyState === 1
            ) return;

            this.wssProvider._websocket.close();
        }, this.KEEP_ALIVE_CHECK_INTERVAL)
        this.config.callback(this.wssProvider, this.config.chainId);
        if (this.defWsOpen) this.defWsOpen(event);
    }

    /**
     * Triggered on websocket termination.
     * Tries to reconnect again.
     */
    onWsClose(event) {
        console.log("WS connection lost! Reconnecting...");
        clearInterval(this.keepAliveInterval)
        this.load(this.config);

        if (this.defWsClose) this.defWsClose(event);
    }
}

module.exports = ReconnectableEthers;