import { storageReducer } from '../src/actions/storage'

describe('storageReducer', () => {
    it('Gets item to state', () => {
        const state = storageReducer({}, { type: 'STORAGE_GET', key: 'foo', item: 'bar'})
        expect(state.foo).toBe('bar')
    })

    it('Sets item to state', () => {
        const state = storageReducer({}, { type: 'STORAGE_SET', key: 'foo', item: 'bar'})
        expect(state.foo).toBe('bar')
    })

    it('Removes item to state', () => {
        const state = storageReducer({foo: 'bar'}, { type: 'STORAGE_REMOVE', key: 'foo'})
        expect(state.foo).toBe(null)
    })
    
    it('Merges item to state', () => {
        const state = storageReducer({foo: {a:'a'}}, { type: 'STORAGE_MERGE', key: 'foo', item: {b:'b'}})
        expect([state.foo.a, state.foo.b]).toEqual(['a', 'b'])
    })

    it('Returns same state if unknown action.type', () => {
        const state = {foo:'bar'}
        const nextState = storageReducer(state, {type: 'NOT_A_STORAGE_ACTION', key: 'foo', item: 'baz'})
        expect(state).toBe(nextState)
    })
})