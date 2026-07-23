export interface EndPoint {
        method: "GET" | "POST" | "PATCH" | "DELETE",
        path: string,
        summary: string,
        params: EndPointParam[],
        body: EndPointParam[],
        response?: string,
        responses?: string[],
}

export interface EndPointParam {
        name: string,
        type: string,
        required: boolean,
        desc: string,
}
