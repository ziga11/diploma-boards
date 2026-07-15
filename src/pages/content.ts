export const pageContent: Record<string, HTMLDivElement> = {
        dashboard: Object.assign(document.createElement("div"), {
                className: "page-class",
                id: "page-dashboard",
                innerHTML: `
        <div id="toolbar">
                <div class="toolbar-left">
                    <div id="profile-pic">
                        <img id="profile-img" crossorigin="anonymous" width="80" height="80" referrerpolicy="no-referrer">
                        <i class="logout-icon ti ti-logout-2"></i>
                    </div>
                    <div class="user-info">
                        <h2 id="user-boards">My Boards</h2>
                        <p>Efficiently Organize Your Work</p>
                    </div>
                </div>
                <div class="toolbar-right">
                    <button type="button" id="notifications-modal-btn">
                        <i class="ti ti-bell"></i>
                        <span class="icon-item-new"></span>
                    </button>

                    <button type="button" type="button" id="api-modal-btn">
                        <i class="ti ti-api"></i>
                    </button>
                    <button type="button" id="add-board-modal-btn" class="btn-default">
                        <i class="ti ti-plus"></i>
                        New Table
                    </button>
                </div>
            </div>
            <div class="board-list">
                <div class="owned-boards">
                    <h4><b>My Boards</b></h4>
                    <div class="board-div"></div>
                    <div class="no-boards">
                        <div class="svg-wrapper"><i class="ti ti-layout-board"></i>
                        </div>
                        <p>You havent created any boards.</p>
                        <button type="button" class="btn-default" id="create-board-cta-btn">
                            <i class="ti ti-table-plus"></i>
                            Create Your First Board</button>
                    </div>
                </div>

                <div class="other-boards">
                    <h4><b>Shared with Me</b></h4>
                    <div class="board-div"></div>
                    <div class="no-boards">
                        <div class="svg-wrapper">
                            <i class="ti ti-users"></i>
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
                            <i class="ti ti-book"></i>
                            Docs
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
                            <i class="ti ti-plus"></i>
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
                        <i class="ti ti-copy"></i>
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
                    <div class="notificataions-container"></div>
                    <div class="no-notifications-container">
                        <div class="no-notif-icon">
                            <i class="ti ti-bell-off"></i>
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
                                <i class="ti ti-pencil"></i>
                            </div>
                            <div class="edit-title-icons">
                                <button type="button" class="confirm-button">
                                    <i class="ti ti-check"></i>
                                </button>
                                <i class="ti ti-x"></i>
                            </div>
                        </div>
                    </div>
                    <div class="top-toolbar-btns">
                        <div class="btns-container">
                            <button type="button" id="recover-btn" class="btn-default">
                                <i class="ti ti-restore"></i>
                                Recover
                            </button>
                            <button type="button" id="new-entry-btn" class="btn-default">
                                <i class="ti ti-rectangular-prism-plus"></i>
                                New Entry
                            </button>
                        </div>
                        <div class="btns-container">
                            <button type="button" id="add-user-btn" class="btn-default" data-bs-toggle="modal" data-bs-target="#add-user-modal">
                                <i class="ti ti-user-plus"></i>
                                Manage Users
                            </button>
                                <button type="button" class="btn btn-default" id="automate-btn" data-bs-toggle="modal" data-bs-target="#automate">
                                    <i class="ti ti-sitemap"></i>
                                    Automations
                            </button>
                            <button type="button" id="history-btn" class="btn-default">
                                <i class="ti ti-history"></i>
                                History
                            </button>
                        </div>
                        <div class="btns-container">
                            <button type="button" class="btn-default" id="delete-btn">
                                <i class="ti ti-trash"></i>
                                Delete
                            </button>
                            <button type="button" class="btn-default" id="leave-btn">
                                <i class="ti ti-door-enter"></i>
                                Leave
                            </button>
                        </div>
                    </div>
                </div>

                <dialog class="add-field-menu-dialog">
                    <div class="add-field-menu">
                        <div data-field-type="text">
                            <i class="ti ti-text-scan-2"></i>
                            Text
                        </div>
                        <div data-field-type="status">
                            <i class="ti ti-list-details"></i>
                            Status
                        </div>
                        <div data-field-type="button">
                            <i class="ti ti-click"></i>
                            Button
                        </div>
                        <div data-field-type="date">
                            <i class="ti ti-calendar-plus"></i>
                            Date
                        </div>
                    </div>
                </dialog>

                <dialog class="field-dropdown">
                    <div class="field-dropdown-options">
                        <button id="sort-ascending-btn" class="field-dropdown-option">
                             <i class="ti ti-sort-ascending-letters"></i>
                             Sort Ascending
                        </button>
                        <button id="sort-descending-btn" class="field-dropdown-option">
                             <i class="ti ti-sort-descending-letters"></i>
                             Sort Descending
                        </button>
                        <button id="edit-field" class="field-dropdown-option">
                             <i class="ti ti-settings"></i>
                             Edit Field
                        </button>
                    </div>
                </dialog>

                <div class="board-wrapper container my-5">
                    <div class="search-div">
                        <i class="ti ti-search" aria-hidden="true"></i>
                        <input type="text" id="search" placeholder="Search entries..." />
                    </div>
                    <div class="board-container">
                        <div class="disabled-pop-up">
                            <span><b>This board is disabled</b></span>
                        </div>
                        <div class="entries">
                            <div class="entries-viewport">
                                <div class="entry-rows"></div>
                            </div>
                            <div class="unloaded-indicator shown">
                                <i class="ti ti-dots"></i>
                                <p>8200 rows unloaded</p>
                            </div>

                            <div class="pinned-entry-rows"></div>
                        </div>
                        <div class="fields">
                            <div class="field-check-div">
                                <input type="checkbox" class="field-check">
                            </div>
                            <div class="pin-div"></div>
                            <button type="button" class="add-field-btn">
                                <i class="ti ti-plus"></i>
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
                                <i class="ti ti-sitemap"></i>
                                Create
                            </label>
                            <label for="modify-tab" class="modal-automation-options">
                                <input type="radio" name="automation-options" id="modify-tab" value="modify" hidden>
                                <i class="ti ti-sitemap-off"></i>
                                Modify
                            </label>
                        </fieldset>
                        <button type="button" class="btn-close" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="automate-body">
                        <div class="no-fields">
                            <div class="svg-wrapper">
                                <i class="ti ti-table-off"></i>
                            </div>
                            <b>No Fields Yet</b>
                            <p>Add a field to your board to enable automations</p>
                        </div>
                        <div class="no-automations">
                            <div class="svg-wrapper">
                                <i class="ti ti-layout-grid-add"></i>
                            </div>
                            <b>No existing automations.</b>
                            <button class="btn-default create-automation-cta" type="button">
                                <i class="ti ti-layout-grid-add"></i>
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
                                    <i class="ti ti-text-scan-2"></i>
                                    <span>Text Change</span>
                                </div>
                                <div class="automation-option" data-automation-type="2">
                                    <i class="ti ti-list-details"></i>
                                    <span>Status Change</span>
                                </div>
                                <div class="automation-option" data-automation-type="3">
                                    <i class="ti ti-click"></i>
                                    <span>Button Press</span>
                                </div>
                                <div class="automation-option" data-automation-type="4">
                                    <i class="ti ti-rectangular-prism-plus"></i>
                                    <span>New Row</span>
                                </div>
                                <div class="automation-option" data-automation-type="5">
                                    <i class="ti ti-rectangular-prism-off"></i>
                                    <span>Row Removed</span>
                                </div>
                                <div class="automation-option" data-automation-type="6">
                                    <i class="ti ti-replace"></i>
                                    <span>Any Change</span>
                                </div>
                            </div>
                        </div>
                        <div class="field-automation-selection">
                            <div class="url-call-header">
                                <button type="button" class="back-btn">
                                    <i class="ti ti-chevrons-left"></i>
                                </button>
                                <div>
                                    <p class="url-call-title">Select Field</p>
                                    <p class="url-call-subtitle">Field Selection · Choose which field to watch</p>
                                </div>
                            </div>
                            <div class="automation-fields-wrap"></div>
                            <div class="automation-no-existing-fields">
                                <div class="no-automations-icon">
                                    <i class="ti ti-layout-off"></i>
                                </div>
                                <p class="no-automations-title">No such fields exist</p>
                                <p class="no-automations-body">You need a board field that can trigger this automation.<br>
                                Create a new field first, or make sure your existing fields support actions like text edits, status changes, or button clicks.</p>
                            </div>
                        </div>
                        <div class="existing-automations"></div>
                        <div class="url-call-div">
                            <div class="url-call-header">
                                <button type="button" class="back-btn">
                                    <i class="ti ti-chevrons-left"></i>
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
                                        <i class="ti ti-link"></i>
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
                            <i class="ti ti-trash"></i>
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
                            <i class="ti ti-logout-2"></i>
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
                                <i class="ti ti-user-plus"></i>
                                Add
                            </label>
                            <label for="manage-users-section-btn" class="modal-user-management-options">
                                <input type="radio" name="permission-option" id="manage-users-section-btn" value="existing" hidden>
                                <i class="ti ti-users"></i>
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
                                        <i class="ti ti-user-plus"></i>
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
                                            <i class="ti ti-mail"></i>
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
                                    <i class="ti ti-user-plus"></i>
                                    Add collaborator
                                </button>
                            </div>
                        </div>
                        <div id="manage-users-section">
                            <div class="modal-body">
                                <div class="add-user-header">
                                    <div class="add-user-icon">
                                        <i class="ti ti-users-group"></i>
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
                            <i class="ti ti-trash"></i>
                        </button>
                        <button id="duplicate-selected-btn" type="button" title="Duplicate selected">
                            <i class="ti ti-stack-back"></i>
                        </button>
                        <button id="deselect-selected-btn" type="button" title="Deselect selected">
                            <i class="ti ti-x"></i>
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
                                <i class="ti ti-copy"></i>
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
                                    <i class="ti ti-new-section"></i>
                                    Add
                                </button>
                            </div>
                            <div class="status-option-nullable-div"><span>Nullable</span><input id="option-nullable-check" type="checkbox"/></div>
                        </div>

                        <div class="field-edit-section d-none" id="button-options-section">
                            <label class="field-edit-label">Button Options</label>
                            <input type="text" class="field-edit-input" id="button-text-input" placeholder="Button Text">
                        </div>

                        <div class="field-edit-section field-edit-danger-zone">
                            <label class="field-edit-label text-danger">Danger Zone</label>
                            <button class="modal-close-btn" id="delete-field-btn">
                                <i class="ti ti-trash"></i>
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
                        <div class="history-container">
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
                                    <button class="filter-btn filter-column" data-column="Field Option">Field Option</button>
                                    <button class="filter-btn filter-column" data-column="Board">Board</button>
                                    <button class="filter-btn filter-column" data-column="Automation">Automation</button>
                                </div>
                            </div>
                            <div class="history-list"></div>
                        </div>
                        <dialog class="payload-container"></dialog>
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
                                <i class="ti ti-mood-puzzled"></i>
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
