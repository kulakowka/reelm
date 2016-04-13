import { effectType } from '../effects'

import { mapIf } from '../utils/effects-utils'
import { compose, overState, overEffects } from '../utils/reducer-utils'
import { getIn, updateIn } from '../utils/state-utils'

function transformSelect(selector) {
    return function(selectEffect) {
        return { ...selectEffect, selector: (...args) => selector(selectEffect.selector(...args)) }
    }
}

function isSelect(effect) {
    return effect.type === effectType.SELECT;
}

function createSelector(stateSubSetDefinition, getInitialState) {
    if (Array.isArray(stateSubSetDefinition)) {
        return function (state) {
            return getIn(state, stateSubSetDefinition)
        }
    }
    else if (typeof stateSubSetDefinition === 'object') {
        return function (state) {
            return Object
                .getOwnPropertyNames(stateSubSetDefinition)
                .map(prop => [prop, getIn(state, stateSubSetDefinition[prop])])
                .filter(x => x[1] !== undefined)
                .reduce((x, y) => updateIn(x, [y[0]], () => y[1]), getInitialState())
        }
    }
    throw "Wrong stateSubSetDefinition";
}

function createUpdater(stateSubSetDefinition) {
    if (Array.isArray(stateSubSetDefinition)) {
        return state => stateToApply => updateIn(state, stateSubSetDefinition, () => stateToApply);
    }
    else {
        return function(state) {
            return function(stateToApply)  {
                return Object
                    .getOwnPropertyNames(stateSubSetDefinition)
                    .reduce((result, prop) => updateIn(result, stateSubSetDefinition[prop], () => getIn(stateToApply, prop)), state);
            }
        }    
    }
}

export default function over(stateSubSetDefinition, initialState) {
    var subSetUpdater = createUpdater(stateSubSetDefinition);

    return function(reducer) {
        var selectSubSet = createSelector(stateSubSetDefinition, initialState ? (() => initialState) : reducer);
        return function(state, action) {
            return compose(
                overState(subSetUpdater(state)), 
                overEffects(effects => effects::mapIf(isSelect, transformSelect(selectSubSet))),
                x => reducer(x, action),
                selectSubSet
                )(state);
        }
    }
}
