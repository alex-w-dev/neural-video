import { IObjectDidChange, observe, toJS } from "mobx";

export function localstorageClassSaver<T extends Object>(
  target: T,
  localStorageKey: string,
  savePropertiesToLocalStorage: Array<keyof T>
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const savedString = localStorage.getItem(localStorageKey);
    if (savedString) {
      const toLoad = JSON.parse(savedString);
      savePropertiesToLocalStorage.forEach((propertyName) => {
        if (toLoad[propertyName] !== undefined) {
          target[propertyName] = toLoad[propertyName];
        }
      });
    }
  } catch (e) {
    console.log("e localstorageClassSaver", e);
  }

  observe(target, (change: IObjectDidChange) => {
    console.log("change.name", change.name);
    if (!savePropertiesToLocalStorage.includes(change.name as keyof T)) {
      return;
    }

    const toSave = savePropertiesToLocalStorage.reduce((acc, propertyName) => {
      return Object.assign(acc, {
        [propertyName]: toJS(target[propertyName]),
      });
    }, {});

    localStorage.setItem(localStorageKey, JSON.stringify(toSave));
  });
}
