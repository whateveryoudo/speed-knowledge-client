/**
 * 通用树节点接口（支持泛型）
 */
export interface TreeNode<T = any> {
  id: string | number;
  parent_id: string | number | null | undefined;
  children?: TreeNode<T>[];
  [key: string]: any;
}

/**
 * 将一维数组转换为树结构（支持基于链式指针的排序）
 * @param list 一维数组
 * @param options 配置选项
 * @returns 树结构数组
 */
export function arrayToTree<T extends TreeNode>(
  list: T[],
  outOptions: {
    idKey?: string; // id字段名，默认 'id'
    parentKey?: string; // parent_id字段名，默认 'parent_id'
    childrenKey?: string; // children字段名，默认 'children'
    rootValue?: string | number | null; // 根节点的parent_id值，默认 null 或 ''
    // 链式排序相关字段
    firstChildKey?: string; // first_child_id字段名，默认 'first_child_id'
    prevKey?: string; // prev_id字段名，默认 'prev_id'
    nextKey?: string; // next_id字段名，默认 'next_id'
    useChainOrder?: boolean; // 是否使用链式指针排序，默认 false
  } = {}
): T[] {
  const defaultOptions = {
    idKey: "id",
    parentKey: "parent_id",
    childrenKey: "children",
    rootValue: null,
    firstChildKey: "first_child_id",
    prevKey: "prev_id",
    nextKey: "next_id",
    useChainOrder: false,
  };
  const options = { ...defaultOptions, ...outOptions };
  const {
    idKey,
    parentKey,
    childrenKey,
    rootValue,
    firstChildKey,
    prevKey,
    nextKey,
    useChainOrder,
  } = options;

  // 创建 id 到节点的映射
  const nodeMap = new Map<string | number, T>();
  const result: T[] = [];

  // 第一遍遍历：创建所有节点的映射
  list.forEach((item) => {
    const id = item[idKey];
    const parentId = item[parentKey];

    // 创建节点副本，初始化children数组
    const node = { ...item, [childrenKey]: [] } as T;

    // 判断是否为根节点
    const isRoot =
      parentId === rootValue ||
      parentId === null ||
      parentId === undefined ||
      parentId === "";

    if (isRoot) {
      result.push(node);
    }

    nodeMap.set(id, node);
  });

  // 第二遍遍历：建立父子关系
  list.forEach((item) => {
    const id = item[idKey];
    const parentId = item[parentKey];

    const node = nodeMap.get(id);
    const parent = parentId ? nodeMap.get(parentId) : null;

    if (parent && node && parent !== node) {
      if (!parent[childrenKey]) {
        parent[childrenKey] = [] as any;
      }
      parent[childrenKey]!.push(node);
    }
  });

  // 如果启用链式排序，则对每个节点的children进行排序
  if (useChainOrder) {
    /**
     * 根据链式指针构建有序数组
     * @param firstId 第一个节点的id
     * @param nodeMap 节点映射表
     * @param nextKey next_id字段名
     * @returns 有序的节点数组
     */
    function buildOrderedList(
      firstId: string | number | null | undefined,
      nodeMap: Map<string | number, T>,
      nextKey: string
    ): T[] {
      if (!firstId) return [];

      const orderedList: T[] = [];
      const visited = new Set<string | number>();
      let currentId: string | number | null | undefined = firstId;

      // 通过next_id链式查找
      while (currentId && !visited.has(currentId)) {
        const node = nodeMap.get(currentId);
        if (!node) break;

        visited.add(currentId);
        orderedList.push(node);
        currentId = node[nextKey] as string | number | null | undefined;
      }

      return orderedList;
    }

    /**
     * 对树进行链式排序
     * @param nodes 节点数组
     */
    function sortTreeByChain(nodes: T[]) {
      nodes.forEach((node) => {
        const children = node[childrenKey] as T[] | undefined;

        if (children && children.length > 0) {
          // 找到第一个子节点
          const firstChildId = node[firstChildKey] as
            | string
            | number
            | null
            | undefined;

          if (firstChildId) {
            // 根据链式指针重新排序children
            const orderedChildren = buildOrderedList(
              firstChildId,
              nodeMap,
              nextKey
            );

            // 如果链式排序的结果数量与children数量一致，则使用排序后的结果
            // 否则可能数据不完整，保持原顺序
            if (orderedChildren.length === children.length) {
              node[childrenKey] = orderedChildren as any;
            }

            // 递归处理子节点
            sortTreeByChain(
              orderedChildren.length === children.length
                ? orderedChildren
                : children
            );
          } else {
            // 如果没有first_child_id，递归处理现有children
            sortTreeByChain(children);
          }
        }
      });
    }

    // 对根节点进行排序
    // 找到第一个根节点（prev_id为空或null的）
    const rootNodesWithoutPrev = result.filter(
      (node) => !node[prevKey] || node[prevKey] === null || node[prevKey] === ""
    );

    if (rootNodesWithoutPrev.length > 0) {
      // 链头 = prev 为空且不被其他根节点的 next_id 指向
      const referencedNextIds = new Set(
        result
          .map((node) => node[nextKey] as string | number | null | undefined)
          .filter((id) => id != null && id !== ""),
      );
      const firstRootNode =
        rootNodesWithoutPrev.find((node) => !referencedNextIds.has(node[idKey])) ??
        rootNodesWithoutPrev[0]!;
      const firstRootId = firstRootNode[idKey];

      // 构建有序的根节点列表
      const orderedRoots = buildOrderedList(firstRootId, nodeMap, nextKey);

      // 如果有序根节点数量与result一致，则替换
      if (orderedRoots.length === result.length) {
        result.length = 0;
        result.push(...orderedRoots);
      }
    }

    // 对所有节点进行链式排序
    sortTreeByChain(result);
  }

  return result;
}

