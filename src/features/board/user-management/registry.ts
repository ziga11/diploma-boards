import "./user-management.css"
import { supabase } from "@/core/api/supabase";
import { createToken, MasterRegistry } from "@/features/board/master-registry";
import { UsersState } from "./state";
import type { UsersModuleInterface } from "./types";
import { workspaceToken } from "@/features/board/workspace/registry";
import { initUserManagementEvents } from "./event";

const publicInterface: UsersModuleInterface = {
        getCollaborators: () => UsersState.getCollaborators(),
        addCollaborator: (collaborator) => UsersState.addCollaborator(collaborator),
        updateCollaboratorPermission: (accountId, permissionId) => UsersState.updateCollaboratorPermission(accountId, permissionId),
        removeCollaborator: (accountId) => UsersState.removeCollaborator(accountId),


        getInvitedCollaborators: () => UsersState.getInvitedCollaborators(),
        addInvitedCollaborator: (invCollaborator) => UsersState.addInvitedCollaborator(invCollaborator),
        removeInvitedCollaborator: (email) => UsersState.removeInvitedCollaborator(email),
};

export const usersToken = createToken<UsersModuleInterface>("users");

export const UsersModule = {
        async init(): Promise<void> {
                const boardId = MasterRegistry.get(workspaceToken).getBoardId();
                if (!boardId) throw new Error("boardId no set");

                const collaborators = await supabase.fetchCollaborators(boardId);
                const invCollaborators = await supabase.fetchInvitedCollaborators(boardId);

                UsersState.setCollaborators(collaborators);
                UsersState.setInvitedCollaborators(invCollaborators);


                if (!UsersState.isInitialized()) {
                        initUserManagementEvents();

                        MasterRegistry.register(usersToken, publicInterface);
                        UsersState.setInitalized();
                }
        }
};
