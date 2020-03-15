import { assert, expect } from "chai";
import { LocalizedPageService, PageContract } from "../src/pages";
import { MockObjectStorage } from "./mocks/mockObjectStorage";
import { MockBlockService } from "./mocks/mockBlockService";
import { MockLocaleService } from "./mocks/mockLocaleService";
import { Contract } from "../src/";
import { PageMetadata } from "@paperbits/common/pages/pageMetadata";

describe("Localized page service", async () => {
    it("Can create page metadata in specified locale when metadata doesn't exists.", async () => {
        const initialData = {
            pages: {
                page1: {
                    key: "pages/page1",
                    locales: {
                        "en-us": {
                            title: "About",
                            permalink: "/about"
                        }
                    }
                }
            }
        };

        const objectStorage = new MockObjectStorage(initialData);
        const blockService = new MockBlockService();
        const localeService = new MockLocaleService();
        const localizedService = new LocalizedPageService(objectStorage, blockService, localeService);

        const pageContract: PageContract = {
            key: "pages/page1",
            title: "О нас",
            permalink: "ru-ru/about"
        };

        await localizedService.updatePage(pageContract, "ru-ru");

        const resultStorageState = objectStorage.getData();
        assert.isTrue(resultStorageState["pages"]["page1"]["locales"]["en-us"]["title"] === "About");
        assert.isTrue(resultStorageState["pages"]["page1"]["locales"]["ru-ru"]["title"] === "О нас");
    });

    it("Can create page content when metadata doesn't exist", async () => {
        const initialData = {
            pages: {
                page1: {
                    key: "pages/page1",
                    locales: {
                        "en-us": {
                            title: "About",
                            permalink: "/about"
                        }
                    }
                }
            }
        };

        const objectStorage = new MockObjectStorage(initialData);
        const blockService = new MockBlockService();
        const localeService = new MockLocaleService();
        const localizedService = new LocalizedPageService(objectStorage, blockService, localeService);
        const content: Contract = { type: "ru-ru-content" };

        await localizedService.updatePageContent("pages/page1", content, "ru-ru");

        const resultStorageState = objectStorage.getData();
        assert.isTrue(Object.values(resultStorageState["files"])[0]["type"] === "ru-ru-content");
    });

    it("Can create page content when metadata exists.", async () => {
        const initialData = {
            pages: {
                page1: {
                    key: "pages/page1",
                    locales: {
                        "ru-ru": {
                            title: "О нас",
                            permalink: "ru-ru/about",
                            contentKey: "files/ru-ru-content"
                        }
                    }
                }
            }
        };

        const objectStorage = new MockObjectStorage(initialData);
        const blockService = new MockBlockService();
        const localeService = new MockLocaleService();
        const localizedService = new LocalizedPageService(objectStorage, blockService, localeService);
        const content: Contract = { type: "ru-ru-content" };

        await localizedService.updatePageContent("pages/page1", content, "ru-ru");

        const resultStorageState = objectStorage.getData();
        assert.isTrue(resultStorageState["files"]["ru-ru-content"]["type"] === "ru-ru-content");
    });

    it("Can create page content when metadata exists, but no contentKey defined yet.", async () => {
        const initialData = {
            pages: {
                page1: {
                    key: "pages/page1",
                    locales: {
                        "en-us": {
                            title: "About",
                            permalink: "/about"
                        },
                        "ru-ru": {
                            title: "О нас",
                            permalink: "ru-ru/about"
                        }
                    }
                }
            }
        };

        const objectStorage = new MockObjectStorage(initialData);
        const blockService = new MockBlockService();
        const localeService = new MockLocaleService();
        const localizedService = new LocalizedPageService(objectStorage, blockService, localeService);
        const content: Contract = { type: "ru-ru-content" };

        await localizedService.updatePageContent("pages/page1", content, "ru-ru");

        const resultStorageState = objectStorage.getData();
        assert.isTrue(Object.values(resultStorageState["files"])[0]["type"] === "ru-ru-content");
    });

    it("Can update page content.", async () => {
        const initialData = {
            pages: {
                page1: {
                    key: "pages/page1",
                    locales: {
                        "ru-ru": {
                            title: "О нас",
                            permalink: "ru-ru/about",
                            contentKey: "files/ru-ru-content"
                        }
                    }
                }
            },
            files: {
                "ru-ru-content": {
                    type: "localized-node"
                }
            }
        };

        const objectStorage = new MockObjectStorage(initialData);
        const blockService = new MockBlockService();
        const localeService = new MockLocaleService();
        const localizedService = new LocalizedPageService(objectStorage, blockService, localeService);
        const content: Contract = { type: "updated-ru-ru-content" };

        await localizedService.updatePageContent("pages/page1", content, "ru-ru");

        const resultStorageState = objectStorage.getData();
        assert.isTrue(resultStorageState["files"]["ru-ru-content"]["type"] === "updated-ru-ru-content");
    });

    it("Returns page metadata in default locale when specified locale doesn't exist.", async () => {
        const initialData = {
            pages: {
                page1: {
                    key: "pages/page1",
                    locales: {
                        "en-us": {
                            title: "About",
                            permalink: "/about",
                            contentKey: "files/en-us-content"
                        }
                    }
                }
            }
        };

        const objectStorage = new MockObjectStorage(initialData);
        const blockService = new MockBlockService();
        const localeService = new MockLocaleService();
        const localizedService = new LocalizedPageService(objectStorage, blockService, localeService);

        const pageContract1 = await localizedService.getPageByKey("pages/page1", "ru-ru");
        assert.isTrue(pageContract1.title === "About", "Page metadata is in invalid locale.");

        const pageContract2 = await localizedService.getPageByPermalink("/about", "ru-ru");
        assert.isTrue(pageContract2.title === "About", "Page metadata is in invalid locale.");
    });

    it("Returns page metadata in specified locale.", async () => {
        const initialData = {
            pages: {
                page1: {
                    key: "pages/page1",
                    locales: {
                        "en-us": {
                            title: "About",
                            permalink: "/about",
                            contentKey: "files/en-us-content"
                        },
                        "ru-ru": {
                            title: "О нас",
                            permalink: "ru-ru/about",
                            contentKey: "files/ru-ru-content"
                        }
                    }
                }
            }
        };

        const objectStorage = new MockObjectStorage(initialData);
        const blockService = new MockBlockService();
        const localeService = new MockLocaleService();
        const localizedService = new LocalizedPageService(objectStorage, blockService, localeService);

        const pageContract = await localizedService.getPageByKey("pages/page1", "ru-ru");
        assert.isTrue(pageContract.title === "О нас", "Page metadata is in invalid locale.");

        const pageContract2 = await localizedService.getPageByPermalink("/about", "ru-ru");
        assert.isTrue(pageContract2.title === "О нас", "Page metadata is in invalid locale.");
    });

    it("Returns page content in specified locale.", async () => {
        const initialData = {
            pages: {
                page1: {
                    key: "pages/page1",
                    locales: {
                        "en-us": {
                            title: "About",
                            permalink: "/about",
                            contentKey: "files/en-us-content"
                        },
                        "ru-ru": {
                            title: "О нас",
                            permalink: "ru-ru/about",
                            contentKey: "files/ru-ru-content"
                        }
                    }
                }
            },
            files: {
                "ru-ru-content": {
                    type: "ru-ru-content"
                }
            }
        };

        const objectStorage = new MockObjectStorage(initialData);
        const blockService = new MockBlockService();
        const localeService = new MockLocaleService();
        const localizedService = new LocalizedPageService(objectStorage, blockService, localeService);

        const pageContent = await localizedService.getPageContent("pages/page1", "ru-ru");
        assert.isTrue(pageContent.type === "ru-ru-content", "Page content is in invalid locale.");
    });

    it("Returns page content in default locale when specified locale doesn't exists.", async () => {
        const initialData = {
            pages: {
                page1: {
                    key: "pages/page1",
                    locales: {
                        "en-us": {
                            title: "About",
                            permalink: "/about",
                            contentKey: "files/en-us-content"
                        },
                        "ru-ru": {
                            title: "О нас",
                            permalink: "ru-ru/about"
                        }
                    }
                }
            },
            files: {
                "en-us-content": {
                    type: "en-us-content"
                }
            }
        };

        const objectStorage = new MockObjectStorage(initialData);
        const blockService = new MockBlockService();
        const localeService = new MockLocaleService();
        const localizedService = new LocalizedPageService(objectStorage, blockService, localeService);

        const pageContent = await localizedService.getPageContent("pages/page1", "ru-ru");
        assert.isTrue(pageContent.type === "en-us-content", "Page content is in invalid locale.");
    });

    it("Can create page in specified locale.", async () => {
        const initialData = {};
        const objectStorage = new MockObjectStorage(initialData);
        const blockService = new MockBlockService();
        const localeService = new MockLocaleService();
        const localizedService = new LocalizedPageService(objectStorage, blockService, localeService);

        await localizedService.createPage("/about", "О нас", "", "", "ru-ru");

        const resultStorageState = objectStorage.getData();
        assert.isTrue(Object.values(resultStorageState["pages"])[0]["locales"]["ru-ru"]["title"] === "О нас");
    });
});