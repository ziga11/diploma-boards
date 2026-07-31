import "./workspace.css"
import { supabase } from "@/core/api/supabase";
import { createToken, MasterRegistry } from "@/features/board/master-registry";
import { initWorkspaceEvents } from "./events";
import { fetchBoardDB, initScrollObserver } from "./logic";
import { WorkspaceState } from "./state";
import type { WorkspaceModuleInterface } from "./types";
import { setBoardSettings } from "./view";

const publicInterface: WorkspaceModuleInterface = {
        getBoardId: () => WorkspaceState.getBoardId(),
        getBoard: () => WorkspaceState.getBoard(),

        getPermissionId: () => WorkspaceState.getPermissionId(),
        setPermissionId: (permissionId) => WorkspaceState.setPermissionId(permissionId),

        setDeleted: (deleted) => WorkspaceState.setDeleted(deleted),
};

export const workspaceToken = createToken<WorkspaceModuleInterface>("workspace");

export const WorkspaceModule = {
        async init(id: string): Promise<void> {
                const board = await fetchBoardDB(id);
                WorkspaceState.setBoard(board);

                setBoardSettings();

                await supabase.initBoardRealtime(id).catch(err => { throw err });
                initScrollObserver();

                if (!WorkspaceState.isInitialized()) {
                        initWorkspaceEvents();

                        MasterRegistry.register(workspaceToken, publicInterface);
                        WorkspaceState.setInitalized();
                }
        }
};
