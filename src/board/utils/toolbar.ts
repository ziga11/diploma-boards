import { Globals } from "../../globals";
import { PermissionId, type Entry } from "../../types";
import { setStateClass } from "../../utils";
import { addUserModal, boardElements, topToolbar } from "../types";

export function showAddUserSection() {
        console.log("xd", Globals.board, Globals.board?.permission_id);
        setStateClass([addUserModal.addUsers.div!], [addUserModal.manageUsers.div!], "shown")
        addUserModal.addUsers.btn.checked = true;
        addUserModal.manageUsers.btn.checked = false;

        if (Globals.board?.permission_id != PermissionId.Admin) {
                const inps = addUserModal.addUsers.div.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
                for (const inp of inps) {
                        console.log(inp);

                        inp.disabled = true;
                }
        }
}

export function showManageUsersSection() {
        setStateClass([addUserModal.manageUsers.div!], [addUserModal.addUsers.div!], "shown")
        addUserModal.addUsers.btn.checked = false;
        addUserModal.manageUsers.btn.checked = true;
}


export function firstDeepestNode(element: Element): Element {
        if (element.children.length == 0)
                return element;
        return firstDeepestNode(element.children[0]);
}

function extractEntryValue(entryHTML: HTMLInputElement | HTMLButtonElement | HTMLDivElement): string {
        if (entryHTML instanceof HTMLDivElement) return entryHTML.innerText;
        return entryHTML.type === "date" ? entryHTML.value : entryHTML.value + " copy";
}

export async function copyEntrySet(entrySet: HTMLDivElement, boardId: number): Promise<Array<Entry>> {
        const entrySetChildren = Array.from(entrySet.children).slice(1) as Array<HTMLElement>;

        let entries: Entry[] = []

        const rowCount = boardElements.entryChecks.length;
        for (const child of entrySetChildren) {
                const val = extractEntryValue(firstDeepestNode(child) as HTMLInputElement | HTMLButtonElement | HTMLDivElement)

                const entry: Entry = {
                        field_id: Number(child.dataset.fieldId),
                        value: val,
                        account_id: Globals.account?.id,
                        board_id: boardId,
                        index: rowCount + 1,
                };

                entries.push(entry);
        }

        return await Globals.supabase.insertEntries(entries);
}

export function initTopToolbar() {
        if (!Globals.board) return;

        if (Globals.board.permission_id == PermissionId.Member) {
                boardElements.fieldCheck.disabled = true;
        }

        if (Globals.board.permission_id >= PermissionId.Editor) {
                setStateClass([topToolbar.left.newEntryBtn], [], "shown")
                setStateClass([boardElements.newFieldBtn], [], "shown")
        }

        if (Globals.board.permission_id >= PermissionId.Manager) {
                setStateClass([topToolbar.right.automationsBtn], [], "shown")
        }

        if (Globals.board.permission_id == PermissionId.Admin) {
                setStateClass([topToolbar.right.deleteBoardBtn], [], "shown")
                setStateClass([topToolbar.left.addUserBtn], [], "shown")
        }
        else {
                setStateClass([topToolbar.right.leaveBoardBtn], [], "shown")
        }
}
