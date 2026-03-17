// 🌐 七十二变·语言通 - YAML 工具函数

import yaml from "js-yaml";

/**
 * 扁平化 YAML 对象
 * 将嵌套对象转为 { 'a.b.c': value } 格式
 */
export function flattenYaml(
  obj: Record<string, any>,
  prefix = "",
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        // 递归处理嵌套对象
        Object.assign(result, flattenYaml(value, newKey));
      } else {
        // 基本类型直接存储
        result[newKey] = String(value);
      }
    }
  }

  return result;
}

/**
 * 反扁平化 YAML 对象
 * 将 { 'a.b.c': value } 转回嵌套对象
 */
export function unflattenYaml(
  flatObj: Record<string, string>,
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const flatKey in flatObj) {
    if (Object.prototype.hasOwnProperty.call(flatObj, flatKey)) {
      const keys = flatKey.split(".");
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current)) {
          current[key] = {};
        }
        current = current[key];
      }

      current[keys[keys.length - 1]] = flatObj[flatKey];
    }
  }

  return result;
}

/**
 * 提取所有 key（包括嵌套的）
 */
export function extractKeys(obj: Record<string, any>, prefix = ""): string[] {
  const keys: string[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        keys.push(...extractKeys(value, newKey));
      } else {
        keys.push(newKey);
      }
    }
  }

  return keys;
}

/**
 * 比较两个 YAML 对象的 key 差异
 */
export function compareYamlKeys(
  base: Record<string, any>,
  target: Record<string, any>,
): {
  missing: string[]; // target 缺少的 key
  extra: string[]; // target 多余的 key
  same: string[]; // 共有的 key
} {
  const baseKeys = new Set(extractKeys(base));
  const targetKeys = new Set(extractKeys(target));

  const missing: string[] = [];
  const extra: string[] = [];
  const same: string[] = [];

  // 找出 missing（base 有但 target 没有）
  for (const key of baseKeys) {
    if (targetKeys.has(key)) {
      same.push(key);
    } else {
      missing.push(key);
    }
  }

  // 找出 extra（target 有但 base 没有）
  for (const key of targetKeys) {
    if (!baseKeys.has(key)) {
      extra.push(key);
    }
  }

  return { missing, extra, same };
}

/**
 * 解析 YAML 文件
 */
export function parseYaml(content: string): Record<string, any> {
  return (yaml.load(content) as Record<string, any>) || {};
}

/**
 * 序列化为 YAML 字符串
 */
export function stringifyYaml(obj: Record<string, any>): string {
  return yaml.dump(obj, {
    indent: 2,
    lineWidth: -1, // 不自动换行
    noRefs: true, // 不显示引用标记
    sortKeys: false, // 保持原有 key 顺序
  });
}

/**
 * 根据 key 路径获取值
 */
export function getValueByPath(obj: Record<string, any>, path: string): any {
  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined || !(key in current)) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

/**
 * 根据 key 路径设置值
 */
export function setValueByPath(
  obj: Record<string, any>,
  path: string,
  value: string,
): void {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}
