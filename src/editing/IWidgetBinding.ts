/**
 * Structure that binds widget view model to widget HTML element.
 */
export interface IWidgetBinding<TModel> {
    /**
     * Name of a widget.
     */
    name: string;

    /**
     * Widget display name.
     */
    displayName: string;

    /**
     * Widget model.
     */
    model: TModel;

    /**
     * Registration name (tag name) of editor component.
     */
    editor?: string;

    /**
     * Editor resize options.
     */
    editorResize?: string;

    hideCloseButton?: boolean;

    /**
     * Propagates changes from widget model to widget view model.
     */
    applyChanges?: (changes?: TModel) => void;

    /**
     * Indicates to grid editor whether this widget should be ignored.
     */
    readonly: boolean;

    /**
     * Either "box" or "fluid".
     */
    flow?: string;

    /**
     * List of features exposed by the container (given this widget has a container).
     */
    provides?: string[];

    handler?: any;

    onCreate?: () => void;

    onDispose?: () => void;
}