import subprocess
import logging
import json
import os
from genericpath import exists

logging.basicConfig(filename="/tmp/tormak-decky-template.log", format='[Tormak Decky Template] %(asctime)s %(levelname)s %(message)s', filemode='w+', force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

def log(txt):
    logger.info(txt)

Initialized = False

class DataStructure:
    def __init__(self, dict):
        self.id = dict['id']
        self.position = dict['position']
        self.isApp = dict['isApp'] if 'isApp' in dict else True
    
    def toJSON(self):
        return json.dumps({
            "id": self.id,
            "position": self.position,
            "isApp": self.isApp
        }, sort_keys=True, indent=4)

class Plugin:
    data = {}
    dataPath = "/home/deck/.config/tormak-decky-template/data.json"

    def serializeData(self):
        res = {}

        for k,v in self.shortcuts.items():
            res[k] = {
                "id": v.id,
                "position": v.position,
                "isApp": v.isApp
            }

        return res

    # Normal methods: can be called from JavaScript using call_plugin_function("signature", argument)
    async def getData(self):
        self._load(self)
        return self.serializeData(self)

    async def setData(self, data):
        self._setData(self, self.shortcutsPath, data)
        return self.serializeShortcuts(self)

    async def modData(self, data):
        self._modData(self, self.shortcutsPath, data)
        return self.serializeShortcuts(self)

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        global Initialized
        if Initialized:
            return
        
        Initialized = True

        log("Initializing Template Plugin")

        if not os.path.exists(self.dataPath):
            if not os.path.exists(os.path.dirname(self.dataPath)):
                os.mkdir(os.path.dirname(self.dataPath))
            
            data = {
                
            }

            with open(self.dataPath, "w") as file:
                json.dump(data, file, indent=4)

        pass

    def _load(self):
        log("Analyzing JSON")
            
        if (exists(self.dataPath)):
            try:
                with open(self.dataPath, "r") as file:
                    dataDict = json.load(file)

                    for k,v in dataDict.items():
                        log(f"Adding entry {v['name']}")
                        self.data[v['id']] = DataStructure(v)
                        log(f"Added entry {v['name']}")

            except Exception as e:
                log(f"Exception while parsing data: {e}") # error reading json
        else:
            exception = Exception("Unabled to locate data.json: file does not exist")
            raise exception

        pass

    def _setData(self, path, data):
        for entry in data:
            if (entry['id'] in self.data):
                self.data[data['id']] = DataStructure(data)
            else:
                log(f"Shortcut {data['name']} does not exist")
            
        res = self.serializeData(self)
        jDat = json.dumps(res, indent=4)

        with open(path, "w") as outfile:
            outfile.write(jDat)

        pass

    def _modData(self, path, data):
        if (data['id'] in self.data):
            self.data[data['id']] = DataStructure(data)
            res = self.serializeData(self)
            jDat = json.dumps(res, indent=4)

            with open(path, "w") as outfile:
                outfile.write(jDat)
        else:
            log(f"Shortcut {data['name']} does not exist")

        pass
