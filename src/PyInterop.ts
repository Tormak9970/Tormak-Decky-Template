import { ServerAPI, ServerResponse } from "decky-frontend-lib";


export class PyInterop {
    private static serverAPI:ServerAPI;

    static setServer(serv:ServerAPI) {
        this.serverAPI = serv;
    }

    static get server() { return this.serverAPI; }

    static async getData(): Promise<ServerResponse<Object>> {
        return await this.serverAPI.callPluginMethod<{}, Object>("getData", {});
    }
    static async setData(data:Object): Promise<ServerResponse<boolean>> {
        return await this.serverAPI.callPluginMethod<{data:Object}, Object>("setData", { data: data });
    }
    static async modData(entry:Object): Promise<ServerResponse<boolean>> {
        return await this.serverAPI.callPluginMethod<{entry:Object}, Object>("modData", { entry: entry });
    }

    static toast(title: string, message: string) {
        return (() => {
            try {
                return this.serverAPI.toaster.toast({
                    title: title,
                    body: message,
                    duration: 8000,
                });
            } catch (e) {
                console.log("Toaster Error", e);
            }
        })();
    }
}