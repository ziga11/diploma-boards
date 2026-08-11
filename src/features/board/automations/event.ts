import { HTML } from "./html";
import { finishAutomationCreation, removeAutomation, selectAutomationField, selectAutomationType } from "./logic";
import { automationEvents } from "./custom-events";
import { AutomationsState } from "./state";
import { addAutomationView, previousDiv, removeAutomationById, showCreatedAutomations, startCreationFlow } from "./ui/dom";

export function initAutomationEvents() {
        [HTML.create.btn, HTML.modify.noAutomations.createAutomationCta].forEach(btn => {
                btn.addEventListener("click", () => startCreationFlow());
        });

        HTML.modify.btn.addEventListener("click", () => showCreatedAutomations());

        HTML.body.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;
                if (elem.classList[0] == "back-btn") {
                        previousDiv();
                }
                else if (elem.className === "automation-option") {
                        selectAutomationType(Number(elem.dataset.automationType));
                }
                else if (elem.className === "automation-field-div") {
                        selectAutomationField(elem.dataset.fieldId!);
                }
                else if (elem.id === "finish-automation") {
                        finishAutomationCreation(HTML.create.url.input.value.trim());
                }
                else if (elem.className === "automation-entry-delete") {
                        removeAutomation(elem);
                }
        });

        window.addEventListener(automationEvents.showModal.type, () => {
                startCreationFlow();
                HTML.modal.showModal();
        });

        window.addEventListener(automationEvents.addAutomation.type, (e: Event) => {
                const automation = (e as ReturnType<typeof automationEvents.addAutomation>).detail;

                AutomationsState.addAutomation(automation);
                addAutomationView(automation);
        });

        window.addEventListener(automationEvents.removeAutomation.type, (e: Event) => {
                const id = (e as ReturnType<typeof automationEvents.removeAutomation>).detail;

                AutomationsState.removeAutomation(id);
                removeAutomationById(id);
        });
}
