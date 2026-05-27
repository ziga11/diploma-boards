import type { User } from "@supabase/supabase-js";
import { Globals } from "./globals";
import type { Account } from "./types";

export function showToast(message: string, toastContainer: HTMLDivElement, type: 'success' | 'error' = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast.${type}`;

        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;

        const closeButton = document.createElement('span');
        closeButton.textContent = '✕';
        closeButton.addEventListener('click', () => {
                toast.remove();
        });

        Object.assign(closeButton.style, {
                marginRight: '15px',
                cursor: 'pointer',
                opacity: '0.7'
        });

        Object.assign(toast.style, {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
        });
        toast.append(messageSpan, closeButton);

        if (toastContainer) {
                toastContainer.appendChild(toast);
        } else {
                console.error("Toast container missing in boardElements!");
        }

        setTimeout(() => {
                toast.classList.add('toast-exit');
                toast.addEventListener('animationend', () => toast.remove());
        }, 4000);
}


export async function getAccount(): Promise<Account | undefined> {
        if (Globals.account) return Globals.account;

        const authUser = await Globals.supabase.getAuthUser();
        if (!authUser) return;

        return userToAccount(authUser)
}


function userToAccount(user: User): Account {
        const acc = {
                id: user.id,
                avatar_url: user.user_metadata.avatar_url,
                email: user.user_metadata.email,
                name: user.user_metadata.name,
                last_sign_in_date: user.user_metadata.last_sign_in_at,
        } as Account;

        return acc;
}

export function setStateClass(addTo: Array<Element>, removeFrom: Array<Element>, state: string) {
        addTo.forEach((elem) => {
                elem.classList.add(state);
        });
        removeFrom.forEach((elem) => {
                elem.classList.remove(state);
        });
}
