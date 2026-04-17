// DSA algorithms are implemented in C++ in dsa.cpp for reference.
// This JavaScript module provides the same functions to keep the React app working.

const PRIORITY_WEIGHT = { critical: 4, high: 3, medium: 2, low: 1 };

function getValue(item, key) {
  if (key === "priority") return PRIORITY_WEIGHT[item[key]];
  if (key === "createdAt" || key === "updatedAt") return new Date(item[key]).getTime();
  return item[key];
}

export function bubbleSort(arr, key = "createdAt", order = "desc") {
  const result = [...arr];
  const n = result.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const val1 = getValue(result[j], key);
      const val2 = getValue(result[j + 1], key);
      const shouldSwap = order === "asc" ? val1 > val2 : val1 < val2;
      if (shouldSwap) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
      }
    }
  }
  return result;
}

export function insertionSort(arr, key = "createdAt", order = "desc") {
  const result = [...arr];
  for (let i = 1; i < result.length; i++) {
    const current = result[i];
    const currentVal = getValue(current, key);
    let j = i - 1;
    while (j >= 0) {
      const prevVal = getValue(result[j], key);
      const shouldMove = order === "asc" ? prevVal > currentVal : prevVal < currentVal;
      if (shouldMove) {
        result[j + 1] = result[j];
        j--;
      } else {
        break;
      }
    }
    result[j + 1] = current;
  }
  return result;
}

export function linearSearch(arr, query, fields = ["title", "description"]) {
  if (!query) return arr;
  const q = query.toLowerCase();
  return arr.filter((item) =>
    fields.some((f) => item[f] && item[f].toString().toLowerCase().includes(q))
  );
}

function parseComplaintId(value) {
  const num = parseInt(String(value).trim(), 10);
  return Number.isNaN(num) ? null : num;
}

function compareComplaintIds(a, b) {
  const aStr = String(a).trim();
  const bStr = String(b).trim();
  const aNum = parseComplaintId(aStr);
  const bNum = parseComplaintId(bStr);

  if (aNum !== null && bNum !== null) {
    return aNum - bNum;
  }
  return aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: "base" });
}

export function binarySearchById(sortedArr, targetId) {
  const target = String(targetId).trim();
  let lo = 0, hi = sortedArr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const current = String(sortedArr[mid].complaintId).trim();
    const cmp = compareComplaintIds(current, target);

    if (cmp === 0) return { found: sortedArr[mid], index: mid };
    if (cmp < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  return { found: null, index: -1 };
}

export { compareComplaintIds };

export function countByField(arr, key) {
  return arr.reduce((counts, item) => {
    const val = item[key];
    counts[val] = (counts[val] || 0) + 1;
    return counts;
  }, {});
}
