import {
  ButtonItem,
  definePlugin,
  gamepadDialogClasses,
  PanelSection,
  PanelSectionRow,
  quickAccessControlsClasses,
  Router,
  ServerAPI,
  SidebarNavigation,
  staticClasses,
} from "decky-frontend-lib";
import { VFC, Fragment, useEffect } from "react";
import { IoApps } from "react-icons/io5";
import { About } from "./components/manager/About";

import { PyInterop } from "./PyInterop";
import { PluginContextProvider, PluginState, usePluginState } from "./state/PluginState";
import { Manager } from "./lib/Manager";

const Content: VFC<{ serverAPI: ServerAPI }> = ({}) => {
  const {data, setData} = usePluginState();

  async function reload() {
    await PyInterop.getData().then((res) => {
      setData(res.result);
    });
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <>
      <style>{`
        .scope {
          width: inherit;
          height: inherit;

          flex: 1 1 1px;
          scroll-padding: 48px 0px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-content: stretch;
        }
        .scope .${quickAccessControlsClasses.PanelSection} {
          padding: 0px;
        }

        .scope .${gamepadDialogClasses.FieldChildren} {
          margin: 0px 16px;
        }
        
        .scope .${gamepadDialogClasses.FieldLabel} {
          margin-left: 16px;
        }
      `}</style>
      <div className="scope">
        <PanelSection>
          <PanelSectionRow>
            <ButtonItem layout="below" onClick={() => { Router.CloseSideMenus(); Router.Navigate("/plugin-nav"); }} >
              Manage Plugin
            </ButtonItem>
          </PanelSectionRow>
        </PanelSection>
      </div>
    </>
  );
};

const PluginManagerRouter: VFC = () => {
  return (
    <SidebarNavigation
      title="Plugin Manager"
      showTitle
      pages={[
        {
          title: "About Plugin",
          content: <About />,
          route: "/plugin-nav/about",
        },
      ]}
    />
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  PyInterop.setServer(serverApi);

  const state = new PluginState();
  Manager.setServer(serverApi);
  Manager.init();

  serverApi.routerHook.addRoute("/plugin-nav", () => (
    <PluginContextProvider pluginStateClass={state}>
      <PluginManagerRouter />
    </PluginContextProvider>
  ));

  return {
    title: <div className={staticClasses.Title}>Plugin Template</div>,
    content: (
      <PluginContextProvider pluginStateClass={state}>
        <Content serverAPI={serverApi} />
      </PluginContextProvider>
    ),
    icon: <IoApps />,
    onDismount() {
      serverApi.routerHook.removeRoute("/plugin-nav");
      Manager.onDismount();
    },
    alwaysRender: true
  };
});
