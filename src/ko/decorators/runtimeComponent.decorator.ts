import * as ko from "knockout";

export function RuntimeComponent(config: any): (target: Function) => void {
    return (target) => {
        

        class RuntimeComponentProxy extends HTMLElement {
            private onDispose: () => void;

            constructor() {
                super();
            }

            public connectedCallback(): void { 
                const element = <HTMLElement>this;

                ko.applyBindingsToNode(element, {
                    component: {
                        name: config.selector,
                        viewModel: target,
                        params: element.getAttribute("params"),
                        oncreate: (viewModelInstance) => {
                            this.onDispose = viewModelInstance.dispose;
                        }
                    }
                }, null);
            }

            public disconnectedCallback(): void {
                if (this.onDispose) {
                    this.onDispose();
                }
            }
        }

        customElements.define(config.selector, RuntimeComponentProxy);
    };
}