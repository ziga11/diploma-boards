const activePage = () => document.querySelector(`#page-board`) ?? document;

export const HTML = {
        get modal() { return activePage().querySelector("#automate") as HTMLDialogElement },
        get body() { return activePage().querySelector("#automate-body") as HTMLDivElement },
        get closeBtn() { return activePage().querySelector("#automate")?.querySelector("btn-close") as HTMLInputElement },

        create: {
                get btn() { return activePage().querySelector("#create-tab") as HTMLInputElement },
                get noFields() { return activePage().querySelector("#automate")?.querySelector(".no-fields") as HTMLDivElement },

                get type() {
                        return {
                                get div() { return activePage().querySelector(".create-automations") as HTMLDivElement },
                                get options() { return activePage().querySelectorAll(".automation-option") as NodeListOf<HTMLDivElement> },
                        };
                },

                get field() {
                        return {
                                get div() { return activePage().querySelector(".field-automation-selection") as HTMLDivElement },
                                get fieldsContainer() { return activePage().querySelector(".automation-fields-wrap") as HTMLDivElement },
                        }
                },

                get url() {
                        return {
                                get div() { return activePage().querySelector(".url-call-div") as HTMLDivElement },
                                get input() { return activePage().querySelector("#url-call") as HTMLInputElement },
                                get finish() { return activePage().querySelector("#finish-automation") as HTMLButtonElement },
                                get triggerType() { return activePage().querySelector("#url-call-subtitle") as HTMLButtonElement },
                        }
                },

                get order() { return [this.type.div, this.field.div, this.url.div] },
        },
        modify: {
                get noAutomations() { return activePage().querySelector("#automate")?.querySelector(".no-automations") as HTMLDivElement },
                get existingAutomations() { return activePage().querySelector(".existing-automations") as HTMLDivElement },
                get btn() { return activePage().querySelector("#modify-tab") as HTMLInputElement },
                get createAutomationCta() { return activePage().querySelector("#automate")?.querySelector(".create-automation-cta") as HTMLInputElement },
        }
};
