import { afterPatch, Router, ServerAPI } from "decky-frontend-lib";
import { ReactElement } from "react";


export class Manager {
    static appId:number;

    private static server:ServerAPI;
    private static routePath = "/library/app/:appid";
    private static routerPatch:any;

    private static redirectable = true;

    static setServer(server:ServerAPI) {
        this.server = server;
    }

    static async init() {
        if (this.appId) {
            this.routerPatch = this.server.routerHook.addPatch(this.routePath, (routeProps: { path: string; children: ReactElement }) => {
                afterPatch(routeProps.children.props, "renderFunc", (_args: any[], ret:ReactElement) => {
                    const { appid } = ret.props.children.props.overview;

                    if (appid === this.appId && this.redirectable) {
                        console.log("rerouting");
                        this.redirectable = false;
                        setTimeout(() => {
                            this.redirectable = true;
                        }, 500);
                        return null;
                    }

                    return ret;
                });

                return routeProps;
            });
        }
    }

    static onDismount() {
        this.server.routerHook.removePatch(this.routePath, this.routerPatch);
    }
}