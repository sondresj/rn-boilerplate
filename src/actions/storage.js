import { AsyncStorage } from 'react-native'

const actions = {
    STORAGE_GET: 'STORAGE_GET',
    STORAGE_SET: 'STORAGE_SET',
    STORAGE_REMOVE: 'STORAGE_REMOVE',
    STORAGE_MERGE: 'STORAGE_MERGE',
}

const keys = {
    // If you want to make wrappers around specific items you want to store, define them here, and use them in the actions
}

export const StorageActions = class StorageActions {
    constructor(run){
        this._run = run
    }

    async get(key){
        let item = await AsyncStorage.getItem(key)
        item = JSON.parse(item)
        this._run(actions.STORAGE_GET, {key, item})
    }

    async set(key, item){
        await AsyncStorage.setItem(key, JSON.stringify(item))
        this._run(actions.STORAGE_SET, {key, item})
    }

    async remove(key){
        await AsyncStorage.removeItem(key)
        this._run(actions.STORAGE_REMOVE, {key})
    }

    async merge(key, item){
        await AsyncStorage.mergeItem(key, JSON.stringify(item))
        this._run(actions.STORAGE_MERGE, {key, item})
    }

    // Add helper methods wrapping specific keys for items you may want to store
}

const initialState = {
    // Keys? 
}

export const storageReducer = (state = initialState, action) => {
    switch(action.type){
        case actions.STORAGE_GET: 
        case actions.STORAGE_SET: 
            return { ...state, [action.key]: action.item === null 
                ? initialState[action.key] || null 
                : action.item}
        case actions.STORAGE_REMOVE: 
            return { ...state, [action.key]: initialState[action.key] || null}
        case actions.STORAGE_MERGE: 
            return { ...state, [action.key]: { ...state[action.key], ...action.item } }
    }
    return state
}