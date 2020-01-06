// import Vue from "vue";
declare var Vue;

export function RuntimeComponent(config: any): (target: Function) => void {
    return (target) => {
        let onDispose: () => void;

        class RuntimeComponentProxy extends HTMLElement {
            constructor() {
                super();

                const element = <HTMLElement>this;
                const component = new Vue({ el: element });
            }

            public connectedCallback(): void {
                // Not implemented
            }

            public disconnectedCallback(): void {
                if (onDispose) {
                    onDispose();
                }
            }
        }

        customElements.define(config.selector, RuntimeComponentProxy);
    };
}