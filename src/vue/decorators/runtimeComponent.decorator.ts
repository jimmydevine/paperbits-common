import Vue from "vue";

export function RuntimeComponent(config: any): (target: Function) => void {
    return (target) => {
        class RuntimeComponentProxy extends HTMLElement {
            private component: Vue;

            constructor() {
                super();
            }

            public connectedCallback(): void {
                this.component = new Vue({ el: this });
            }

            public disconnectedCallback(): void {
                if (this.component) {
                    this.component.$destroy();
                }
            }
        }

        customElements.define(config.selector, RuntimeComponentProxy);
    };
}