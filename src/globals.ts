import { Supabase } from "./supabase.ts";
import type { Account, AutomationId, Entry, Field, } from "./types.ts";


export class Globals {
	static supabase = new Supabase();
	static account: Account | undefined;

	static automationOption: AutomationId | undefined;
	static selectedFieldId: number | undefined;
	static dblClick = false;
	static boardId: number;
	static fields: Map<number, Field> = new Map();

	static activeDropdown = {
		entry: null as Entry | null,
		elem: null as HTMLDivElement | null,
		addOption: null as HTMLDivElement | null,
	};
}
