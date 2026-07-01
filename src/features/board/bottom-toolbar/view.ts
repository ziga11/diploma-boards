import { setStateClass } from "@/core/utils/dom";
import { HTML } from "./html";

export function setToolbarVisibility(visible: boolean, checkedCount: number = 0) {
        HTML.numEntriesDiv.innerText = `${checkedCount}`;
        setStateClass(visible ? [HTML.outerDiv] : [], visible ? [] : [HTML.outerDiv], "shown");
}
