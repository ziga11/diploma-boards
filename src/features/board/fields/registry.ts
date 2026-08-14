import "./fields.css"
import { createToken, MasterRegistry } from "@/features/board/master-registry";
import { FieldsState } from "./state";
import { fetchFields } from "./logic/api";
import type { FieldModuleInterface } from "./types";
import { initFieldEvents } from "./event";
import { applyPermissionRestrictions, setFieldDivs } from "./ui/field";
import { restoreBoardSorting } from "./logic/operations";
import { workspaceToken } from "@/features/board/workspace/registry";
import { PermissionId } from "@/core/types/auth";

const publicInterface: FieldModuleInterface = {
        getFieldById: (id) => FieldsState.getFieldById(id),
        getFieldOptions: (id) => FieldsState.getOptions(id),

        getOptionById: (id) => FieldsState.getOptionById(id),

        getAllFields: () => FieldsState.getAllFields(),
        getSortedFields: () => FieldsState.getSortedFields(),

        getFieldCount: () => FieldsState.fieldCount(),
        hasFields: () => FieldsState.hasFields(),

        getSortedByInfo: () => FieldsState.getSortingInfo(),
};

export const fieldsToken = createToken<FieldModuleInterface>("fields");

export const FieldsModule = {
        async init(): Promise<void> {
                const fields = await fetchFields();

                FieldsState.setFields(fields);

                restoreBoardSorting();

                setFieldDivs(fields);
                const isMember = MasterRegistry.get(workspaceToken).getPermissionId() == PermissionId.Member;
                applyPermissionRestrictions(isMember);

                if (!FieldsState.isInitialized()) {
                        initFieldEvents();

                        FieldsState.setInitalized();
                        MasterRegistry.register(fieldsToken, publicInterface);
                }
        }
};
