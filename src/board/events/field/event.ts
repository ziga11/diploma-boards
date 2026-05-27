import { Globals } from "../../../globals";
import { setStateClass } from "../../../utils";
import { boardElements, editFieldModal, fieldTypes } from "../../types";
import { createFieldEntries } from "../../utils/entry";
import { addStatusOptionEvent, btnBlur, btnEnterPress, createFields, deleteFieldEvent, updateFieldNameEvent } from "../../utils/field";

Object.values(fieldTypes).forEach((fieldType: HTMLDivElement) => {
        fieldType.addEventListener("click", async () => {

                const data = await Globals.supabase.insertFieldWithEntries({
                        name: "",
                        type: fieldType.id,
                        board_id: Globals.board?.id,
                        account_id: Globals.account?.id
                })

                const newField = data.field;
                newField.fieldHelpers = [];

                Globals.fields.set(newField.id!, newField);
                boardElements.addFieldBtn.classList.remove("shown");

                createFields([newField]);
                createFieldEntries(Array(data.entry_count));
        });
});

editFieldModal.modal.addEventListener("hide.bs.modal", () => {
        editFieldModal.status.list.innerHTML = "";
        setStateClass([editFieldModal.status.section, editFieldModal.button.section], [], "d-none");

        editFieldModal.button.textInput.removeEventListener("keydown", btnEnterPress);
        editFieldModal.button.textInput.removeEventListener("blur", btnBlur);

        editFieldModal.status.addBtn.removeEventListener("click", addStatusOptionEvent);
        editFieldModal.saveFieldName.removeEventListener("click", updateFieldNameEvent)
        editFieldModal.deleteField.removeEventListener("click", deleteFieldEvent);
});

boardElements.newFieldBtn.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();

        if (boardElements.addFieldBtn.classList.contains("shown")) {
                boardElements.addFieldBtn.classList.remove("shown");
                return;
        }
        else {
                boardElements.addFieldBtn.classList.add("shown");
        }

        const buttonRect = boardElements.newFieldBtn.getBoundingClientRect();

        let horizPos: number;
        if (buttonRect.right < 1800) {
                horizPos = buttonRect.right + 10;
        }
        else {
                const fieldMenuWidth = parseInt(boardElements.addFieldBtn.style.width);
                horizPos = buttonRect.left - fieldMenuWidth - 10;
        }

        boardElements.addFieldBtn.style.left = horizPos + 'px';
        boardElements.addFieldBtn.style.top = buttonRect.top + 10 + window.scrollY + 'px';
});
