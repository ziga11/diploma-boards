import { Supabase } from "./supabase.ts";
import type { Account, AutomationId, Entry, Field, ViewBoard, } from "./types.ts";


export class Globals {
        static supabase = new Supabase();
        static account: Account | undefined;

        static automationOption: AutomationId | undefined;
        static selectedFieldId: number | undefined;
        static board: ViewBoard | undefined;
        static fields: Map<number, Field> = new Map();

        static activeDropdown = {
                entry: null as Entry | null,
                elem: null as HTMLDivElement | null,
        };
}
