import { createContext, FC, useContext, useEffect, useState } from "react";


interface PublicPluginState {
    data:Object
}

interface PublicPluginContext extends PublicPluginState {
    setData(data: Object): void;
}

export class PluginState {
    private data: Object = {};

    public eventBus = new EventTarget();

    getPublicState() {
        return {
            "data": this.data
        }
    }

    setData(data: Object) {
        this.data = data;
        this.forceUpdate();
    }

    private forceUpdate() {
        this.eventBus.dispatchEvent(new Event("stateUpdate"));
    }
}

const PluginContext = createContext<PublicPluginContext>(null as any);
export const usePluginState = () => useContext(PluginContext);

interface ProviderProps {
    pluginStateClass: PluginState
}

export const PluginContextProvider: FC<ProviderProps> = ({
    children,
    pluginStateClass
}) => {
    const [publicState, setPublicState] = useState<PublicPluginState>({
        ...pluginStateClass.getPublicState()
    });

    useEffect(() => {
        function onUpdate() {
            setPublicState({ ...pluginStateClass.getPublicState() });
        }

        pluginStateClass.eventBus
            .addEventListener("stateUpdate", onUpdate);

        return () => {
            pluginStateClass.eventBus
                .removeEventListener("stateUpdate", onUpdate);
        }
    }, []);

    const setData = (data: Object) => {
        pluginStateClass.setData(data);
    }

    return (
        <PluginContext.Provider
            value={{
                ...publicState,
                setData
            }}
        >
            {children}
        </PluginContext.Provider>
    )
}