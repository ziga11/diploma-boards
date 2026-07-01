export const HTML = {
        get activePage() { return document.querySelector(`#page-login`) || document },

        get loading() { return this.activePage.querySelector('#loading') as HTMLDivElement },
        get form() { return this.activePage.querySelector('#login-form') as HTMLDivElement },

        get userInfo() { return this.activePage.querySelector('#user-info') as HTMLDivElement },
        get error() { return this.activePage.querySelector('#error') as HTMLDivElement },

        get loginBtn() { return this.activePage.querySelector('#google-login-btn') as HTMLButtonElement },
        get logoutBtn() { return this.activePage.querySelector('#logout-btn') as HTMLButtonElement },

        get email() { return this.activePage.querySelector('#email') as HTMLSpanElement },
        get name() { return this.activePage.querySelector('#name') as HTMLSpanElement },
}
