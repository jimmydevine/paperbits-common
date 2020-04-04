import { assert, expect } from "chai";
import { NavigationService, NavigationItemContract } from "../src/navigation";
import { MockObjectStorage } from "./mocks/mockObjectStorage";
import { MockBlockService } from "./mocks/mockBlockService";
import { MockLocaleService } from "./mocks/mockLocaleService";
import { Contract } from "../src";

describe("Navigation service", async () => {
    it("Can update navigation item metadata in specified locale.", async () => {
        const initialData = {
            navigationItems: [{
                key: "main",
                locales: {
                    "en-us": {
                        label: "Main menu"
                    },
                    "ru-ru": {
                        label: "Главное меню"
                    }
                },
                navigationItems: [{
                    key: "461e475c-cd0b-26ea-98bf-78824db10876",
                    targetKey: "pages/about",
                    locales: {
                        "en-us": {
                            label: "Get started"
                        },
                        "ru-ru": {
                            label: "С чего начать?"
                        }
                    }
                }]
            }]
        };

        const objectStorage = new MockObjectStorage(initialData);
        const localeService = new MockLocaleService();
        localeService.setCurrentLocale("ru-ru");

        const navigationService = new NavigationService(objectStorage, localeService);

        const navigationItems = await navigationService.getNavigationItems();
        navigationItems[0].label = "Главное меню (изменения)";

        await navigationService.updateNavigation(navigationItems);

        const resultStorageState = objectStorage.getData();
        assert.isTrue(resultStorageState["navigationItems"][0]["locales"]["ru-ru"]["label"] === "Главное меню (изменения)");
    });

    it("Returns navigationItem metadata in default locale when specified locale doesn't exist.", async () => {
        const initialData = {
            navigationItems: [{
                key: "main",
                locales: {
                    "en-us": {
                        label: "Main menu"
                    }
                },
                navigationItems: [{
                    key: "461e475c-cd0b-26ea-98bf-78824db10876",
                    targetKey: "pages/about",
                    locales: {
                        "en-us": {
                            label: "Get started"
                        }
                    }
                }]
            }]
        };

        const objectStorage = new MockObjectStorage(initialData);
        const localeService = new MockLocaleService();
        localeService.setCurrentLocale("ru-ru");

        const navigationService = new NavigationService(objectStorage, localeService);

        const navigationItemContract1 = await navigationService.getNavigationItemByKey("main");
        assert.isTrue(navigationItemContract1.label === "Main menu", "NavigationItem metadata is in invalid locale.");
    });

    it("Returns navigation item metadata in specified locale.", async () => {
        const initialData = {
            navigationItems: [{
                key: "main",
                locales: {
                    "en-us": {
                        label: "Main menu"
                    },
                    "ru-ru": {
                        label: "Главное меню"
                    }
                },
                navigationItems: [{
                    key: "461e475c-cd0b-26ea-98bf-78824db10876",
                    targetKey: "pages/about",
                    locales: {
                        "en-us": {
                            label: "Get started"
                        },
                        "ru-ru": {
                            label: "С чего начать?"
                        }
                    }
                }]
            }]
        };

        const objectStorage = new MockObjectStorage(initialData);
        const localeService = new MockLocaleService();
        localeService.setCurrentLocale("ru-ru");

        const navigationService = new NavigationService(objectStorage, localeService);

        const navigationItemContract = await navigationService.getNavigationItemByKey("main");
        assert.isTrue(navigationItemContract.label === "Главное меню", "Navigation item metadata is in invalid locale.");
    });
});