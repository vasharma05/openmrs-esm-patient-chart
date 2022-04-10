import { ReducerAction, ReducerState, ReducerActionType } from './filter-types';

export const getName = (prefix, name) => {
  return prefix ? `${prefix}-${name}` : name;
};

const computeParents = (prefix, node) => {
  var parents = {};
  var leaves = [];
  var tests = [];
  var lowestParents = [];
  if (node?.subSets?.length && node.subSets[0].obs) {
    // lowest parent
    let activeLeaves = [];
    node.subSets.forEach((leaf) => {
      if (leaf.hasData) {
        activeLeaves.push(leaf.flatName);
      }
    });
    let activeTests = [];
    node.subSets.forEach((leaf) => {
      if (leaf.obs.length) {
        activeTests.push([leaf.flatName, leaf]);
      }
    });
    leaves.push(...activeLeaves);
    tests.push(...activeTests);
    lowestParents.push({ flatName: node.flatName, display: node.display });
  } else if (node?.subSets?.length) {
    node.subSets.map((subNode) => {
      const {
        parents: newParents,
        leaves: newLeaves,
        tests: newTests,
        lowestParents: newLowestParents,
      } = computeParents(getName(prefix, node.display), subNode);
      parents = { ...parents, ...newParents };
      leaves.push(...newLeaves);
      tests.push(...newTests);
      lowestParents.push(...newLowestParents);
    });
  }
  parents[node.flatName] = leaves;
  return { parents, leaves, tests, lowestParents };
};

function reducer(state: ReducerState, action: ReducerAction): ReducerState {
  switch (action.type) {
    case ReducerActionType.INITIALIZE:
      let parents = {},
        leaves = [],
        tests = [],
        lowestParents = [];
      action.trees?.forEach((tree) => {
        // if anyone knows a shorthand for this i'm stoked to learn it :)
        const {
          parents: newParents,
          leaves: newLeaves,
          tests: newTests,
          lowestParents: newLP,
        } = computeParents('', tree);
        parents = { ...parents, ...newParents };
        leaves = [...leaves, ...newLeaves];
        tests = [...tests, ...newTests];
        lowestParents = [...lowestParents, ...newLP];
      });
      const flatTests = Object.fromEntries(tests);
      return {
        checkboxes: Object.fromEntries(leaves?.map((leaf) => [leaf, false])) || {},
        parents: parents,
        roots: action.trees,
        tests: flatTests,
        lowestParents: lowestParents,
        basePath: action.basePath,
      };
    case ReducerActionType.TOGGLEVAL:
      return {
        ...state,
        checkboxes: {
          ...state.checkboxes,
          [action.name]: !state.checkboxes[action.name],
        },
      };
    case ReducerActionType.UDPATEPARENT:
      const affectedLeaves = state.parents[action.name];
      let checkboxes = JSON.parse(JSON.stringify(state.checkboxes));
      const allChecked = affectedLeaves.every((leaf) => checkboxes[leaf]);
      affectedLeaves.forEach((leaf) => (checkboxes[leaf] = !allChecked));
      return {
        ...state,
        checkboxes: checkboxes,
      };
    case ReducerActionType.UPDATEBASEPATH:
      return {
        ...state,
        basePath: action.basePath,
      };
    default:
      return state;
  }
}

export default reducer;
