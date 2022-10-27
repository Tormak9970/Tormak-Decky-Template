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
import { VFC, Fragment } from "react";
import { IoApps } from "react-icons/io5";
import { About } from "./components/manager/About";

import { PyInterop } from "./PyInterop";
import { ShortcutsContextProvider, ShortcutsState, useShortcutsState } from "./state/PluginState";
import { Manager } from "./lib/Manager";

const Content: VFC<{ serverAPI: ServerAPI }> = ({}) => {
  const {shortcuts, setShortcuts, shortcutsList, isRunning} = useShortcutsState();

  async function reload() {
    await PyInterop.getShortcuts().then((res) => {
      setShortcuts(res.result as ShortcutsDictionary);
    });
  }
  
  if (Object.values(shortcuts as ShortcutsDictionary).length === 0) {
    reload();
  }

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

const ShortcutsManagerRouter: VFC = () => {
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

  const state = new ShortcutsState();
  Manager.setServer(serverApi);
  Manager.init();

  serverApi.routerHook.addRoute("/plugin-nav", () => (
    <ShortcutsContextProvider shortcutsStateClass={state}>
      <ShortcutsManagerRouter />
    </ShortcutsContextProvider>
  ));

  return {
    title: <div className={staticClasses.Title}>Plugin Template</div>,
    content: (
      <ShortcutsContextProvider shortcutsStateClass={state}>
        <Content serverAPI={serverApi} />
      </ShortcutsContextProvider>
    ),
    icon: <IoApps />,
    onDismount() {
      serverApi.routerHook.removeRoute("/plugin-nav");
      Manager.onDismount();
    },
    alwaysRender: true
  };
});
