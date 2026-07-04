export const pageContent: Record<string, HTMLDivElement> = {
        dashboard: Object.assign(document.createElement("div"), {
                className: "page-class",
                id: "page-dashboard",
                innerHTML: `
        <div id="toolbar">
                <div class="toolbar-left">
                    <div id="profile-pic">
                        <img id="profile-img" crossorigin="anonymous" width="80" height="80" referrerpolicy="no-referrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="logout-icon bi bi-box-arrow-left"
                            viewBox="0 0 16 16">
                            <path fill-rule="evenodd"
                                d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z" />
                            <path fill-rule="evenodd"
                                d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z" />
                        </svg>
                    </div>
                    <div class="user-info">
                        <h2 id="user-boards">My Boards</h2>
                        <p>Efficiently Organize Your Work</p>
                    </div>
                </div>
                <div class="toolbar-right">
                    <button type="button" id="notifications-modal-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" id="bell" width="16" height="16" fill="currentColor"
                            class="bi bi-bell" viewBox="0 0 16 16">
                            <path
                                d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
                        </svg>
                        <span class="icon-item-new"></span>
                    </button>

                    <button type="button" type="button" id="api-modal-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="icon icon-tabler icons-tabler-outline icon-tabler-api">
                            <path d="M4 13h5" />
                            <path d="M12 16v-8h3a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2h-3" />
                            <path d="M20 8v8" />
                            <path d="M9 16v-5.5a2.5 2.5 0 0 0 -5 0v5.5" />
                        </svg>
                    </button>
                    <button type="button" id="add-board-modal-btn" class="btn-default">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-plus">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M12 5l0 14" />
                                <path d="M5 12l14 0" />
                        </svg>
                        New Table
                    </button>
                </div>
            </div>
            <div class="board-list">
                <div class="owned-boards">
                    <h4><b>My Boards</b></h4>
                    <div class="board-div"></div>
                    <div class="no-boards">
                        <div class="svg-wrapper">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                class="icon icon-tabler icons-tabler-outline icon-tabler-layout-board">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" />
                                <path d="M4 9h8" />
                                <path d="M12 15h8" />
                                <path d="M12 4v16" />
                            </svg>
                        </div>
                        <p>You havent created any boards.</p>
                        <button type="button" class="btn-default" id="create-board-cta-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                class="icon icon-tabler icons-tabler-outline icon-tabler-table-plus">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M12.5 21h-7.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v7.5" />
                                <path d="M3 10h18" />
                                <path d="M10 3v18" />
                                <path d="M16 19h6" />
                                <path d="M19 16v6" />
                            </svg>
                            Create Your First Board</button>
                    </div>
                </div>

                <div class="other-boards">
                    <h4><b>Shared with Me</b></h4>
                    <div class="board-div"></div>
                    <div class="no-boards">
                        <div class="svg-wrapper">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                class="bi bi-people" viewBox="0 0 16 16">
                                <path
                                    d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                            </svg>
                        </div>
                        <p>Boards others share with you will appear here</p>
                    </div>
                </div>

                <div class="deleted-boards">
                    <h4><b>Deleted Boards</b></h4>
                    <div class="board-div"></div>
                </div>
            </div>

            <dialog id="add-board-modal" class="modal modal-sm">
                <div class="modal-header">
                <h5 class="modal-title">Add new board</h5>
                    <button type="button" class="btn-close" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="form-group mb-4">
                        <input id="new-board-name" type="text" placeholder="Board Name" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="color-label"><b>Table Color</b></label>
                        <div class="color-picker-wrapper">
                            <input type="color" id="board-color-picker" class="color-picker-input" value="#ff4757">
                            <input type="text" id="color-hex-input" class="color-hex-input" maxlength="7" value="#ff4757">
                        </div>
                        <div class="preset-colors">
                            <button type="button" class="preset-color active" data-color="#ff4757"></button>
                            <button type="button" class="preset-color" data-color="#3742fa"></button>
                            <button type="button" class="preset-color" data-color="#2ed573"></button>
                            <button type="button" class="preset-color" data-color="#ff6348"></button>
                            <button type="button" class="preset-color" data-color="#ff6b9d"></button>
                            <button type="button" class="preset-color" data-color="#a55eea"></button>
                            <button type="button" class="preset-color" data-color="#7bed9f"></button>
                            <button type="button" class="preset-color" data-color="#1dd1a1"></button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="modal-add-btn" id="trigger-add-board">Add Table</button>
                    <button type="button" class="modal-close-btn">Cancel</button>
                </div>
            </dialog>

            <dialog id="api-keys-modal" class="modal modal-sm">
                <div class="modal-header">
                    <h5 class="modal-title">API Keys</h5>
                    <div class="modal-header-actions">
                        <a class="api-docs-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-book" viewBox="0 0 16 16">
                                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
                            </svg>
                            Docs
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 0-.5.5h-10a.5.5 0 0 0-.5-.5v-10a.5.5 0 0 0 .5-.5h6.636a.5.5 0 0 0 .5-.5" />
                                <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z" />
                            </svg>
                        </a>
                        <button type="button" class="btn-close" aria-label="Close"></button>
                    </div>
                </div>
                <div class="modal-body">
                    <div id="api-keys-list"></div>
                    <hr class="api-keys-divider">
                    <div class="api-key-input-row">
                        <input type="text" id="new-api-key-name" class="api-key-name-input" placeholder="Key name (e.g. My app)">
                        <button type="button" class="api-generate-btn" id="generate-api-key">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                            </svg>
                            Generate
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="api-docs-modal" class="modal modal-lg">
                <div class="modal-header api-docs-header">
                    <h5 class="modal-title">API Documentation</h5>
                    <button type="button" class="btn-close" aria-label="Close"></button>
                </div>
                <div id="base-url">
                    <span class="base-url-label">BASE URL</span>
                    <span class="base-url-value">https://ywsumeablzezlaoiufts.supabase.co/functions/v1/v1</span>
                    <button class="base-url-copy">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z" />
                        </svg>
                    </button>
                </div>
                <div class="modal-body api-docs-body">
                    <div class="api-docs-tabs">
                        <button class="api-tab active" data-resource="boards">Boards</button>
                        <button class="api-tab" data-resource="fields">Fields</button>
                        <button class="api-tab" data-resource="entries">Entries</button>
                        <button class="api-tab" data-resource="field-options">Field Options</button>
                        <button class="api-tab" data-resource="users">Users</button>
                    </div>
                    <div id="api-docs-endpoints" class="api-docs-endpoints"></div>
                </div>
            </dialog>

            <dialog id="notifications-modal" class="modal modal-sm">
                <div class="modal-header">
                    <h5 class="modal-title">Notifications</h5>
                    <button type="button" class="btn-close" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="notificataions-container shown"></div>
                    <div class="no-notifications-container">
                        <div class="no-notif-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-bell-off">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M9.346 5.353c.21 -.129 .428 -.246 .654 -.353a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3m-1 3h-13a4 4 0 0 0 2 -3v-3a6.996 6.996 0 0 1 1.273 -3.707" />
                                <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
                                <path d="M3 3l18 18" />
                            </svg>
                        </div>
                        <p class="no-notif-title">No notifications</p>
                        <p class="no-notif-body">Boards others share with you will appear here</p>
                    </div>
                </div>
            </dialog>

`}),

        board: Object.assign(document.createElement("div"), {
                id: "page-board",
                className: "page-class",
                innerHTML: `
                <button class="btn-cancel" id="back-button">Back</button>
                <div id="toolbar-board">
                    <div class="title-display">
                        <b class="title-text" contenteditable="true" data-db-value="xd">xd</b>
                        <div class="icons">
                            <div class="hover-title-icons shown">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"></path>
                                    <path d="M13.5 6.5l4 4"></path>
                                </svg>
                            </div>
                            <div class="edit-title-icons">
                                <button type="button" class="confirm-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-check">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M5 12l5 5l10 -10"></path>
                                    </svg>
                                </button>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M18 6l-12 12"></path>
                                    <path d="M6 6l12 12"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="top-toolbar-btns">
                        <div class="btns-container">
                            <button type="button" id="recover-btn" class="btn-default">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-restore">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M3.06 13a9 9 0 1 0 .49 -4.087" />
                                        <path d="M3 4.001v5h5" />
                                        <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                                </svg>
                                Recover
                            </button>
                            <button type="button" id="new-entry-btn" class="btn-default">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-cube-plus">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M21 12.5v-4.509a1.98 1.98 0 0 0 -1 -1.717l-7 -4.008a2.016 2.016 0 0 0 -2 0l-7 4.007c-.619 .355 -1 1.01 -1 1.718v8.018c0 .709 .381 1.363 1 1.717l7 4.008a2.016 2.016 0 0 0 2 0"></path>
                                    <path d="M12 22v-10"></path>
                                    <path d="M12 12l8.73 -5.04"></path>
                                    <path d="M3.27 6.96l8.73 5.04"></path>
                                    <path d="M16 19h6"></path>
                                    <path d="M19 16v6"></path>
                                </svg>
                                New Entry
                            </button>
                        </div>
                        <div class="btns-container">
                            <button type="button" id="add-user-btn" class="btn-default" data-bs-toggle="modal" data-bs-target="#add-user-modal">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-user-plus">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"></path>
                                    <path d="M16 19h6"></path>
                                    <path d="M19 16v6"></path>
                                    <path d="M6 21v-2a4 4 0 0 1 4 -4h4"></path>
                                </svg>
                                Manage Users
                            </button>
                                <button type="button" class="btn btn-default" id="automate-btn" data-bs-toggle="modal" data-bs-target="#automate">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-settings-automation">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065"></path>
                                        <path d="M10 9v6l5 -3l-5 -3"></path>
                                    </svg>
                                    Automations
                            </button>
                            <button type="button" id="history-btn" class="btn-default">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-history">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M12 8l0 4l2 2"></path>
                                    <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path>
                                </svg>
                                History
                            </button>
                        </div>
                        <div class="btns-container">
                            <button type="button" class="btn-default" id="delete-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-trash">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M4 7l16 0"></path>
                                    <path d="M10 11l0 6"></path>
                                    <path d="M14 11l0 6"></path>
                                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
                                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
                                </svg>
                                Delete
                            </button>
                            <button type="button" class="btn-default" id="leave-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-door-exit">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M13 12v.01"></path>
                                    <path d="M3 21h18"></path>
                                    <path d="M5 21v-16a2 2 0 0 1 2 -2h7.5m2.5 10.5v7.5"></path>
                                    <path d="M14 7h7m-3 -3l3 3l-3 3"></path>
                                </svg>
                                Leave
                            </button>
                        </div>
                    </div>
                </div>

                <dialog class="add-field-menu">
                    <div data-field-type="text">
                        <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 6.2V5h11v1.2M8 5v14m-3 0h6m2-6.8V11h8v1.2M17 11v8m-1.5 0h3" />
                        </svg>
                        Text
                    </div>
                    <div data-field-type="status">
                        <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 7h14M5 12h14M5 17h10" />
                        </svg>
                        Status
                    </div>
                    <div data-field-type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <g>
                                <path
                                    d="M14.4174 4.54688H5.58133C4.27696 4.54688 3.24609 5.57882 3.24609 6.88454C3.24609 8.1692 4.27696 9.2222 5.58133 9.2222H9.38591L9.40445 8.06813C9.42033 7.07868 10.5774 6.55552 11.3261 7.19927L13.6787 9.2222H14.4174C15.7007 9.2222 16.7526 8.19026 16.7526 6.88454C16.7526 5.59988 15.7217 4.54688 14.4174 4.54688Z"
                                    fill="#fff" />
                            </g>

                            <g>
                                <path
                                    d="M10.6129 8.41176C10.616 8.21581 10.8418 8.1122 10.9879 8.23969L15.375 12.0678C15.5204 12.1946 15.4561 12.4365 15.2677 12.4713L13.9142 12.7215C13.6692 12.7776 13.5332 13.0585 13.642 13.2831L14.3619 14.719C14.4163 14.8276 14.3788 14.9605 14.276 15.023L13.6178 15.4235C13.5006 15.4949 13.3485 15.4454 13.2934 15.3181L12.6077 13.7324C12.4988 13.5078 12.1994 13.4235 12.0089 13.592L10.8878 14.4963C10.7375 14.6176 10.5165 14.5064 10.5196 14.3111L10.6129 8.41176Z"
                                    fill="#fff" />
                            </g>
                        </svg>

                        Button
                    </div>
                    <div data-field-type="date">
                        <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd"
                                d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
                                clip-rule="evenodd" />
                        </svg>
                        Date
                    </div>
                </dialog>


                <div class="board-wrapper container my-5">
                    <div class="board-container">
                        <div class="disabled-pop-up">
                            <span><b>This board is disabled</b></span>
                        </div>
                        <div class="entries"></div>
                        <div class="fields">
                            <div class="field-check-div">
                                <input type="checkbox" class="field-check">
                            </div>
                            <button type="button" class="add-field-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                    class="bi bi-plus-lg" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd"
                                        d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <dialog id="automate" class="modal modal-lg">
                    <div class="modal-header">
                        <h2 class="modal-title">Automations</h2>
                        <fieldset class="automation-menu">
                            <label for="create-tab" class="modal-automation-options">
                                <input type="radio" name="automation-options" id="create-tab" value="create" hidden checked>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil-plus">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                    <path d="M16 19h6" />
                                    <path d="M19 16v6" />
                                </svg>
                                Create
                            </label>
                            <label for="modify-tab" class="modal-automation-options">
                                <input type="radio" name="automation-options" id="modify-tab" value="modify" hidden>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-edit">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                                    <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" />
                                    <path d="M16 5l3 3" />
                                </svg>
                                Modify
                            </label>
                        </fieldset>
                        <button type="button" class="btn-close" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="automate-body">
                        <div class="no-fields">
                            <div class="svg-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6" />
                                    <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
                                    <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
                                </svg>
                            </div>
                            <b>No Fields Yet</b>
                            <p>Add a field to your board to enable automations</p>
                        </div>
                        <div class="no-automations">
                            <div class="svg-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065" />
                                    <path d="M10 9v6l5 -3l-5 -3" />
                                </svg>
                            </div>
                            <b>No existing automations.</b>
                            <button class="btn-default create-automation-cta" type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M13 20.693c-.905 .628 -2.36 .292 -2.675 -1.01a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.492 .362 1.716 2.219 .674 3.03" />
                                    <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                                    <path d="M19 16v6" />
                                    <path d="M16 19h6" />
                                </svg>
                                Create an Automation
                            </button>
                        </div>
                        <div class="create-automations">
                            <div class="url-call-header">
                                <div>
                                    <p class="url-call-title">Select Type</p>
                                    <p class="url-call-subtitle">Trigger Type · Choose an action to trigger the automation</p>
                                </div>
                            </div>
                            <div class="automation-options-container">
                                <div class="automation-option" data-automation-type="1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                        <path d="M13.5 6.5l4 4" />
                                    </svg>
                                    <span>Text Change</span>
                                </div>
                                <div class="automation-option" data-automation-type="2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M6 18m-2 0a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                                        <path d="M18 6m-2 0a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                                        <path d="M6 12h5.5a2.5 2.5 0 0 1 0 5h-.5" />
                                        <path d="M18 12h-5.5a2.5 2.5 0 0 1 0 -5h.5" />
                                    </svg>
                                    <span>Status Change</span>
                                </div>
                                <div class="automation-option" data-automation-type="3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M7 11.5v-6.5a2 2 0 0 1 4 0v3" />
                                        <path d="M11 5.5a2 2 0 0 1 4 0v2.5" />
                                        <path d="M15 8a2 2 0 0 1 4 0v3.5" />
                                        <path d="M7 11.5h2l1 9h6l.5 -4.5h1.5" />
                                    </svg>
                                    <span>Button Press</span>
                                </div>
                                <div class="automation-option" data-automation-type="4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
                                        <path d="M3 10h18" />
                                        <path d="M10 3v18" />
                                        <path d="M16 19h6" />
                                        <path d="M19 16v6" />
                                    </svg>
                                    <span>New Row</span>
                                </div>
                                <div class="automation-option" data-automation-type="5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M4 7h16" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
                                        <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                        <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                    </svg>
                                    <span>Row Removed</span>
                                </div>
                                <div class="automation-option" data-automation-type="6">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065" />
                                        <path d="M10 9v6l5 -3l-5 -3" />
                                    </svg>
                                    <span>Any Change</span>
                                </div>
                            </div>
                        </div>
                        <div class="field-automation-selection">
                            <div class="url-call-header">
                                <button type="button" class="back-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M15 6l-6 6l6 6" />
                                    </svg>
                                </button>
                                <div>
                                    <p class="url-call-title">Select Field</p>
                                    <p class="url-call-subtitle">Field Selection · Choose which field to watch</p>
                                </div>
                            </div>
                            <div class="automation-fields-wrap"></div>
                        </div>
                        <div class="existing-automations"></div>
                        <div class="url-call-div">
                            <div class="url-call-header">
                                <button type="button" class="back-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M15 6l-6 6l6 6" />
                                    </svg>
                                </button>
                                <div>
                                    <p class="url-call-title">Webhook URL</p>
                                    <p class="url-call-subtitle" id="url-call-subtitle">Field · Trigger Type</p>
                                </div>
                            </div>
                            <div class="url-call-body">
                                <div class="url-call-field">
                                    <label class="field-label">ENDPOINT URL</label>
                                    <div class="url-input-wrap">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#797E93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M9 15l6 -6" />
                                            <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
                                            <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />
                                        </svg>
                                        <input type="text" id="url-call" placeholder="https://your-endpoint.com/webhook" />
                                    </div>
                                    <p class="url-call-hint">A POST request will be sent to this URL when the trigger fires.</p>
                                </div>
                                <div class="url-call-actions">
                                    <button type="button" class="back-btn modal-close-btn" id="back-url-call">Back</button>
                                    <button type="button" class="url-btn-create" id="finish-automation">Create Automation</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </dialog>

                <dialog id="delete-board-modal" class="modal modal-xsm">
                    <div class="warning-flex-div">
                        <div class="confirm-icon confirm-icon--danger">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M4 7h16" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                            </svg>
                        </div>
                        <div class="warning-text">
                            <h5 class="confirm-title">Delete board?</h5>
                            <p class="confirm-desc">This action is permanent and cannot be undone. All data will be lost.</p>
                        </div>
                    </div>
                    <div class="confirm-btns">
                        <button type="button" class="modal-close-btn">Cancel</button>
                        <button type="button" class="btn-default confirm-btn-danger" id="confirm-delete">Delete</button>
                    </div>
                </dialog>

                <dialog id="leave-board-modal" class="modal modal-xsm">
                    <div class="warning-flex-div">
                        <div class="confirm-icon confirm-icon--danger">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                                <path d="M9 12h12l-3 -3" />
                                <path d="M18 15l3 -3" />
                            </svg>
                        </div>
                        <div class="warning-text">
                            <h5 class="confirm-title">Leave board?</h5>
                            <p class="confirm-desc">You'll lose access immediately. You'll need to be re-invited to rejoin.</p>
                        </div>
                    </div>
                    <div class="confirm-btns">
                        <button type="button" class="modal-close-btn">Cancel</button>
                        <button type="button" class="btn-default confirm-btn-danger" id="confirm-leave">Leave</button>
                    </div>
                </dialog>

                <dialog id="add-user-modal" class="modal modal-md">
                    <div class="modal-header">
                        <fieldset class="user-permissions">
                            <label for="add-users-section-btn" class="modal-user-management-options">
                                <input type="radio" name="permission-option" id="add-users-section-btn" value="adding" hidden checked>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                    <path d="M16 19h6" />
                                    <path d="M19 16v6" />
                                </svg>
                                Add
                            </label>
                            <label for="manage-users-section-btn" class="modal-user-management-options">
                                <input type="radio" name="permission-option" id="manage-users-section-btn" value="existing" hidden>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                                    <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" />
                                    <path d="M16 5l3 3" />
                                </svg>
                                Modify
                            </label>
                        </fieldset>
                        <button type="button" class="btn-close" aria-label="Close"></button>
                    </div>
                    <div class="user-modal-sections">
                        <div id="add-user-section" class="shown">
                            <div class="modal-body">
                                <div class="add-user-header">
                                    <div class="add-user-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B68EE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                                            <path d="M16 19h6" />
                                            <path d="M19 16v6" />
                                            <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="add-user-title">Invite collaborator</p>
                                        <p class="add-user-subtitle">They'll receive access based on the permission you choose</p>
                                    </div>
                                </div>
                                <div class="add-user-fields">
                                    <div class="add-user-field">
                                        <label class="add-user-field-label">EMAIL ADDRESS</label>
                                        <div class="email-input-wrap">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#797E93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
                                                <path d="M3 7l9 6l9 -6" />
                                            </svg>
                                            <input id="add-user-email" type="text" placeholder="name@example.com" />
                                        </div>
                                    </div>
                                    <div class="add-user-field">
                                        <label class="add-user-field-label">PERMISSION LEVEL</label>
                                        <div class="permission-cards">
                                            <label class="permission-card">
                                                <input type="radio" name="add-user-permission" value="1" />
                                                <div>
                                                    <p class="permission-name">Member</p>
                                                    <p class="permission-desc">View only</p>
                                                </div>
                                            </label>
                                            <label class="permission-card">
                                                <input type="radio" name="add-user-permission" value="2" />
                                                <div>
                                                    <p class="permission-name">Editor</p>
                                                    <p class="permission-desc">View and edit</p>
                                                </div>
                                            </label>
                                            <label class="permission-card">
                                                <input type="radio" name="add-user-permission" value="3" />
                                                <div>
                                                    <p class="permission-name">Manager</p>
                                                    <p class="permission-desc">View, edit and automations</p>
                                                </div>
                                            </label>
                                            <label class="permission-card">
                                                <input type="radio" name="add-user-permission" value="4" />
                                                <div>
                                                    <p class="permission-name">Admin</p>
                                                    <p class="permission-desc">Full access including invites</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button class="modal-close-btn">Cancel</button>
                                <button id="finish-adding-user" class="btn-add">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M16 19h6" />
                                        <path d="M19 16v6" />
                                        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                                        <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
                                    </svg>
                                    Add collaborator
                                </button>
                            </div>
                        </div>
                        <div id="manage-users-section">
                            <div class="modal-body">
                                <div class="add-user-header">
                                    <div class="add-user-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" stroke="#7B68EE" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-users-group">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                                                <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" />
                                                <path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                                                <path d="M17 10h2a2 2 0 0 1 2 2v1" />
                                                <path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                                                <path d="M3 13v-1a2 2 0 0 1 2 -2h2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="add-user-title">Added users</p>
                                        <p class="add-user-subtitle">These people have access to view the board and more depending on their role</p>
                                    </div>
                                </div>
                                <div class="user-container"></div>
                            </div>
                            <div class="modal-footer">
                                <button class="modal-close-btn">Close</button>
                            </div>
                        </div>
                    </div>
                </dialog>

                <div class="bottom-toolbar">
                    <div class="entries-selected-div">
                    </div>
                    <div class="checked-options-buttons">
                        <button id="delete-selected-btn" type="button" title="Delete selected">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-trash3"
                                viewBox="0 0 16 16">
                                <path
                                    d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5">
                                </path>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor"
                                class="bi bi-trash3-fill" viewBox="0 0 16 16">
                                <path
                                    d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                            </svg>
                        </button>
                        <button id="duplicate-selected-btn" type="button" title="Duplicate selected">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-layers"
                                viewBox="0 0 16 16">
                                <path
                                    d="M8.235 1.559a.5.5 0 0 0-.47 0l-7.5 4a.5.5 0 0 0 0 .882L3.188 8 .264 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l2.922-1.559a.5.5 0 0 0 0-.882zm3.515 7.008L14.438 10 8 13.433 1.562 10 4.25 8.567l3.515 1.874a.5.5 0 0 0 .47 0zM8 9.433 1.562 6 8 2.567 14.438 6z" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor"
                                class="bi bi-layers-fill" viewBox="0 0 16 16">
                                <path
                                    d="M7.765 1.559a.5.5 0 0 1 .47 0l7.5 4a.5.5 0 0 1 0 .882l-7.5 4a.5.5 0 0 1-.47 0l-7.5-4a.5.5 0 0 1 0-.882z" />
                                <path
                                    d="m2.125 8.567-1.86.992a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882l-1.86-.992-5.17 2.756a1.5 1.5 0 0 1-1.41 0z" />
                            </svg>
                        </button>
                        <button id="deselect-selected-btn" type="button" title="Deselect selected">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-x-lg"
                                title="delete" viewBox="0 0 16 16">
                                <path
                                    d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z">
                                </path>
                            </svg>
                        </button>
                    </div>
                </div>

                <dialog class="dropdown-menu">
                    <div class="dropdown-options"></div>
                </dialog>
            
                <dialog id="field-edit-modal" class="modal modal-sm" aria-labelledby="field-edit-modal-label">
                    <div class="modal-header field-edit-modal-header">
                        <div class="field-edit-modal-title-wrap">
                            <h5 class="modal-title" id="field-edit-modal-label">Edit Field</h5>

                            <div class="id-div">
                                <span class="id-text" id="field-edit-id"></span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"></path>
                                </svg>
                            </div>

                        </div>
                        <button type="button" class="btn-close" aria-label="Close"></button>
                    </div>
                    <div class="modal-body field-edit-modal-body">
                        <div class="field-edit-section">
                            <label class="field-edit-label">Field Name</label>
                            <input type="text" id="field-name-input" class="field-edit-input" placeholder="Enter field name" />
                        </div>

                        <div class="field-edit-section d-none" id="status-options-section">
                            <label class="field-edit-label">Status Options</label>
                            <div id="status-options-list" class="status-options-list"></div>
                            <div class="add-status-option-wrap" id="add-status-option-section">
                                <input type="text" id="new-status-option-input" class="field-edit-input" placeholder="New option name" />
                                <button class="btn-default" id="add-status-option-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M9 12h6" />
                                        <path d="M12 9v6" />
                                        <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14" />
                                    </svg>
                                    Add
                                </button>
                            </div>
                        </div>

                        <div class="field-edit-section d-none" id="button-options-section">
                            <label class="field-edit-label">Button Options</label>
                            <input type="text" class="field-edit-input" id="button-text-input" placeholder="Button Text">
                        </div>

                        <div class="field-edit-section field-edit-danger-zone">
                            <label class="field-edit-label text-danger">Danger Zone</label>
                            <button class="modal-close-btn" id="delete-field-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M4 7l16 0" />
                                    <path d="M10 11l0 6" />
                                    <path d="M14 11l0 6" />
                                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                </svg>
                                Delete this field
                            </button>
                        </div>
                    </div>
                </dialog>
                <dialog id="history-modal" class="modal modal-lg">
                    <div class="modal-header">
                        <h3>Change History</h3>
                        <button class="modal-close" id="history-close">&times;</button>
                    </div>
                    </div class="modal-body">
                        <div class="history-filters" data-filter="action">
                            <div class="filter-group" data-filter="action">
                                <button class="filter-btn filter-action active" data-action="ALL">ALL</button>
                                <button class="filter-btn filter-action" data-action="INSERT">INSERT</button>
                                <button class="filter-btn filter-action" data-action="UPDATE">UPDATE</button>
                                <button class="filter-btn filter-action" data-action="DELETE">DELETE</button>
                            </div>
                            <div class="filter-group" data-filter="column">
                                <button class="filter-btn filter-column active" data-column="ALL">ALL</button>
                                <button class="filter-btn filter-column" data-column="Entry">Entry</button>
                                <button class="filter-btn filter-column" data-column="Field">Field</button>
                                <button class="filter-btn filter-column" data-column="Field Helper">Field Helper</button>
                                <button class="filter-btn filter-column" data-column="Board">Board</button>
                                <button class="filter-btn filter-column" data-column="Automation">Automation</button>
                            </div>
                        </div>
                        <div class="history-list"></div>
                    </div>
                </dialog>`
        }),

        "404": Object.assign(document.createElement("div"), {
                id: "page-404",
                className: "page-class",
                innerHTML: `
                <div class="container">
                        <div class="big-number">404</div>
                        <div class="card">
                            <div class="icon-wrap">
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor"
                                    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                    <path d="M11 8v3M11 14h.01" />
                                </svg>
                            </div>
                            <h1>Page not found</h1>
                            <p>The page you're looking for doesn't exist or has been moved.</p>
                            <div class="divider"></div>
                            <div class="actions">
                                <a href="/" class="btn-default">Dashboard</a>
                                <a class="btn-back btn-default">Go back</a>
                            </div>
                        </div>
                    </div>`,
        }),

        login: Object.assign(document.createElement("div"), {
                id: "page-login",
                className: "page-class",
                innerHTML: `
            <div class="login-container">
                <div class="logo">
                    <h1>Welcome</h1>
                    <p>Log in to continue</p>
                </div>

                <div id="error" class="error"></div>

                <div id="loading" class="loading">Loading...</div>

                <div id="login-form" style="display: none;">
                    <button id="google-login-btn" class="google-btn">
                        <svg class="google-icon" viewBox="0 0 24 24">
                            <path fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <div id="user-info" class="user-info-container">
                    <h2>Welcome back!</h2>
                    <p><strong>E-Mail:</strong> <span id="email"></span></p>
                    <p><strong>Name:</strong> <span id="name"></span></p>
                    <button id="logout-btn" class="logout-btn">Log Out</button>
                </div>
            </div>`}),
}