/**
 * 将树结构扁平化为一维数组（支持重建链式指针）
 * @param tree 树结构数组
 * @param options 配置选项
 * @returns 一维数组
 */
export function treeToArray<T extends TreeNode>(
  tree: T[],
  outOptions: {
    childrenKey?: string; // children字段名，默认 'children'
    keepChildren?: boolean; // 是否保留children字段，默认 false
    // 链式指针重建相关字段
    idKey?: string; // id字段名，默认 'id'
    parentKey?: string; // parent_id字段名，默认 'parent_id'
    firstChildKey?: string; // first_child_id字段名，默认 'first_child_id'
    prevKey?: string; // prev_id字段名，默认 'prev_id'
    nextKey?: string; // next_id字段名，默认 'next_id'
    rebuildChain?: boolean; // 是否重建链式指针，默认 false
  } = {}
): T[] {
  const defaultOptions = {
    childrenKey: "children",
    keepChildren: false,
    idKey: "id",
    parentKey: "parent_id",
    firstChildKey: "first_child_id",
    prevKey: "prev_id",
    nextKey: "next_id",
    rebuildChain: false,
  };
  const {
    childrenKey,
    keepChildren,
    idKey,
    parentKey,
    firstChildKey,
    prevKey,
    nextKey,
    rebuildChain,
  } = { ...defaultOptions, ...outOptions };

  const result: T[] = [];
  const nodeMap = new Map<string | number, T>();

  // 第一遍遍历：收集所有节点并设置基本属性
  function traverse(nodes: T[], parent: T | null = null) {
    nodes.forEach((node, index) => {
      const children = node[childrenKey] as T[] | undefined;
      const newNode = { ...node };

      // 如果启用链式指针重建
      if (rebuildChain) {
        // 设置 parent_id
        if (parent) {
          newNode[parentKey] = parent[idKey] as any;
        } else {
          newNode[parentKey] = (null as any) || "";
        }

        // 初始化链式指针字段
        newNode[firstChildKey] = (null as any) || "";
        newNode[prevKey] = (null as any) || "";
        newNode[nextKey] = (null as any) || "";

        // 设置 first_child_id（父节点的第一个子节点）
        if (parent && index === 0) {
          const parentNode = nodeMap.get(parent[idKey]);
          if (parentNode) {
            parentNode[firstChildKey] = node[idKey] as any;
          }
        }

        // 设置 prev_id 和 next_id（兄弟节点之间的链接）
        if (index > 0) {
          // 前一个兄弟节点
          const prevSibling = nodes[index - 1];
          newNode[prevKey] = prevSibling[idKey] as any;
          // 更新前一个兄弟节点的 next_id
          const prevSiblingNode = nodeMap.get(prevSibling[idKey]);
          if (prevSiblingNode) {
            prevSiblingNode[nextKey] = node[idKey] as any;
          }
        }

        // 最后一个节点的 next_id 保持为空（已在初始化时设置）
      }

      if (!keepChildren && children) {
        delete newNode[childrenKey];
      }

      // 存储节点映射（用于后续更新）
      nodeMap.set(newNode[idKey], newNode);
      result.push(newNode);

      if (children && children.length > 0) {
        traverse(children, newNode);
      }
    });
  }

  traverse(tree);

  return result;
}

