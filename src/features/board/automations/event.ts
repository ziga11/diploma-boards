import { HTML } from "./html";
import { deleteAutomation, insertAutomation } from "./logic";
import { automationState, clearState } from "./state";
import { addAutomations, fillFields, previousDiv, hideAutomation, setDiv, removeAutomation, showAutomation } from "./view";
import { showToast } from "@/core/utils/dom";
import { BoardStore } from "../board-state";
import { automationEvents } from "./custom-events";
import type { Automation } from "./types";
import { getAccount } from "@/core/utils/utils";

export function initAutomationEvents() {
        if (BoardStore.isInitialized) return;

        [HTML.create.btn, HTML.modify.createAutomationCta].forEach(btn =>
                btn.addEventListener("click", () => setDiv(HTML.create.type.div)));

        HTML.body.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;
                if (elem.classList[0] != "back-btn") return;

                previousDiv();
        })

        HTML.create.type.div.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.className !== "automation-option") return;

                automationState.automationId = Number(elem.dataset.automationType);

                fillFields()
                setDiv(HTML.create.field.div);
        });

        HTML.create.field.div.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;
                if (elem.className !== "automation-field-div") return;

                automationState.fieldId = elem.dataset.fieldId;

                setDiv(HTML.create.url.div);
        });

        HTML.create.url.input.addEventListener("blur", () => automationState.url = HTML.create.url.input.value);

        HTML.create.url.finish.addEventListener("click", async () => {
                let errText = "";

                const acc = await getAccount();
                const boardId = BoardStore.boardId;

                if (!acc) { errText = "Failed to get the account"; }
                else if (!boardId) { errText = "Failed to get the boardId"; }

                else if (!automationState.automationId) {
                        errText = "Failed to insert an automation: automationId not set";
                }
                else if (!automationState.url) {
                        errText = "Failed to insert an automation: url not set"
                }

                if (errText.length > 0) {
                        showToast(errText, "error");
                        return;
                }

                const automation: Automation = {
                        board_id: boardId!,
                        automation_id: automationState.automationId!,
                        field_id: automationState.fieldId,
                        url_call: automationState.url!,
                        account_id: acc!.id
                };
                const automationHTML = addAutomations(automation)[0];

                insertAutomation(automation)
                        .then(automation => {
                                automationHTML.dataset.id = `${automation.id}`;

                                setDiv(HTML.modify.existingAutomations);
                                HTML.create.url.input.value = "";
                                clearState();
                        })
                        .catch(err => {
                                showToast(`Failed to insert the automation ${err}`, "error");
                                automationHTML.remove();
                        });
        });


        HTML.modify.btn.addEventListener("click", () => {
                const hasAutomations = HTML.modify.existingAutomations.children.length > 0;

                setDiv(hasAutomations ? HTML.modify.existingAutomations : HTML.modify.noAutomations);
        });

        HTML.modify.existingAutomations.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.className != "automation-entry-delete") return;

                const parent = elem.closest(".created-board-automation") as HTMLDivElement;

                const id = parent.dataset.id;
                if (!id) {
                        showToast(`id was not set, bug`, "error");
                        return;
                }

                const div = hideAutomation(id);

                deleteAutomation(id)
                        .then(_ => removeAutomation(div))
                        .catch(err => {
                                showToast(`Failed to remove automation ${err}`, "error");
                                showAutomation(div);
                        });

        });

        window.addEventListener(automationEvents.showModal.type, () => {
                setDiv(HTML.create.type.div);
                HTML.modal.showModal();
        });
}
