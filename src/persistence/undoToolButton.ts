import * as ko from "knockout";
import { OfflineObjectStorage } from ".";
import { IToolButton } from "../ui";
import { IEventManager } from "../events";


export class UndoToolButton implements IToolButton {
    public iconClass: string = "paperbits-icon paperbits-undo-25";
    public title: string = "Undo";
    public disabled: ko.Observable<boolean>;

    constructor(private readonly eventManager: IEventManager, private readonly offlineObjectStorage: OfflineObjectStorage) {
        this.disabled = ko.observable(true);
        this.eventManager.addEventListener("onDataChange", this.onDataChange.bind(this));
    }

    private onDataChange(): void {
        this.disabled(!this.offlineObjectStorage.canUndo());
    }

    public onActivate(): void {
        this.eventManager.dispatchEvent("onUndo");
    }
}