/**
 * 查找树中的节点
 * @param tree 树结构数组
 * @param id 要查找的节点id
 * @param options 配置选项
 * @returns 找到的节点，未找到返回null
 */
export function findNodeInTree<T extends TreeNode>(
  tree: T[],
  id: string | number,
  options: {
    idKey?: string;
    childrenKey?: string;
  } = {}
): T | null {
  const { idKey = "id", childrenKey = "children" } = options;

  function traverse(nodes: T[]): T | null {
    for (const node of nodes) {
      if (node[idKey] === id) {
        return node;
      }
      const children = node[childrenKey] as T[] | undefined;
      if (children && children.length > 0) {
        const found = traverse(children);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  return traverse(tree);
}

/**
 * 获取节点的所有父节点路径
 * @param tree 树结构数组
 * @param id 节点id
 * @param options 配置选项
 * @returns 父节点路径数组（从根到目标节点,onlyKey为true时只返回id）
 */
export function getNodePath<T extends TreeNode>(
  tree: T[],
  id: string | number,
  outOptions: {
    idKey?: string;
    childrenKey?: string;
    onlyKey?: boolean
    excludeSelf?: boolean
  } = {}
): (T | string | number)[] {
  const defaultOptions = {
    idKey: "id",
    childrenKey: "children",
    onlyKey: false,
    excludeSelf: false,
  };
  const { idKey = "id", childrenKey = "children", onlyKey = false, excludeSelf = false } = { ...defaultOptions, ...outOptions };

  const path: T[] = [];

  function traverse(nodes: T[], targetId: string | number): boolean {
    console.log(targetId)
    for (const node of nodes) {
      if (onlyKey) {
        path.push(node[idKey]);
      } else {
        path.push(node);
      }

      if (node[idKey] === targetId) {
        if (excludeSelf && path.length > 0) {
          path.pop();
        }
        return true;
      }

      const children = node[childrenKey] as T[] | undefined;
      if (children && children.length > 0) {
        if (traverse(children, targetId)) {
          return true;
        }
      }

      path.pop();
    }
    return false;
  }

  traverse(tree, id);
  return path;
}

/**
 * 遍历树结构（深度优先）
 * @param tree 树结构数组
 * @param callback 回调函数
 * @param options 配置选项
 */
export function traverseTree<T extends TreeNode>(
  tree: T[],
  callback: (node: T, parent: T | null, level: number) => void | boolean,
  options: {
    childrenKey?: string;
    order?: "pre" | "post"; // 前序遍历或后序遍历，默认 'pre'
  } = {}
): void {
  const { childrenKey = "children", order = "pre" } = options;

  function dfs(nodes: T[], parent: T | null, level: number) {
    for (const node of nodes) {
      if (order === "pre") {
        const result = callback(node, parent, level);
        if (result === false) {
          return; // 停止遍历
        }
      }

      const children = node[childrenKey] as T[] | undefined;
      if (children && children.length > 0) {
        dfs(children, node, level + 1);
      }

      if (order === "post") {
        callback(node, parent, level);
      }
    }
  }

  dfs(tree, null, 0);
}

/**
 * 过滤树结构（保留符合条件的节点及其父节点）
 * @param tree 树结构数组
 * @param predicate 过滤条件函数
 * @param options 配置选项
 * @returns 过滤后的树结构
 */
export function filterTree<T extends TreeNode>(
  tree: T[],
  predicate: (node: T) => boolean,
  options: {
    childrenKey?: string;
  } = {}
): T[] {
  const { childrenKey = "children" } = options;

  function filter(nodes: T[]): T[] {
    return nodes
      .map((node) => {
        const children = node[childrenKey] as T[] | undefined;
        const filteredChildren = children ? filter(children) : [];

        const nodeMatches = predicate(node);
        const hasMatchingChildren = filteredChildren.length > 0;

        if (nodeMatches || hasMatchingChildren) {
          const newNode = { ...node };
          if (hasMatchingChildren) {
            newNode[childrenKey] = filteredChildren as any;
          } else {
            delete newNode[childrenKey];
          }
          return newNode;
        }

        return null;
      })
      .filter((node): node is T => node !== null);
  }

  return filter(tree);
}
