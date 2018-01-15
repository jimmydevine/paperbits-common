﻿import { IEventManager } from '../events/IEventManager';
import { IRouteHandler } from '../routing/IRouteHandler';
import { debug } from 'util';

export class RouteHandlerEvents {
    static onRouteChange = "onRouteChange";
}

export class DefaultRouteHandler implements IRouteHandler {
    private readonly eventManager: IEventManager;

    private hash: string;
    private notificationEnabled: boolean;

    constructor(eventManager: IEventManager) {
        // initialization...
        this.eventManager = eventManager;

        // rebinding...
        this.handleHashChangeEvent = this.handleHashChangeEvent.bind(this);
        this.getCurrentUrl = this.getCurrentUrl.bind(this);

        // setting up...
        this.hash = window.location.hash;
        this.notificationEnabled = true;

        // subscribing for events...
        window.addEventListener("hashchange", this.handleHashChangeEvent, false);
    }

    private handleHashChangeEvent(): void {
        if (this.hash && this.hash !== location.hash && `#${this.hash}` !== location.hash) {
            this.hash = location.hash;

            if (this.notificationEnabled) {
                this.eventManager.dispatchEvent(RouteHandlerEvents.onRouteChange);
            }
        }
    }

    public addRouteChangeListener(callback: () => void): any {
        return this.eventManager.addEventListener(RouteHandlerEvents.onRouteChange, callback);
    }

    public removeRouteChangeListener(handle: any) {
        this.eventManager.removeEventListener(RouteHandlerEvents.onRouteChange, handle);
    }

    public navigateTo(url: string, notifyListeners: boolean = true) {
        if (!url) {
            return;
        }

        const isFullUrl = !url.startsWith("/");
        const isLocalUrl = url.startsWith(location.origin);

        if (isFullUrl && !isLocalUrl) {
            window.open(url, "_blank"); // navigating external link
            return;
        }

        const hash = isFullUrl
            ? url.substring(location.origin.length)
            : url;

        if (hash === location.hash || `#${hash}` === location.hash) {
            return;
        }

        if (!notifyListeners) {
            this.notificationEnabled = false;
        }

        this.hash = hash;
        location.hash = hash;

        if (this.notificationEnabled) {
            this.eventManager.dispatchEvent(RouteHandlerEvents.onRouteChange);
        }

        setImmediate(() => {
            this.notificationEnabled = true;
        })
    }

    public getCurrentUrl(): string {
        var permalink = this.hash.replace("#", "");

        if (permalink === "") {
            permalink = location.pathname;
        }

        return permalink;
    }
}