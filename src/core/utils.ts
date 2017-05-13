﻿import { ProgressPromise } from '../core/progressPromise';

export interface IFunctionBag {
    (): void;
    add(item: () => void): IFunctionBag;
}

export function createFunctionBag(): IFunctionBag {
    var items: (() => void)[] = [];

    var bag = <IFunctionBag>function () {
        for (var i = 0; i < items.length; i++) {
            items[i]();
        }
    };
    bag.add = (item): IFunctionBag => {
        items.push(item);
        return bag;
    };

    return bag;
}

export function guid(): string {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
        s4() + "-" + s4() + s4() + s4();
}

export function createComponent(nodeName: string, attributes: Object): HTMLElement {
    var htmlElement = document.createElement(nodeName);
    htmlElement.style.width = "200px";
    Object.keys(attributes).forEach(key => htmlElement.setAttribute(key, attributes[key]));

    ko.applyBindings({}, htmlElement); // VK: Required to force component view model creation and binding.

    return htmlElement;
}

export function readUrlAsBlob(url: string): ProgressPromise<Uint8Array> {
    return new ProgressPromise<Uint8Array>((resolve, reject, progress) => {
        var xhr = new XMLHttpRequest();
        xhr.responseType = "arraybuffer";
        xhr.onprogress = progressEventToProgress(percent => progress(percent));
        xhr.onload = () => resolve(new Uint8Array(xhr.response));
        xhr.open('GET', url);
        xhr.send();
    });
}

export function arrayBufferToBase64(buffer: Uint8Array) {
    if (Buffer) {
        return new Buffer(buffer).toString('base64');
    }
    else {
        var binary = "";
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}

export function readFileAsByteArray(file: File): ProgressPromise<Uint8Array> {
    return new ProgressPromise<Uint8Array>((resolve, reject, progress) => {
        let reader = new FileReader();
        reader.onload = event => resolve((<any>event.target).result);
        reader.onprogress = progressEventToProgress(progress);
        reader.readAsArrayBuffer(file);
    });
}

export function readBlobAsDataUrl(file: Blob): ProgressPromise<string> {
    return readDataUrlFromReader(reader => reader.readAsDataURL(file));
}

function readDataUrlFromReader(read: (reader: FileReader) => void): ProgressPromise<string> {
    return new ProgressPromise<string>((resolve, reject, progress) => {
        let reader = new FileReader();
        reader.onload = event => resolve((<any>event.target).result);
        reader.onprogress = progressEventToProgress(progress);
        read(reader);
    });
}

function progressEventToProgress(progress: (precent: number) => void): (event: ProgressEvent) => void {
    return (event: ProgressEvent) => {
        if (event.lengthComputable) {
            let percentLoaded = Math.round((event.loaded / event.total) * 100);
            progress(percentLoaded);
        }
    };
}

export function isDirectUrl(url: string): boolean {
    return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:");
}

export interface ILazy<T> {
    (): T;
}

export function lazy<T>(factory: () => T): ILazy<T> {
    let value: T;
    let evaluated = false;
    return () => {
        if (evaluated) {
            return value;
        }
        evaluated = true;
        return value = factory();
    }
}

export function getCookie(name: string) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

export function stringToUnit8Array(content: string): Uint8Array {
    var escstr = encodeURIComponent(content);

    var binstr = escstr.replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode(<any>('0x' + p1));
    });

    var bytes = new Uint8Array(binstr.length);

    Array.prototype.forEach.call(binstr, (ch, i) => {
        bytes[i] = ch.charCodeAt(0);
    });

    return bytes;
}

export function uint8ArrayToString(bytes: Uint8Array): string {
    let binstr = Array.prototype.map.call(bytes, (ch) => { return String.fromCharCode(ch); }).join('');

    var content = binstr.replace(/(.)/g, (m, p) => {
        var code = p.charCodeAt(p).toString(16).toUpperCase();

        if (code.length < 2) {
            code = '0' + code;
        }
        return '%' + code;
    });

    return decodeURIComponent(content);
}