import { assert, expect } from "chai";
import { LocalizedPageService } from "../src/pages";
import { MockObjectStorage } from "./mocks/mockObjectStorage";
import { MockBlockService } from "./mocks/mockBlockService";
import { MockLocaleService } from "./mocks/mockLocaleService";
import { Contract } from "../src/";

describe("Localized page service", async () => {
    it("Can create page content when metadata doesn't exist", async () => {
        const initialData = {
            pages: {
                page1: {
                    locales: {
                        "en-us": {
                            title: "About",
                            permalink: "en-us/about"
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
        assert(Object.values(resultStorageState["files"])[0]["type"] === "ru-ru-content");
    });

    it("Can create page content when metadata exists.", async () => {
        const initialData = {
            pages: {
                page1: {
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
        assert(resultStorageState["files"]["ru-ru-content"]["type"] === "ru-ru-content");
    });

    it("Can create page content when metadata exists, but no contentKey defined yet.", async () => {
        const initialData = {
            pages: {
                page1: {
                    locales: {
                        "en-us": {
                            title: "About",
                            permalink: "en-us/about"
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
        assert(Object.values(resultStorageState["files"])[0]["type"] === "ru-ru-content");
    });

    it("Can update page content.", async () => {
        const initialData = {
            pages: {
                page1: {
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
        assert(resultStorageState["files"]["ru-ru-content"]["type"] === "updated-ru-ru-content");
    });

    it("Returns page metadata in default locale when specified locale doesn't exist.", async () => {
        const initialData = {
            pages: {
                page1: {
                    locales: {
                        "en-us": {
                            title: "About",
                            permalink: "en-us/about",
                            contentKey: "files/en-us-content"
                        }
                    }
                }
            },
            files: {
                "en-us-content": {
                    type: "localized-node"
                }
            }
        };

        const objectStorage = new MockObjectStorage(initialData);
        const blockService = new MockBlockService();
        const localeService = new MockLocaleService();
        const localizedService = new LocalizedPageService(objectStorage, blockService, localeService);

        const pageContract = await localizedService.getPageByKey("pages/page1", "ru-ru");
        assert.isTrue(pageContract.title === "About", "Page metadata is in invalid locale.");
    });

    it("Returns page metadata in specified locale.", async () => {
        const initialData = {
            pages: {
                page1: {
                    locales: {
                        "en-us": {
                            title: "About",
                            permalink: "en-us/about",
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
                "en-us-content": {
                    type: "localized-node"
                }
            }
        };

        const objectStorage = new MockObjectStorage(initialData);
        const blockService = new MockBlockService();
        const localeService = new MockLocaleService();
        const localizedService = new LocalizedPageService(objectStorage, blockService, localeService);

        const pageContract = await localizedService.getPageByKey("pages/page1", "ru-ru");
        assert.isTrue(pageContract.title === "О нас", "Page metadata is in invalid locale.");
    });

    it("Returns page content in specified locale.", async () => {
        const initialData = {
            pages: {
                page1: {
                    locales: {
                        "en-us": {
                            title: "About",
                            permalink: "en-us/about",
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
                    locales: {
                        "en-us": {
                            title: "About",
                            permalink: "en-us/about",
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
});