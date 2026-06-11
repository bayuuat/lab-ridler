import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const problemsPath = path.join(rootDir, "apps", "antislop", "data", "problems.json");
const targetCount = 500;
const seedCount = 30;

const raw = await readFile(problemsPath, "utf8");
const seedProblems = JSON.parse(raw).slice(0, seedCount);
const problems = [...seedProblems];
const usedSlugs = new Set(problems.map((problem) => problem.slug));

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function snake(value) {
  return slugify(value).replace(/-/g, "_");
}

function asJson(value) {
  return JSON.stringify(value);
}

function starterReturnFor(value) {
  if (Array.isArray(value)) return "[]";
  if (typeof value === "boolean") return "False";
  if (typeof value === "string") return "\"\"";
  if (value && typeof value === "object") return "{}";
  return "0";
}

function addProblem({
  title,
  topic,
  statement,
  params,
  sample,
  hidden,
  solve,
  difficulty = "easy",
}) {
  if (problems.length >= targetCount) return;

  let slug = slugify(title);
  if (!slug) throw new Error(`Bad title: ${title}`);
  if (usedSlugs.has(slug)) {
    slug = `${slug}-${slugify(topic)}`;
  }
  if (usedSlugs.has(slug)) {
    throw new Error(`Duplicate generated slug: ${slug}`);
  }

  const sampleAnswer = solve(...sample);
  const hiddenAnswer = solve(...hidden);
  const entryPoint = snake(slug);

  problems.push({
    id: slug,
    title,
    slug,
    difficulty,
    topic,
    entry_point: entryPoint,
    statement,
    starter_code: `def ${entryPoint}(${params.join(", ")}):\n    return ${starterReturnFor(sampleAnswer)}\n`,
    samples: [{ input: asJson(sample), output: asJson(sampleAnswer) }],
    hidden_tests: [{ input: asJson(hidden), output: asJson(hiddenAnswer) }],
  });
  usedSlugs.add(slug);
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function product(values) {
  return values.reduce((total, value) => total * value, 1);
}

function isPrime(value) {
  if (value < 2 || !Number.isInteger(value)) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

function gcd(first, second) {
  let a = Math.abs(first);
  let b = Math.abs(second);
  while (b) [a, b] = [b, a % b];
  return a;
}

function factorial(value) {
  let result = 1;
  for (let current = 2; current <= value; current += 1) result *= current;
  return result;
}

function fibonacci(value) {
  let a = 0;
  let b = 1;
  for (let index = 0; index < value; index += 1) [a, b] = [b, a + b];
  return a;
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a - b);
}

const numberArrays = [
  [4, -1, 0, 7, 12, 7, -3, 16, 25],
  [2, 3, 5, 8, 13, 21, 34, 55],
  [-8, -4, -1, 0, 1, 4, 9, 16],
  [10, 10, 5, 2, 5, 11, 14, 17],
  [6, 1, 6, 2, 6, 3, 12, 18],
  [1, 2, 2, 3, 5, 8, 8, 13],
  [9, 7, 5, 3, 1, 0, -2, -4],
  [15, 3, 30, 6, 45, 9, 60],
];

function sampleArray(index) {
  return numberArrays[index % numberArrays.length];
}

function hiddenArray(index) {
  return numberArrays[(index + 3) % numberArrays.length];
}

const arrayPredicates = [
  ["Even Values", "is even", (value) => value % 2 === 0],
  ["Odd Values", "is odd", (value) => Math.abs(value % 2) === 1],
  ["Positive Values", "is greater than zero", (value) => value > 0],
  ["Negative Values", "is less than zero", (value) => value < 0],
  ["Zero Values", "is exactly zero", (value) => value === 0],
  ["Nonzero Values", "is not zero", (value) => value !== 0],
  ["Multiples Of Three", "is divisible by three", (value) => value % 3 === 0],
  ["Multiples Of Five", "is divisible by five", (value) => value % 5 === 0],
  ["Two Digit Values", "has exactly two decimal digits", (value) => Math.abs(value) >= 10 && Math.abs(value) <= 99],
  ["Single Digit Values", "has one decimal digit", (value) => Math.abs(value) < 10],
  ["Prime Values", "is prime", (value) => isPrime(value)],
  ["Composite Values", "is composite", (value) => value > 1 && !isPrime(value)],
  ["Square Numbers", "is a perfect square", (value) => value >= 0 && Number.isInteger(Math.sqrt(value))],
  ["Power Of Two Values", "is a power of two", (value) => value > 0 && (value & (value - 1)) === 0],
  ["Values Above Ten", "is greater than ten", (value) => value > 10],
  ["Values At Least Seven", "is at least seven", (value) => value >= 7],
  ["Values Below Five", "is below five", (value) => value < 5],
  ["Absolute Values Above Ten", "has absolute value above ten", (value) => Math.abs(value) > 10],
  ["Values Ending In Seven", "ends with digit seven", (value) => Math.abs(value) % 10 === 7],
  ["Values Ending In Five", "ends with digit five", (value) => Math.abs(value) % 10 === 5],
  ["Index Matching Values", "equals its index", (value, index) => value === index],
  ["Values Greater Than Index", "is greater than its index", (value, index) => value > index],
  ["Values Below Index", "is less than its index", (value, index) => value < index],
  ["Repeated Values", "appears more than once", (value, index, array) => array.indexOf(value) !== array.lastIndexOf(value)],
  ["First Occurrences", "is the first occurrence of that value", (value, index, array) => array.indexOf(value) === index],
  ["Last Occurrences", "is the last occurrence of that value", (value, index, array) => array.lastIndexOf(value) === index],
  ["Local Peaks", "is larger than its direct neighbors", (value, index, array) => index > 0 && index < array.length - 1 && value > array[index - 1] && value > array[index + 1]],
  ["Local Valleys", "is smaller than its direct neighbors", (value, index, array) => index > 0 && index < array.length - 1 && value < array[index - 1] && value < array[index + 1]],
  ["Values Above Average", "is greater than the array average", (value, _index, array) => value > sum(array) / array.length],
  ["Values Below Average", "is less than the array average", (value, _index, array) => value < sum(array) / array.length],
  ["Increasing Positions", "is greater than the previous value", (value, index, array) => index > 0 && value > array[index - 1]],
  ["Dropping Positions", "is less than the previous value", (value, index, array) => index > 0 && value < array[index - 1]],
  ["Border Values", "is at the first or last index", (_value, index, array) => index === 0 || index === array.length - 1],
  ["Interior Values", "is not at the first or last index", (_value, index, array) => index > 0 && index < array.length - 1],
  ["Values With Even Index", "sits at an even index", (_value, index) => index % 2 === 0],
  ["Values With Odd Index", "sits at an odd index", (_value, index) => index % 2 === 1],
  ["Values Divisible By Four", "is divisible by four", (value) => value % 4 === 0],
  ["Values Divisible By Six", "is divisible by six", (value) => value % 6 === 0],
  ["Values Between One And Ten", "is between one and ten inclusive", (value) => value >= 1 && value <= 10],
  ["Values Outside One And Ten", "is outside the inclusive range one to ten", (value) => value < 1 || value > 10],
  ["Palindrome Numbers", "reads the same forward and backward", (value) => String(Math.abs(value)) === [...String(Math.abs(value))].reverse().join("")],
  ["Numbers With Digit One", "contains digit one", (value) => String(Math.abs(value)).includes("1")],
  ["Numbers With Digit Two", "contains digit two", (value) => String(Math.abs(value)).includes("2")],
  ["Values Smaller Than First", "is smaller than the first value", (value, _index, array) => value < array[0]],
  ["Values Larger Than First", "is larger than the first value", (value, _index, array) => value > array[0]],
  ["Values Smaller Than Last", "is smaller than the last value", (value, _index, array) => value < array[array.length - 1]],
  ["Values Larger Than Last", "is larger than the last value", (value, _index, array) => value > array[array.length - 1]],
  ["Sign Change Starts", "has a different sign from the previous value", (value, index, array) => index > 0 && Math.sign(value) !== Math.sign(array[index - 1])],
  ["Pair Sum Even Starts", "forms an even sum with the next value", (value, index, array) => index < array.length - 1 && (value + array[index + 1]) % 2 === 0],
  ["Pair Sum Odd Starts", "forms an odd sum with the next value", (value, index, array) => index < array.length - 1 && Math.abs((value + array[index + 1]) % 2) === 1],
  ["Values Equal To Minimum", "matches the minimum value", (value, _index, array) => value === Math.min(...array)],
  ["Values Equal To Maximum", "matches the maximum value", (value, _index, array) => value === Math.max(...array)],
  ["Values Near Zero", "has absolute value at most two", (value) => Math.abs(value) <= 2],
  ["Values Far From Zero", "has absolute value at least fifteen", (value) => Math.abs(value) >= 15],
  ["Values Sharing First Parity", "has the same parity as the first value", (value, _index, array) => Math.abs(value % 2) === Math.abs(array[0] % 2)],
  ["Values Sharing Last Parity", "has the same parity as the last value", (value, _index, array) => Math.abs(value % 2) === Math.abs(array[array.length - 1] % 2)],
];

const arrayPredicateActions = [
  ["Count", "Return how many numbers in nums match this rule: {condition}.", (array, predicate) => array.filter(predicate).length],
  ["Collect", "Return the numbers in nums that match this rule: {condition}. Preserve order.", (array, predicate) => array.filter(predicate)],
  ["Sum", "Return the sum of all numbers in nums that match this rule: {condition}.", (array, predicate) => sum(array.filter(predicate))],
  ["First Index Of", "Return the first index whose value matches this rule: {condition}. Return -1 when none exists.", (array, predicate) => array.findIndex(predicate)],
  ["Last Index Of", "Return the last index whose value matches this rule: {condition}. Return -1 when none exists.", (array, predicate) => array.map((value, index) => [value, index]).filter(([value, index]) => predicate(value, index, array)).map((pair) => pair[1]).pop() ?? -1],
  ["Positions Of", "Return every index whose value matches this rule: {condition}.", (array, predicate) => array.flatMap((value, index) => predicate(value, index, array) ? [index] : [])],
  ["Remove", "Return nums after removing every number that matches this rule: {condition}.", (array, predicate) => array.filter((value, index) => !predicate(value, index, array))],
  ["Replace", "Return nums with every number matching this rule replaced by zero: {condition}.", (array, predicate) => array.map((value, index) => predicate(value, index, array) ? 0 : value)],
  ["Require All", "Return true if every number in nums matches this rule: {condition}.", (array, predicate) => array.every(predicate)],
  ["Detect Any", "Return true if at least one number in nums matches this rule: {condition}.", (array, predicate) => array.some(predicate)],
];

arrayPredicates.forEach(([label, condition, predicate], index) => {
  const [verb, statement, solve] = arrayPredicateActions[index % arrayPredicateActions.length];
  const sample = sampleArray(index);
  const hidden = hiddenArray(index);
  addProblem({
    title: `${verb} ${label}`,
    topic: "array",
    params: ["nums"],
    sample: [sample],
    hidden: [hidden],
    statement: statement.replace("{condition}", condition),
    solve: (nums) => solve(nums, predicate),
  });
});

const arrayTasks = [
  ["Running Difference Trail", "array", ["nums"], [[5, 9, 4, 10]], [[3, 3, 8, 1]], (nums) => nums.map((value, index) => index === 0 ? value : value - nums[index - 1]), "Return a list of first value, then each value minus the previous value."],
  ["Adjacent Pair Sums", "array", ["nums"], [[1, 4, 7, 2]], [[3, 5, 9]], (nums) => nums.slice(0, -1).map((value, index) => value + nums[index + 1]), "Return sums of each adjacent pair."],
  ["Adjacent Pair Products", "array", ["nums"], [[2, 3, 4, 5]], [[1, -2, 3]], (nums) => nums.slice(0, -1).map((value, index) => value * nums[index + 1]), "Return products of each adjacent pair."],
  ["Running Maximums", "array", ["nums"], [[2, 5, 1, 7, 3]], [[-1, -3, 0, 4]], (nums) => nums.map((_, index) => Math.max(...nums.slice(0, index + 1))), "Return the maximum seen so far at each index."],
  ["Running Minimums", "array", ["nums"], [[4, 3, 8, 2]], [[5, 6, 1, 7]], (nums) => nums.map((_, index) => Math.min(...nums.slice(0, index + 1))), "Return the minimum seen so far at each index."],
  ["Suffix Sums", "array", ["nums"], [[1, 2, 3, 4]], [[5, -1, 2]], (nums) => nums.map((_, index) => sum(nums.slice(index))), "Return the sum from each index to the end."],
  ["Suffix Maximums", "array", ["nums"], [[1, 9, 2, 8]], [[7, 3, 4, 1]], (nums) => nums.map((_, index) => Math.max(...nums.slice(index))), "Return the maximum value from each index to the end."],
  ["Swap Neighbor Pairs", "array", ["nums"], [[1, 2, 3, 4, 5]], [[9, 8, 7]], (nums) => nums.map((_, index, array) => index % 2 === 0 ? (array[index + 1] ?? array[index]) : array[index - 1]), "Swap every pair of neighbors and leave a final odd item in place."],
  ["Center Array Around Average", "array", ["nums"], [[2, 4, 6]], [[1, 2, 6]], (nums) => { const avg = sum(nums) / nums.length; return nums.map((value) => value - avg); }, "Return each value minus the arithmetic mean of nums."],
  ["Absolute Distance From Target", "array", ["nums", "target"], [[3, 8, 10, 1], 6], [[-2, 5, 9], 4], (nums, target) => nums.map((value) => Math.abs(value - target)), "Return absolute distance from target for each number."],
  ["Clamp Values To Range", "array", ["nums", "low", "high"], [[-5, 2, 8, 15], 0, 10], [[3, 12, -1], 2, 9], (nums, low, high) => nums.map((value) => Math.max(low, Math.min(high, value))), "Return nums with every value clamped to the inclusive range low through high."],
  ["Split Around Pivot", "array", ["nums", "pivot"], [[4, 1, 7, 2, 6], 4], [[8, 3, 9, 1], 5], (nums, pivot) => [nums.filter((value) => value < pivot), nums.filter((value) => value >= pivot)], "Return two lists: values below pivot, then values at least pivot."],
  ["Move Target To Front", "array", ["nums", "target"], [[2, 5, 2, 7, 5], 5], [[1, 3, 1, 2], 1], (nums, target) => [...nums.filter((value) => value === target), ...nums.filter((value) => value !== target)], "Move every target value to the front while preserving relative order."],
  ["Move Target To Back", "array", ["nums", "target"], [[2, 5, 2, 7, 5], 5], [[1, 3, 1, 2], 1], (nums, target) => [...nums.filter((value) => value !== target), ...nums.filter((value) => value === target)], "Move every target value to the back while preserving relative order."],
  ["Deduplicate Preserving Order", "array", ["nums"], [[3, 1, 3, 2, 1, 4]], [[5, 5, 6, 5, 7]], (nums) => nums.filter((value, index) => nums.indexOf(value) === index), "Return nums with duplicates removed while keeping first occurrences."],
  ["Only Duplicate Values", "array", ["nums"], [[1, 2, 2, 3, 3, 3]], [[4, 5, 4, 6]], (nums) => uniqueSorted(nums.filter((value) => nums.indexOf(value) !== nums.lastIndexOf(value))), "Return sorted distinct values that appear more than once."],
  ["Values Appearing Once", "array", ["nums"], [[1, 2, 2, 3, 4, 4]], [[5, 6, 5, 7]], (nums) => nums.filter((value) => nums.indexOf(value) === nums.lastIndexOf(value)), "Return values that appear exactly once."],
  ["Sort By Absolute Value", "array", ["nums"], [[-10, 3, -2, 7]], [[5, -1, -9, 2]], (nums) => [...nums].sort((a, b) => Math.abs(a) - Math.abs(b) || a - b), "Return nums sorted by absolute value, breaking ties by numeric value."],
  ["Parity Partition", "array", ["nums"], [[5, 2, 7, 4, 1]], [[8, 3, 6, 5]], (nums) => [...nums.filter((value) => value % 2 === 0), ...nums.filter((value) => Math.abs(value % 2) === 1)], "Return even values first, then odd values, preserving order inside each group."],
  ["Sign Partition", "array", ["nums"], [[-2, 3, 0, -1, 5]], [[4, -5, -6, 7]], (nums) => [nums.filter((value) => value < 0), nums.filter((value) => value === 0), nums.filter((value) => value > 0)], "Return three lists: negative values, zeroes, then positive values."],
  ["Rotate Left By K", "array", ["nums", "k"], [[1, 2, 3, 4, 5], 2], [[9, 8, 7, 6], 1], (nums, k) => nums.length ? [...nums.slice(k % nums.length), ...nums.slice(0, k % nums.length)] : [], "Rotate nums left by k steps."],
  ["Rotate Right By K", "array", ["nums", "k"], [[1, 2, 3, 4, 5], 2], [[9, 8, 7, 6], 1], (nums, k) => nums.length ? [...nums.slice(nums.length - (k % nums.length)), ...nums.slice(0, nums.length - (k % nums.length))] : [], "Rotate nums right by k steps."],
  ["Chunk Into Pairs", "array", ["nums"], [[1, 2, 3, 4, 5]], [[6, 7, 8]], (nums) => Array.from({ length: Math.ceil(nums.length / 2) }, (_, index) => nums.slice(index * 2, index * 2 + 2)), "Group nums into consecutive pairs."],
  ["Chunk Sums Of Three", "array", ["nums"], [[1, 2, 3, 4, 5, 6, 7]], [[9, 1, 2, 3]], (nums) => Array.from({ length: Math.ceil(nums.length / 3) }, (_, index) => sum(nums.slice(index * 3, index * 3 + 3))), "Split nums into chunks of three and return each chunk sum."],
  ["Zip Add Arrays", "array", ["first", "second"], [[1, 2, 3], [4, 5, 6]], [[7, 8], [1, 2, 3]], (first, second) => first.slice(0, Math.min(first.length, second.length)).map((value, index) => value + second[index]), "Add two arrays position by position up to the shorter length."],
  ["Zip Max Arrays", "array", ["first", "second"], [[1, 7, 3], [4, 2, 6]], [[9, 1], [3, 8]], (first, second) => first.slice(0, Math.min(first.length, second.length)).map((value, index) => Math.max(value, second[index])), "Return the larger value at each shared index of two arrays."],
  ["Interleave Equal Arrays", "array", ["first", "second"], [[1, 3, 5], [2, 4, 6]], [["a", "c"], ["b", "d"]], (first, second) => first.flatMap((value, index) => [value, second[index]]), "Interleave two arrays with the same length."],
  ["Sorted Union", "array", ["first", "second"], [[1, 2, 2, 5], [2, 3, 5]], [[7, 1], [1, 9]], (first, second) => uniqueSorted([...first, ...second]), "Return the sorted distinct union of two arrays."],
  ["Symmetric Difference", "array", ["first", "second"], [[1, 2, 3], [3, 4, 5]], [[2, 2, 8], [8, 9]], (first, second) => uniqueSorted([...first.filter((value) => !second.includes(value)), ...second.filter((value) => !first.includes(value))]), "Return sorted distinct values that appear in exactly one of the two arrays."],
  ["Common Values With Counts", "array", ["first", "second"], [[1, 2, 2, 3], [2, 2, 4]], [[5, 5, 6], [5, 7, 5]], (first, second) => { const result = []; const pool = [...second]; for (const value of first) { const index = pool.indexOf(value); if (index !== -1) { result.push(value); pool.splice(index, 1); } } return result; }, "Return the multiset intersection of two arrays."],
  ["Longest Increasing Run Length", "array", ["nums"], [[1, 2, 2, 3, 4, 1]], [[5, 6, 7, 1, 2]], (nums) => nums.reduce((state, value, index) => { const current = index > 0 && value > nums[index - 1] ? state.current + 1 : 1; return { current, best: Math.max(state.best, current) }; }, { current: 0, best: 0 }).best, "Return the length of the longest strictly increasing contiguous run."],
  ["Longest Same Value Run", "array", ["nums"], [[1, 1, 2, 2, 2, 3]], [[4, 5, 5, 5, 5]], (nums) => nums.reduce((state, value, index) => { const current = index > 0 && value === nums[index - 1] ? state.current + 1 : 1; return { current, best: Math.max(state.best, current) }; }, { current: 0, best: 0 }).best, "Return the length of the longest contiguous run of equal values."],
  ["Buy Sell Single Profit", "array", ["prices"], [[7, 1, 5, 3, 6, 4]], [[9, 8, 7]], (prices) => prices.reduce((state, price) => ({ min: Math.min(state.min, price), best: Math.max(state.best, price - state.min) }), { min: Infinity, best: 0 }).best, "Return the best profit from one buy followed by one sell."],
  ["Container Pair Width Score", "array", ["heights"], [[1, 8, 6, 2, 5, 4, 8, 3, 7]], [[3, 1, 2, 4]], (heights) => { let best = 0; for (let i = 0; i < heights.length; i += 1) for (let j = i + 1; j < heights.length; j += 1) best = Math.max(best, Math.min(heights[i], heights[j]) * (j - i)); return best; }, "Return the largest area formed by two heights and their distance.", "medium"],
];

arrayTasks.forEach(([title, topic, params, sample, hidden, solve, statement, difficulty = "easy"]) => {
  addProblem({ title, topic, params, sample, hidden, solve, statement, difficulty });
});

const charPredicates = [
  ["Vowel Characters", "is a vowel", (char) => "aeiouAEIOU".includes(char)],
  ["Consonant Characters", "is a consonant letter", (char) => /^[a-z]$/i.test(char) && !"aeiouAEIOU".includes(char)],
  ["Digit Characters", "is a decimal digit", (char) => /^[0-9]$/.test(char)],
  ["Uppercase Letters", "is an uppercase letter", (char) => /^[A-Z]$/.test(char)],
  ["Lowercase Letters", "is a lowercase letter", (char) => /^[a-z]$/.test(char)],
  ["Space Characters", "is a space", (char) => char === " "],
  ["Alphabetic Characters", "is a letter", (char) => /^[a-z]$/i.test(char)],
  ["Non Alphabetic Characters", "is not a letter", (char) => !/^[a-z]$/i.test(char)],
  ["Repeated Characters", "appears more than once", (char, index, chars) => chars.indexOf(char) !== chars.lastIndexOf(char)],
  ["Unique Characters", "appears exactly once", (char, index, chars) => chars.indexOf(char) === chars.lastIndexOf(char)],
  ["Characters Before M", "comes before m alphabetically", (char) => /^[a-z]$/i.test(char) && char.toLowerCase() < "m"],
  ["Characters From M Onward", "is m or later alphabetically", (char) => /^[a-z]$/i.test(char) && char.toLowerCase() >= "m"],
  ["Boundary Characters", "is the first or last character", (_char, index, chars) => index === 0 || index === chars.length - 1],
  ["Interior Characters", "is not the first or last character", (_char, index, chars) => index > 0 && index < chars.length - 1],
  ["Characters Matching First", "matches the first character", (char, _index, chars) => char === chars[0]],
  ["Characters Matching Last", "matches the last character", (char, _index, chars) => char === chars[chars.length - 1]],
  ["Even Index Characters", "sits at an even index", (_char, index) => index % 2 === 0],
  ["Odd Index Characters", "sits at an odd index", (_char, index) => index % 2 === 1],
  ["Punctuation Characters", "is punctuation", (char) => /^[.,!?;:]$/.test(char)],
  ["Alphanumeric Characters", "is a letter or digit", (char) => /^[a-z0-9]$/i.test(char)],
  ["Mirror Pair Characters", "matches the character at the mirrored index", (char, index, chars) => char === chars[chars.length - 1 - index]],
  ["Ascii Small Characters", "has a char code below 100", (char) => char.charCodeAt(0) < 100],
  ["Ascii Large Characters", "has a char code at least 100", (char) => char.charCodeAt(0) >= 100],
  ["Dash Characters", "is a dash", (char) => char === "-"],
  ["Underscore Characters", "is an underscore", (char) => char === "_"],
  ["Bracket Characters", "is a bracket", (char) => "()[]{}".includes(char)],
  ["Hex Digit Characters", "is a hexadecimal digit", (char) => /^[0-9a-f]$/i.test(char)],
  ["Roman Numeral Characters", "is one of I, V, X, L, C, D, M", (char) => "IVXLCDMivxlcdm".includes(char)],
  ["Repeated Neighbor Characters", "matches an adjacent character", (char, index, chars) => char === chars[index - 1] || char === chars[index + 1]],
  ["Non Space Characters", "is not a space", (char) => char !== " "],
];

const charActions = [
  ["Count", "Return how many characters in s match this rule: {condition}.", (chars, predicate) => chars.filter(predicate).length],
  ["Collect", "Return a string made of characters in s that match this rule: {condition}.", (chars, predicate) => chars.filter(predicate).join("")],
  ["Remove", "Return s after removing characters that match this rule: {condition}.", (chars, predicate) => chars.filter((char, index) => !predicate(char, index, chars)).join("")],
  ["Positions Of", "Return indices of characters in s that match this rule: {condition}.", (chars, predicate) => chars.flatMap((char, index) => predicate(char, index, chars) ? [index] : [])],
  ["Replace", "Return s with characters matching this rule replaced by an asterisk: {condition}.", (chars, predicate) => chars.map((char, index) => predicate(char, index, chars) ? "*" : char).join("")],
  ["First Index Of", "Return the first index whose character matches this rule: {condition}. Return -1 when none exists.", (chars, predicate) => chars.findIndex(predicate)],
  ["Last Index Of", "Return the last index whose character matches this rule: {condition}. Return -1 when none exists.", (chars, predicate) => chars.map((char, index) => [char, index]).filter(([char, index]) => predicate(char, index, chars)).map((pair) => pair[1]).pop() ?? -1],
  ["Require All", "Return true if every character in s matches this rule: {condition}.", (chars, predicate) => chars.every(predicate)],
  ["Detect Any", "Return true if at least one character in s matches this rule: {condition}.", (chars, predicate) => chars.some(predicate)],
  ["Mirror", "Return characters matching this rule first, then the remaining characters: {condition}.", (chars, predicate) => [...chars.filter(predicate), ...chars.filter((char, index) => !predicate(char, index, chars))].join("")],
];

const textSamples = [
  "Daily Code 2026!",
  "array_stack_map",
  "level noon civic",
  "A-B-C data",
  "hex cafe 19",
  "SwiftUI HabitQuest",
  "mississippi river",
  "practice makes steady progress",
];

charPredicates.forEach(([label, condition, predicate], index) => {
  const [verb, statement, solve] = charActions[index % charActions.length];
  addProblem({
    title: `${verb} ${label}`,
    topic: "string",
    params: ["s"],
    sample: [textSamples[index % textSamples.length]],
    hidden: [textSamples[(index + 4) % textSamples.length]],
    statement: statement.replace("{condition}", condition),
    solve: (s) => solve([...s], predicate),
  });
});

const stringTasks = [
  ["Normalize Spaces", ["s"], ["  learn   to   code  "], ["one    calm step"], (s) => s.trim().split(/\s+/).join(" "), "Trim a sentence and collapse repeated spaces into a single space."],
  ["Reverse Each Word", ["sentence"], ["hello brave coder"], ["daily practice wins"], (sentence) => sentence.split(" ").map((word) => [...word].reverse().join("")).join(" "), "Reverse the letters inside each word while keeping word order."],
  ["Word Lengths", ["sentence"], ["write clean code"], ["small steady steps"], (sentence) => sentence.split(" ").map((word) => word.length), "Return the length of each word."],
  ["Initialism Builder", ["sentence"], ["data structures algorithms"], ["habit quest daily"], (sentence) => sentence.split(" ").map((word) => word[0].toUpperCase()).join(""), "Build an uppercase initialism from the first letter of each word."],
  ["Longest Word", ["sentence"], ["small deliberate practice"], ["debug the asynchronous workflow"], (sentence) => sentence.split(" ").reduce((best, word) => word.length > best.length ? word : best, ""), "Return the longest word in the sentence."],
  ["Shortest Word", ["sentence"], ["small deliberate practice"], ["debug the async workflow"], (sentence) => sentence.split(" ").reduce((best, word) => word.length < best.length ? word : best), "Return the shortest word in the sentence."],
  ["Words Longer Than Limit", ["sentence", "limit"], ["arrays are surprisingly useful", 5], ["ship tiny features daily", 4], (sentence, limit) => sentence.split(" ").filter((word) => word.length > limit), "Return words whose length is greater than limit."],
  ["Snake Case Words", ["sentence"], ["Daily Coding Habit"], ["Practice Every Morning"], (sentence) => sentence.toLowerCase().split(/\s+/).join("_"), "Convert space-separated words to snake_case."],
  ["Kebab Case Words", ["sentence"], ["Daily Coding Habit"], ["Practice Every Morning"], (sentence) => sentence.toLowerCase().split(/\s+/).join("-"), "Convert space-separated words to kebab-case."],
  ["Camel Case Words", ["sentence"], ["daily coding habit"], ["practice every morning"], (sentence) => sentence.split(" ").map((word, index) => index === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase()).join(""), "Convert words to lower camelCase."],
  ["Title Case Sentence", ["sentence"], ["daily coding habit"], ["practice every morning"], (sentence) => sentence.split(" ").map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(" "), "Uppercase the first letter of each word."],
  ["Alternate Letter Case", ["s"], ["abcdef"], ["practice"], (s) => [...s].map((char, index) => index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()).join(""), "Return s with even-index letters uppercase and odd-index letters lowercase."],
  ["Mask All Digits", ["s"], ["room 204 floor 7"], ["pin 1234 ok"], (s) => s.replace(/[0-9]/g, "#"), "Replace every digit with #."],
  ["Remove Duplicate Letters", ["s"], ["banana"], ["mississippi"], (s) => [...s].filter((char, index) => s.indexOf(char) === index).join(""), "Remove repeated characters, keeping first appearances."],
  ["First Repeated Character", ["s"], ["abcdefca"], ["swiss"], (s) => [...s].find((char, index) => s.indexOf(char) !== index) ?? "", "Return the first character whose earlier copy already appeared."],
  ["First Unique Character Value", ["s"], ["leetcode"], ["aabbc"], (s) => [...s].find((char) => s.indexOf(char) === s.lastIndexOf(char)) ?? "", "Return the first character that appears once."],
  ["Run Length Encode", ["s"], ["aaabbc"], ["xxxxxyzz"], (s) => { let out = ""; for (let i = 0; i < s.length;) { let j = i; while (j < s.length && s[j] === s[i]) j += 1; out += `${s[i]}${j - i}`; i = j; } return out; }, "Compress consecutive repeated characters as character plus count."],
  ["Run Length Decode", ["s"], ["a3b2c1"], ["x5y1z2"], (s) => { let out = ""; for (let i = 0; i < s.length; i += 2) out += s[i].repeat(Number(s[i + 1])); return out; }, "Decode a simple run-length string where each character is followed by a one-digit count."],
  ["Balanced Letter Halves", ["s"], ["aabb"], ["abcabc"], (s) => sum([...s.slice(0, s.length / 2)].map((char) => char.charCodeAt(0))) === sum([...s.slice(s.length / 2)].map((char) => char.charCodeAt(0))), "Return true if both halves have the same sum of character codes."],
  ["Anagram After Sorting", ["first", "second"], ["listen", "silent"], ["binary", "brainy"], (first, second) => [...first].sort().join("") === [...second].sort().join(""), "Return true if two strings contain the same characters with the same counts."],
  ["Is Rotation String", ["first", "second"], ["abcde", "cdeab"], ["water", "terwa"], (first, second) => first.length === second.length && (first + first).includes(second), "Return true if second is a rotation of first."],
  ["Common Prefix", ["first", "second"], ["flower", "flow"], ["internet", "internal"], (first, second) => { let i = 0; while (i < first.length && i < second.length && first[i] === second[i]) i += 1; return first.slice(0, i); }, "Return the longest common prefix of two strings."],
  ["Common Suffix", ["first", "second"], ["walking", "king"], ["testing", "resting"], (first, second) => { let i = 0; while (i < first.length && i < second.length && first[first.length - 1 - i] === second[second.length - 1 - i]) i += 1; return first.slice(first.length - i); }, "Return the longest common suffix of two strings."],
  ["Caesar Shift Once", ["s"], ["abc xyz"], ["hello"], (s) => [...s].map((char) => /[a-z]/.test(char) ? String.fromCharCode(((char.charCodeAt(0) - 96) % 26) + 97) : char).join(""), "Shift each lowercase letter forward by one, wrapping z to a."],
  ["Bracket Depth", ["s"], ["(a+(b*c))"], ["((x))()"], (s) => { let depth = 0; let best = 0; for (const char of s) { if (char === "(") best = Math.max(best, ++depth); if (char === ")") depth -= 1; } return best; }, "Return the maximum nesting depth of parentheses."],
  ["CSV Field Count", ["line"], ["name,age,city"], ["a,b,c,d"], (line) => line ? line.split(",").length : 0, "Return how many comma-separated fields a line contains."],
  ["Dot Path Last Segment", ["pathText"], ["user.profile.name"], ["app.api.v1.health"], (pathText) => pathText.split(".").pop(), "Return the final segment of a dot-separated path."],
  ["Email Username", ["email"], ["coder@example.com"], ["habit@bayuuat.com"], (email) => email.split("@")[0], "Return the username part before @ in an email string."],
  ["Hashtag Words", ["sentence"], ["daily coding habit"], ["ship small wins"], (sentence) => sentence.split(" ").map((word) => `#${word}`).join(" "), "Prefix every word with #."],
  ["Mirror String With Separator", ["s"], ["code"], ["habit"], (s) => `${s}|${[...s].reverse().join("")}`, "Return s, a pipe, and then s reversed."],
  ["Remove Word By Position", ["sentence", "index"], ["zero one two three", 2], ["alpha beta gamma", 1], (sentence, index) => sentence.split(" ").filter((_, i) => i !== index).join(" "), "Remove the word at index from a sentence."],
  ["Rotate Words Left", ["sentence"], ["one two three four"], ["alpha beta gamma"], (sentence) => { const words = sentence.split(" "); return [...words.slice(1), words[0]].join(" "); }, "Move the first word to the end."],
  ["Rotate Words Right", ["sentence"], ["one two three four"], ["alpha beta gamma"], (sentence) => { const words = sentence.split(" "); return [words[words.length - 1], ...words.slice(0, -1)].join(" "); }, "Move the last word to the front."],
  ["Middle Character Or Pair", ["s"], ["abcde"], ["python"], (s) => s.length % 2 === 1 ? s[Math.floor(s.length / 2)] : s.slice(s.length / 2 - 1, s.length / 2 + 1), "Return the middle character for odd length, or the middle two characters for even length."],
  ["Lexicographically Smaller String", ["first", "second"], ["apple", "banana"], ["zebra", "yak"], (first, second) => first < second ? first : second, "Return the lexicographically smaller of two strings."],
  ["Character Frequency Object", ["s"], ["banana"], ["level"], (s) => [...s].reduce((acc, char) => ({ ...acc, [char]: (acc[char] || 0) + 1 }), {}), "Return an object counting each character."],
  ["Words By First Letter", ["sentence"], ["apple ant bee"], ["cat car dog"], (sentence) => sentence.split(" ").reduce((acc, word) => ({ ...acc, [word[0]]: [...(acc[word[0]] || []), word] }), {}), "Group words by first letter."],
  ["Is Pangram Lite", ["s"], ["abcdefghijklmnopqrstuvwxyz"], ["the quick brown fox"], (s) => "abcdefghijklmnopqrstuvwxyz".split("").every((char) => s.toLowerCase().includes(char)), "Return true if s contains every lowercase English letter at least once."],
];

stringTasks.forEach(([title, params, sample, hidden, solve, statement]) => {
  addProblem({ title, topic: "string", params, sample, hidden, solve, statement });
});

const mathTasks = [
  ["Greatest Common Divisor", ["a", "b"], [84, 30], [48, 18], gcd, "Return the greatest common divisor of a and b."],
  ["Least Common Multiple", ["a", "b"], [12, 18], [8, 14], (a, b) => Math.abs(a * b) / gcd(a, b), "Return the least common multiple of a and b."],
  ["Digit Product", ["n"], [234], [105], (n) => [...String(Math.abs(n))].reduce((acc, char) => acc * Number(char), 1), "Return the product of the decimal digits of n."],
  ["Reverse Integer Digits", ["n"], [12345], [9001], (n) => Number([...String(Math.abs(n))].reverse().join("")) * Math.sign(n || 1), "Return n with its decimal digits reversed."],
  ["Digital Root", ["n"], [9875], [999], (n) => { let value = Math.abs(n); while (value >= 10) value = sum([...String(value)].map(Number)); return value; }, "Repeatedly sum digits until one digit remains."],
  ["Count Divisors", ["n"], [12], [28], (n) => Array.from({ length: n }, (_, i) => i + 1).filter((value) => n % value === 0).length, "Return how many positive divisors n has."],
  ["List Divisors", ["n"], [12], [15], (n) => Array.from({ length: n }, (_, i) => i + 1).filter((value) => n % value === 0), "Return all positive divisors of n in ascending order."],
  ["Proper Divisor Sum", ["n"], [12], [10], (n) => sum(Array.from({ length: n - 1 }, (_, i) => i + 1).filter((value) => n % value === 0)), "Return the sum of all positive divisors below n."],
  ["Is Perfect Number", ["n"], [28], [12], (n) => sum(Array.from({ length: n - 1 }, (_, i) => i + 1).filter((value) => n % value === 0)) === n, "Return true if n equals the sum of its proper divisors."],
  ["Is Abundant Number", ["n"], [12], [10], (n) => sum(Array.from({ length: n - 1 }, (_, i) => i + 1).filter((value) => n % value === 0)) > n, "Return true if proper divisors sum to more than n."],
  ["Trailing Zeroes In Factorial", ["n"], [10], [25], (n) => { let count = 0; for (let divisor = 5; divisor <= n; divisor *= 5) count += Math.floor(n / divisor); return count; }, "Return how many trailing zeroes n factorial has."],
  ["Nth Fibonacci Number", ["n"], [8], [10], fibonacci, "Return the n-th Fibonacci number with F(0)=0 and F(1)=1."],
  ["Nth Tribonacci Number", ["n"], [5], [7], (n) => { const values = [0, 1, 1]; for (let i = 3; i <= n; i += 1) values[i] = values[i - 1] + values[i - 2] + values[i - 3]; return values[n]; }, "Return the n-th Tribonacci number with T(0)=0, T(1)=1, T(2)=1."],
  ["Triangular Number", ["n"], [7], [12], (n) => n * (n + 1) / 2, "Return the n-th triangular number."],
  ["Is Triangular Number", ["n"], [21], [22], (n) => { let total = 0; for (let i = 1; total < n; i += 1) total += i; return total === n; }, "Return true if n is a triangular number."],
  ["Is Power Of Three", ["n"], [27], [45], (n) => { while (n > 1 && n % 3 === 0) n /= 3; return n === 1; }, "Return true if n is a power of three."],
  ["Binary Ones", ["n"], [13], [31], (n) => n.toString(2).split("").filter((char) => char === "1").length, "Return how many 1 bits are in the binary representation of n."],
  ["Binary Width", ["n"], [13], [31], (n) => n.toString(2).length, "Return the number of bits in the binary representation of n."],
  ["Hamming Distance", ["a", "b"], [5, 9], [7, 10], (a, b) => (a ^ b).toString(2).split("").filter((char) => char === "1").length, "Return how many bit positions differ between a and b."],
  ["Collatz Step Count", ["n"], [6], [11], (n) => { let steps = 0; while (n !== 1) { n = n % 2 === 0 ? n / 2 : n * 3 + 1; steps += 1; } return steps; }, "Return how many Collatz steps are needed to reach 1."],
  ["Nearest Multiple Up", ["n", "base"], [17, 5], [31, 8], (n, base) => Math.ceil(n / base) * base, "Return the smallest multiple of base that is at least n."],
  ["Nearest Multiple Down", ["n", "base"], [17, 5], [31, 8], (n, base) => Math.floor(n / base) * base, "Return the largest multiple of base that is at most n."],
  ["Minutes To Clock Text", ["minutes"], [135], [75], (minutes) => `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`, "Convert minutes after midnight to H:MM text."],
  ["Clock Text To Minutes", ["clock"], ["2:15"], ["1:05"], (clock) => { const [h, m] = clock.split(":").map(Number); return h * 60 + m; }, "Convert H:MM clock text to minutes after midnight."],
  ["Roman One Digit", ["n"], [8], [4], (n) => ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][n], "Convert a one-digit number from 1 to 9 into Roman numerals."],
  ["Roman One Digit Value", ["roman"], ["VIII"], ["IV"], (roman) => ({ I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9 })[roman], "Convert a Roman numeral from I through IX into its value."],
  ["Armstrong Three Digit", ["n"], [153], [123], (n) => sum([...String(n)].map((char) => Number(char) ** 3)) === n, "Return true if a three-digit number equals the sum of the cubes of its digits."],
  ["Next Prime", ["n"], [14], [29], (n) => { let value = n + 1; while (!isPrime(value)) value += 1; return value; }, "Return the smallest prime number greater than n."],
  ["Prime Count Up To N", ["n"], [10], [20], (n) => Array.from({ length: n }, (_, i) => i + 1).filter(isPrime).length, "Return how many prime numbers are less than or equal to n."],
  ["Nth Odd Number", ["n"], [5], [12], (n) => 2 * n - 1, "Return the n-th positive odd number."],
  ["Nth Even Number", ["n"], [5], [12], (n) => 2 * n, "Return the n-th positive even number."],
  ["Arithmetic Series Sum", ["first", "diff", "count"], [2, 3, 4], [5, 2, 5], (first, diff, count) => count * (2 * first + (count - 1) * diff) / 2, "Return the sum of an arithmetic series."],
  ["Geometric Series Sum", ["first", "ratio", "count"], [2, 3, 4], [1, 2, 5], (first, ratio, count) => sum(Array.from({ length: count }, (_, i) => first * ratio ** i)), "Return the sum of a finite geometric series."],
  ["Rectangle Perimeter", ["width", "height"], [7, 3], [10, 4], (width, height) => 2 * (width + height), "Return the perimeter of a rectangle."],
  ["Rectangle Area", ["width", "height"], [7, 3], [10, 4], (width, height) => width * height, "Return the area of a rectangle."],
  ["Circle Area Floor", ["radius"], [3], [5], (radius) => Math.floor(Math.PI * radius * radius), "Return the floor of the area of a circle."],
  ["Distance Squared", ["x1", "y1", "x2", "y2"], [0, 0, 3, 4], [1, 2, 4, 6], (x1, y1, x2, y2) => (x2 - x1) ** 2 + (y2 - y1) ** 2, "Return squared distance between two points."],
];

mathTasks.forEach(([title, params, sample, hidden, solve, statement], index) => {
  addProblem({ title, topic: "math", params, sample, hidden, solve, statement, difficulty: index > 24 ? "medium" : "easy" });
});

const matrixTasks = [
  ["Matrix Row Sums", ["matrix"], [[[1, 2, 3], [4, 5, 6]]], [[[2, 2], [3, 3], [4, 4]]], (matrix) => matrix.map(sum), "Return the sum of each matrix row."],
  ["Matrix Column Sums", ["matrix"], [[[1, 2, 3], [4, 5, 6]]], [[[2, 2], [3, 3], [4, 4]]], (matrix) => matrix[0].map((_, column) => sum(matrix.map((row) => row[column]))), "Return the sum of each matrix column."],
  ["Matrix Main Diagonal Sum", ["matrix"], [[[1, 2], [3, 4]]], [[[5, 1, 2], [0, 6, 3], [4, 8, 7]]], (matrix) => sum(matrix.map((row, index) => row[index])), "Return the main diagonal sum of a square matrix."],
  ["Matrix Anti Diagonal Sum", ["matrix"], [[[1, 2], [3, 4]]], [[[5, 1, 2], [0, 6, 3], [4, 8, 7]]], (matrix) => sum(matrix.map((row, index) => row[row.length - 1 - index])), "Return the anti-diagonal sum of a square matrix."],
  ["Matrix Border Sum", ["matrix"], [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], [[[1, 2], [3, 4]]], (matrix) => sum(matrix.flatMap((row, r) => row.filter((_value, c) => r === 0 || c === 0 || r === matrix.length - 1 || c === row.length - 1))), "Return the sum of all border cells."],
  ["Matrix Center Value", ["matrix"], [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], [[[2, 4, 6], [8, 10, 12], [14, 16, 18]]], (matrix) => matrix[Math.floor(matrix.length / 2)][Math.floor(matrix[0].length / 2)], "Return the center value of an odd-sized matrix."],
  ["Matrix Flatten", ["matrix"], [[[1, 2], [3, 4]]], [[[5], [6], [7]]], (matrix) => matrix.flat(), "Return all matrix values in row-major order."],
  ["Matrix Transpose", ["matrix"], [[[1, 2, 3], [4, 5, 6]]], [[[7, 8], [9, 10]]], (matrix) => matrix[0].map((_, column) => matrix.map((row) => row[column])), "Return the transpose of a matrix."],
  ["Matrix Count Zeroes", ["matrix"], [[[0, 1], [2, 0], [0, 3]]], [[[4, 5], [6, 7]]], (matrix) => matrix.flat().filter((value) => value === 0).length, "Return how many cells are zero."],
  ["Matrix Max Position", ["matrix"], [[[1, 9, 3], [4, 5, 6]]], [[[7, 8], [10, 9]]], (matrix) => { let best = [-Infinity, 0, 0]; matrix.forEach((row, r) => row.forEach((value, c) => { if (value > best[0]) best = [value, r, c]; })); return [best[1], best[2]]; }, "Return row and column of the largest value."],
  ["Matrix Row With Largest Sum", ["matrix"], [[[1, 2], [10, 1], [3, 4]]], [[[5, 5], [2, 20]]], (matrix) => matrix.map(sum).reduce((best, value, index, sums) => value > sums[best] ? index : best, 0), "Return the index of the row with the largest sum."],
  ["Matrix Column With Smallest Sum", ["matrix"], [[[1, 2, 3], [4, 0, 6]]], [[[5, 1], [6, 2]]], (matrix) => matrix[0].map((_, column) => sum(matrix.map((row) => row[column]))).reduce((best, value, index, sums) => value < sums[best] ? index : best, 0), "Return the index of the column with the smallest sum."],
  ["Matrix Rotate Clockwise", ["matrix"], [[[1, 2], [3, 4]]], [[[1, 2, 3], [4, 5, 6]]], (matrix) => matrix[0].map((_, column) => matrix.map((row) => row[column]).reverse()), "Rotate a matrix clockwise."],
  ["Matrix Flip Horizontal", ["matrix"], [[[1, 2], [3, 4]]], [[[1, 2, 3], [4, 5, 6]]], (matrix) => matrix.map((row) => [...row].reverse()), "Flip every matrix row horizontally."],
  ["Matrix Flip Vertical", ["matrix"], [[[1, 2], [3, 4]]], [[[1, 2, 3], [4, 5, 6]]], (matrix) => [...matrix].reverse(), "Flip the matrix vertically."],
  ["Matrix Trace Difference", ["matrix"], [[[1, 2], [3, 4]]], [[[5, 1, 2], [0, 6, 3], [4, 8, 7]]], (matrix) => sum(matrix.map((row, index) => row[index])) - sum(matrix.map((row, index) => row[row.length - 1 - index])), "Return main diagonal sum minus anti-diagonal sum."],
  ["Matrix Positive Count Per Row", ["matrix"], [[[1, -2, 3], [-4, 5, 6]]], [[[-1, -2], [3, 4], [0, 5]]], (matrix) => matrix.map((row) => row.filter((value) => value > 0).length), "Return how many positive values each row contains."],
  ["Matrix Checkerboard Sum", ["matrix"], [[[1, 2], [3, 4]]], [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], (matrix) => sum(matrix.flatMap((row, r) => row.filter((_value, c) => (r + c) % 2 === 0))), "Return the sum of cells whose row plus column index is even."],
  ["Matrix Spiral Order", ["matrix"], [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], [[[1, 2], [3, 4], [5, 6]]], (matrix) => { const result = []; let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1; while (top <= bottom && left <= right) { for (let c = left; c <= right; c += 1) result.push(matrix[top][c]); top += 1; for (let r = top; r <= bottom; r += 1) result.push(matrix[r][right]); right -= 1; if (top <= bottom) { for (let c = right; c >= left; c -= 1) result.push(matrix[bottom][c]); bottom -= 1; } if (left <= right) { for (let r = bottom; r >= top; r -= 1) result.push(matrix[r][left]); left += 1; } } return result; }, "Return matrix values in spiral order.", "medium"],
];

matrixTasks.forEach(([title, params, sample, hidden, solve, statement, difficulty = "easy"]) => {
  addProblem({ title, topic: "matrix", params, sample, hidden, solve, statement, difficulty });
});

const mapTasks = [
  ["Inventory Total Quantity", ["items"], [[{ name: "apple", qty: 2 }, { name: "pear", qty: 5 }]], [[{ name: "book", qty: 1 }, { name: "pen", qty: 3 }]], (items) => sum(items.map((item) => item.qty)), "Return the total qty across inventory items."],
  ["Inventory Quantity By Name", ["items"], [[{ name: "apple", qty: 2 }, { name: "apple", qty: 3 }, { name: "pear", qty: 1 }]], [[{ name: "pen", qty: 2 }, { name: "book", qty: 4 }]], (items) => items.reduce((acc, item) => ({ ...acc, [item.name]: (acc[item.name] || 0) + item.qty }), {}), "Return an object mapping item names to total quantity."],
  ["Top Scoring Student", ["students"], [[{ name: "Ada", score: 91 }, { name: "Lin", score: 88 }]], [[{ name: "Sam", score: 75 }, { name: "Mia", score: 99 }]], (students) => students.reduce((best, student) => student.score > best.score ? student : best).name, "Return the name of the student with the highest score."],
  ["Passing Student Names", ["students", "minimum"], [[{ name: "Ada", score: 91 }, { name: "Lin", score: 58 }], 60], [[{ name: "Sam", score: 75 }, { name: "Mia", score: 59 }], 70], (students, minimum) => students.filter((student) => student.score >= minimum).map((student) => student.name), "Return names of students whose score is at least minimum."],
  ["Average Score Floor", ["students"], [[{ name: "Ada", score: 91 }, { name: "Lin", score: 88 }]], [[{ name: "Sam", score: 75 }, { name: "Mia", score: 99 }]], (students) => Math.floor(sum(students.map((student) => student.score)) / students.length), "Return the floor average score."],
  ["Merge Count Objects", ["first", "second"], [{ a: 2, b: 1 }, { a: 3, c: 4 }], [{ x: 1 }, { x: 2, y: 5 }], (first, second) => Object.fromEntries([...new Set([...Object.keys(first), ...Object.keys(second)])].sort().map((key) => [key, (first[key] || 0) + (second[key] || 0)])), "Merge two count objects by adding matching keys."],
  ["Invert Unique Map", ["mapping"], [{ a: "x", b: "y" }], [{ one: "1", two: "2" }], (mapping) => Object.fromEntries(Object.entries(mapping).map(([key, value]) => [value, key]).sort()), "Return a new object where values become keys and keys become values."],
  ["Group Numbers By Remainder", ["nums", "mod"], [[1, 2, 3, 4, 5], 3], [[6, 7, 8, 9], 2], (nums, mod) => nums.reduce((acc, value) => ({ ...acc, [value % mod]: [...(acc[value % mod] || []), value] }), {}), "Group numbers by their remainder modulo mod."],
  ["Most Frequent Word", ["words"], [["code", "daily", "code", "habit"]], [["a", "b", "b", "c"]], (words) => { const counts = words.reduce((acc, word) => ({ ...acc, [word]: (acc[word] || 0) + 1 }), {}); return Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))[0]; }, "Return the most frequent word, breaking ties alphabetically."],
  ["Least Frequent Word", ["words"], [["code", "daily", "code", "habit"]], [["a", "b", "b", "c"]], (words) => { const counts = words.reduce((acc, word) => ({ ...acc, [word]: (acc[word] || 0) + 1 }), {}); return Object.keys(counts).sort((a, b) => counts[a] - counts[b] || a.localeCompare(b))[0]; }, "Return the least frequent word, breaking ties alphabetically."],
  ["Index Map First Occurrence", ["values"], [["a", "b", "a", "c"]], [["x", "y", "x"]], (values) => values.reduce((acc, value, index) => value in acc ? acc : { ...acc, [value]: index }, {}), "Return an object mapping each value to its first index."],
  ["Index Map Last Occurrence", ["values"], [["a", "b", "a", "c"]], [["x", "y", "x"]], (values) => values.reduce((acc, value, index) => ({ ...acc, [value]: index }), {}), "Return an object mapping each value to its last index."],
  ["Pairs To Object", ["pairs"], [[["a", 1], ["b", 2]]], [[["x", 9], ["y", 8]]], (pairs) => Object.fromEntries(pairs), "Convert key-value pairs into an object."],
  ["Object To Sorted Pairs", ["obj"], [{ b: 2, a: 1 }], [{ z: 9, x: 7 }], (obj) => Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)), "Convert an object to key-value pairs sorted by key."],
  ["Filter Object Above Limit", ["obj", "limit"], [{ a: 1, b: 5, c: 3 }, 2], [{ x: 9, y: 1 }, 5], (obj, limit) => Object.fromEntries(Object.entries(obj).filter(([, value]) => value > limit).sort()), "Return an object keeping entries whose value is greater than limit."],
];

mapTasks.forEach(([title, params, sample, hidden, solve, statement]) => {
  addProblem({ title, topic: "hash-map", params, sample, hidden, solve, statement });
});

const algorithmTasks = [
  ["Binary Insert Position", "search", ["nums", "target"], [[1, 3, 5, 6], 5], [[1, 3, 5, 6], 2], (nums, target) => nums.findIndex((value) => value >= target) === -1 ? nums.length : nums.findIndex((value) => value >= target), "Return the index where target is found or should be inserted into sorted nums."],
  ["Lower Bound Index", "search", ["nums", "target"], [[1, 2, 4, 4, 7], 4], [[1, 2, 5], 3], (nums, target) => nums.findIndex((value) => value >= target) === -1 ? nums.length : nums.findIndex((value) => value >= target), "Return the first index whose value is at least target."],
  ["Upper Bound Index", "search", ["nums", "target"], [[1, 2, 4, 4, 7], 4], [[1, 2, 5], 3], (nums, target) => nums.findIndex((value) => value > target) === -1 ? nums.length : nums.findIndex((value) => value > target), "Return the first index whose value is greater than target."],
  ["Kth Smallest Value", "sorting", ["nums", "k"], [[7, 1, 5, 3], 2], [[9, 4, 6, 1], 3], (nums, k) => [...nums].sort((a, b) => a - b)[k - 1], "Return the k-th smallest value."],
  ["Kth Largest Value", "sorting", ["nums", "k"], [[7, 1, 5, 3], 2], [[9, 4, 6, 1], 3], (nums, k) => [...nums].sort((a, b) => b - a)[k - 1], "Return the k-th largest value."],
  ["Median Of Sorted Values", "sorting", ["nums"], [[1, 3, 5]], [[1, 2, 3, 4]], (nums) => { const sorted = [...nums].sort((a, b) => a - b); const mid = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2; }, "Return the median after sorting nums."],
  ["Merge Intervals Simple", "interval", ["intervals"], [[ [1, 3], [2, 6], [8, 10] ]], [[ [1, 4], [4, 5] ]], (intervals) => { const sorted = [...intervals].sort((a, b) => a[0] - b[0]); const result = []; for (const interval of sorted) { const last = result[result.length - 1]; if (!last || interval[0] > last[1]) result.push([...interval]); else last[1] = Math.max(last[1], interval[1]); } return result; }, "Merge overlapping intervals.", "medium"],
  ["Count Overlapping Intervals", "interval", ["intervals"], [[ [1, 3], [2, 4], [5, 7] ]], [[ [1, 2], [3, 4] ]], (intervals) => { let count = 0; for (let i = 0; i < intervals.length; i += 1) for (let j = i + 1; j < intervals.length; j += 1) if (Math.max(intervals[i][0], intervals[j][0]) <= Math.min(intervals[i][1], intervals[j][1])) count += 1; return count; }, "Return how many pairs of intervals overlap."],
  ["Valid Bracket String", "stack", ["s"], ["([]{})"], ["([)]"], (s) => { const pairs = { ")": "(", "]": "[", "}": "{" }; const stack = []; for (const char of s) { if ("([{".includes(char)) stack.push(char); if (")]}".includes(char) && stack.pop() !== pairs[char]) return false; } return stack.length === 0; }, "Return true if brackets are balanced."],
  ["Remove Adjacent Duplicates", "stack", ["s"], ["abbaca"], ["azxxzy"], (s) => { const stack = []; for (const char of s) stack[stack.length - 1] === char ? stack.pop() : stack.push(char); return stack.join(""); }, "Repeatedly remove adjacent equal character pairs."],
  ["Baseball Score Total", "stack", ["ops"], [["5", "2", "C", "D", "+"]], [["5", "-2", "4", "C", "D", "9", "+", "+"]], (ops) => { const stack = []; for (const op of ops) { if (op === "C") stack.pop(); else if (op === "D") stack.push(stack[stack.length - 1] * 2); else if (op === "+") stack.push(stack[stack.length - 1] + stack[stack.length - 2]); else stack.push(Number(op)); } return sum(stack); }, "Evaluate a simplified baseball scoring log."],
  ["Evaluate Reverse Polish Notation", "stack", ["tokens"], [["2", "1", "+", "3", "*"]], [["4", "13", "5", "/", "+"]], (tokens) => { const stack = []; for (const token of tokens) { if (!"+-*/".includes(token)) stack.push(Number(token)); else { const b = stack.pop(); const a = stack.pop(); stack.push(token === "+" ? a + b : token === "-" ? a - b : token === "*" ? a * b : Math.trunc(a / b)); } } return stack[0]; }, "Evaluate an expression in reverse Polish notation.", "medium"],
  ["Daily Temperature Waits", "stack", ["temps"], [[73, 74, 75, 71, 69, 72, 76, 73]], [[30, 40, 50, 60]], (temps) => temps.map((temp, index) => { const next = temps.findIndex((other, j) => j > index && other > temp); return next === -1 ? 0 : next - index; }), "Return days to wait for a warmer temperature at each index.", "medium"],
  ["Next Greater Values", "stack", ["nums"], [[2, 1, 2, 4, 3]], [[1, 3, 2, 4]], (nums) => nums.map((value, index) => nums.slice(index + 1).find((other) => other > value) ?? -1), "Return the next greater value to the right for each number.", "medium"],
  ["House Robber Small Street", "dp", ["nums"], [[2, 7, 9, 3, 1]], [[1, 2, 3, 1]], (nums) => nums.reduce(([prev2, prev1], value) => [prev1, Math.max(prev1, prev2 + value)], [0, 0])[1], "Return the most money that can be robbed without taking adjacent houses.", "medium"],
  ["Minimum Cost Climbing", "dp", ["cost"], [[10, 15, 20]], [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], (cost) => { let a = 0, b = 0; for (const value of cost) [a, b] = [b, Math.min(a, b) + value]; return Math.min(a, b); }, "Return the minimum cost to reach the top of a staircase.", "medium"],
  ["Coin Change Ways Small", "dp", ["amount", "coins"], [5, [1, 2, 5]], [4, [1, 2, 3]], (amount, coins) => { const dp = Array(amount + 1).fill(0); dp[0] = 1; for (const coin of coins) for (let value = coin; value <= amount; value += 1) dp[value] += dp[value - coin]; return dp[amount]; }, "Return how many combinations of coins make amount.", "medium"],
  ["Longest Common Prefix In List", "string", ["words"], [["flower", "flow", "flight"]], [["dog", "racecar", "car"]], (words) => { let prefix = words[0] ?? ""; for (const word of words) while (!word.startsWith(prefix)) prefix = prefix.slice(0, -1); return prefix; }, "Return the longest common prefix among all words."],
  ["Is Subsequence", "two-pointer", ["small", "large"], ["abc", "ahbgdc"], ["axc", "ahbgdc"], (small, large) => { let i = 0; for (const char of large) if (small[i] === char) i += 1; return i === small.length; }, "Return true if small is a subsequence of large."],
  ["Sorted Squares", "two-pointer", ["nums"], [[-4, -1, 0, 3, 10]], [[-7, -3, 2, 3, 11]], (nums) => nums.map((value) => value * value).sort((a, b) => a - b), "Return squares of sorted nums in sorted order."],
  ["Two Pointer Pair Exists", "two-pointer", ["nums", "target"], [[1, 2, 4, 6, 10], 8], [[1, 3, 5], 10], (nums, target) => { let left = 0, right = nums.length - 1; while (left < right) { const total = nums[left] + nums[right]; if (total === target) return true; if (total < target) left += 1; else right -= 1; } return false; }, "Return true if sorted nums contains two values that sum to target."],
  ["Shortest Word Ladder Step", "graph", ["edges", "start"], [[[ "a", "b" ], [ "b", "c" ], [ "a", "d" ]], "a"], [[[ "x", "y" ], [ "y", "z" ]], "x"], (edges, start) => { const seen = new Set([start]); const queue = [start]; for (let i = 0; i < queue.length; i += 1) for (const [a, b] of edges) { const next = a === queue[i] ? b : b === queue[i] ? a : null; if (next && !seen.has(next)) { seen.add(next); queue.push(next); } } return [...seen].sort(); }, "Return all graph nodes reachable from start in an undirected edge list.", "medium"],
];

algorithmTasks.forEach(([title, topic, params, sample, hidden, solve, statement, difficulty = "easy"]) => {
  addProblem({ title, topic, params, sample, hidden, solve, statement, difficulty });
});

const extraEasyConcepts = [
  ["Fizz Buzz List", "math", ["n"], [15], [8], (n) => Array.from({ length: n }, (_, i) => { const value = i + 1; return value % 15 === 0 ? "FizzBuzz" : value % 3 === 0 ? "Fizz" : value % 5 === 0 ? "Buzz" : String(value); }), "Return FizzBuzz labels from 1 through n."],
  ["Grade Letter", "math", ["score"], [87], [59], (score) => score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F", "Return a letter grade from a numeric score."],
  ["Temperature Label", "math", ["celsius"], [32], [10], (celsius) => celsius >= 30 ? "hot" : celsius >= 20 ? "warm" : celsius >= 10 ? "cool" : "cold", "Return a temperature label."],
  ["Leap Year Check", "math", ["year"], [2024], [2100], (year) => year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0), "Return true if year is a leap year."],
  ["Days In Month Simple", "math", ["month"], [2], [11], (month) => month === 2 ? 28 : [4, 6, 9, 11].includes(month) ? 30 : 31, "Return the number of days in a non-leap-year month."],
  ["Quarter Of Month", "math", ["month"], [5], [12], (month) => Math.ceil(month / 3), "Return the calendar quarter for month 1 through 12."],
  ["Tax Bracket Lite", "math", ["income"], [45000], [90000], (income) => income < 30000 ? "low" : income < 80000 ? "middle" : "high", "Return a simplified income bracket label."],
  ["Shipping Cost Lite", "math", ["weight"], [3], [11], (weight) => weight <= 1 ? 5 : weight <= 5 ? 10 : 20, "Return a simple shipping cost from package weight."],
  ["Password Strength Lite", "string", ["password"], ["abcD1234"], ["short"], (password) => password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password), "Return true if a password has length at least 8, an uppercase letter, and a digit."],
  ["Slugify Title", "string", ["title"], ["Hello Daily Code"], ["Anti Slop Practice"], (title) => title.toLowerCase().split(/\s+/).join("-"), "Convert a title to lowercase hyphenated slug text."],
  ["Markdown Link Text", "string", ["label", "url"], ["Docs", "https://example.com"], ["Home", "https://bayuuat.com"], (label, url) => `[${label}](${url})`, "Return a Markdown link from label and URL."],
  ["Repeat Separator Join", "string", ["items", "sep"], [["a", "b", "c"], "|"], [["x", "y"], "-"], (items, sep) => items.join(sep), "Join strings using sep."],
  ["Todo Completion Percent", "array", ["tasks"], [[true, false, true, true]], [[false, false]], (tasks) => Math.floor(tasks.filter(Boolean).length * 100 / tasks.length), "Return floor percent of completed tasks."],
  ["Boolean Majority", "array", ["votes"], [[true, false, true]], [[false, true, false, false]], (votes) => votes.filter(Boolean).length > votes.length / 2, "Return true if true values are a strict majority."],
  ["Leaderboard Names", "sorting", ["players"], [[{ name: "Ada", score: 5 }, { name: "Lin", score: 8 }]], [[{ name: "Bo", score: 3 }, { name: "Cy", score: 3 }]], (players) => [...players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).map((player) => player.name), "Return player names sorted by score descending, then name ascending."],
  ["Flatten Once", "array", ["nested"], [[[1, 2], [3], [4, 5]]], [[["a"], ["b", "c"]]], (nested) => nested.flat(), "Flatten one level of nested lists."],
  ["Transpose Pairs", "array", ["pairs"], [[[1, "a"], [2, "b"]]], [[["x", 9], ["y", 8]]], (pairs) => [pairs.map((pair) => pair[0]), pairs.map((pair) => pair[1])], "Turn a list of pairs into two parallel lists."],
  ["Pairwise Equality Mask", "array", ["first", "second"], [[1, 2, 3], [1, 0, 3]], [["a", "b"], ["a", "c"]], (first, second) => first.map((value, index) => value === second[index]), "Return booleans showing whether matching positions are equal."],
  ["Window Sums Size Two", "array", ["nums"], [[1, 2, 3, 4]], [[5, 5, 1]], (nums) => nums.slice(0, -1).map((value, index) => value + nums[index + 1]), "Return sums for every window of size two."],
  ["Window Maximums Size Three", "array", ["nums"], [[1, 3, 2, 5, 4]], [[9, 1, 2, 8]], (nums) => nums.slice(0, -2).map((_value, index) => Math.max(...nums.slice(index, index + 3))), "Return maximums for every window of size three."],
];

extraEasyConcepts.forEach(([title, topic, params, sample, hidden, solve, statement]) => {
  addProblem({ title, topic, params, sample, hidden, solve, statement });
});

const expandedArrayTasks = [
  ["Count Values Greater Than Limit", ["nums", "limit"], [[1, 7, 3, 9], 5], [[10, 2, 12], 9], (nums, limit) => nums.filter((value) => value > limit).length, "Return how many numbers are greater than limit."],
  ["Count Values At Most Limit", ["nums", "limit"], [[1, 7, 3, 9], 3], [[10, 2, 12], 9], (nums, limit) => nums.filter((value) => value <= limit).length, "Return how many numbers are less than or equal to limit."],
  ["Sum Inside Inclusive Range", ["nums", "low", "high"], [[1, 5, 7, 9], 4, 8], [[3, 6, 10], 1, 6], (nums, low, high) => sum(nums.filter((value) => value >= low && value <= high)), "Return the sum of values inside the inclusive range."],
  ["Count Outside Inclusive Range", ["nums", "low", "high"], [[1, 5, 7, 9], 4, 8], [[3, 6, 10], 1, 6], (nums, low, high) => nums.filter((value) => value < low || value > high).length, "Return how many values are outside the inclusive range."],
  ["Closest Value To Target", ["nums", "target"], [[1, 4, 8, 10], 7], [[-5, 2, 9], 4], (nums, target) => nums.reduce((best, value) => Math.abs(value - target) < Math.abs(best - target) ? value : best, nums[0]), "Return the value closest to target."],
  ["Index Of Closest Value", ["nums", "target"], [[1, 4, 8, 10], 7], [[-5, 2, 9], 4], (nums, target) => nums.reduce((best, value, index) => Math.abs(value - target) < Math.abs(nums[best] - target) ? index : best, 0), "Return the index of the value closest to target."],
  ["Range Width", ["nums"], [[4, 10, -2, 7]], [[8, 8, 3]], (nums) => Math.max(...nums) - Math.min(...nums), "Return max(nums) minus min(nums)."],
  ["Min Max Pair", ["nums"], [[4, 10, -2, 7]], [[8, 8, 3]], (nums) => [Math.min(...nums), Math.max(...nums)], "Return the smallest and largest value as a pair."],
  ["Distance Between Extremes", ["nums"], [[4, 10, -2, 7]], [[8, 1, 3, 9]], (nums) => Math.abs(nums.indexOf(Math.max(...nums)) - nums.indexOf(Math.min(...nums))), "Return the index distance between first minimum and first maximum."],
  ["Maximum Adjacent Gap", ["nums"], [[1, 7, 3, 12]], [[10, 6, 5]], (nums) => Math.max(...nums.slice(0, -1).map((value, index) => Math.abs(value - nums[index + 1]))), "Return the largest absolute difference between adjacent values."],
  ["Minimum Adjacent Gap", ["nums"], [[1, 7, 3, 12]], [[10, 6, 5]], (nums) => Math.min(...nums.slice(0, -1).map((value, index) => Math.abs(value - nums[index + 1]))), "Return the smallest absolute difference between adjacent values."],
  ["Left Right Difference Array", ["nums"], [[10, 4, 8, 3]], [[1, 2, 3]], (nums) => nums.map((_, index) => Math.abs(sum(nums.slice(0, index)) - sum(nums.slice(index + 1)))), "Return absolute difference between left sum and right sum at each index."],
  ["Product Except Self Small", ["nums"], [[1, 2, 3, 4]], [[2, 3, 5]], (nums) => nums.map((_, index) => product(nums.filter((_value, i) => i !== index))), "Return product of all values except self at each index."],
  ["Pair Count Target Sum", ["nums", "target"], [[1, 2, 3, 4], 5], [[2, 2, 2], 4], (nums, target) => { let count = 0; for (let i = 0; i < nums.length; i += 1) for (let j = i + 1; j < nums.length; j += 1) if (nums[i] + nums[j] === target) count += 1; return count; }, "Return how many index pairs sum to target."],
  ["Pair Count Same Parity", ["nums"], [[1, 2, 3, 4]], [[2, 4, 5]], (nums) => { let count = 0; for (let i = 0; i < nums.length; i += 1) for (let j = i + 1; j < nums.length; j += 1) if (Math.abs(nums[i] % 2) === Math.abs(nums[j] % 2)) count += 1; return count; }, "Return how many index pairs have the same parity."],
  ["Pair Count Different Parity", ["nums"], [[1, 2, 3, 4]], [[2, 4, 5]], (nums) => { let count = 0; for (let i = 0; i < nums.length; i += 1) for (let j = i + 1; j < nums.length; j += 1) if (Math.abs(nums[i] % 2) !== Math.abs(nums[j] % 2)) count += 1; return count; }, "Return how many index pairs have different parity."],
  ["Remove Every Kth Item", ["nums", "k"], [[1, 2, 3, 4, 5, 6], 3], [[9, 8, 7, 6], 2], (nums, k) => nums.filter((_value, index) => (index + 1) % k !== 0), "Return nums after removing every k-th item using 1-based positions."],
  ["Take Every Kth Item", ["nums", "k"], [[1, 2, 3, 4, 5, 6], 2], [[9, 8, 7, 6], 3], (nums, k) => nums.filter((_value, index) => (index + 1) % k === 0), "Return every k-th item using 1-based positions."],
  ["Pad Array To Length", ["nums", "length", "fill"], [[1, 2], 5, 0], [[9], 3, 7], (nums, length, fill) => [...nums, ...Array(Math.max(0, length - nums.length)).fill(fill)].slice(0, length), "Pad nums with fill until it reaches length, or truncate if already longer."],
  ["Repeat Values By Counts", ["values", "counts"], [["a", "b", "c"], [1, 3, 2]], [[2, 5], [2, 1]], (values, counts) => values.flatMap((value, index) => Array(counts[index]).fill(value)), "Repeat each value according to the matching count."],
  ["Expand Inclusive Ranges", ["ranges"], [[[1, 3], [5, 6]]], [[[2, 2], [4, 5]]], (ranges) => ranges.flatMap(([start, end]) => Array.from({ length: end - start + 1 }, (_, index) => start + index)), "Expand a list of inclusive integer ranges."],
  ["Compress Consecutive Ranges", ["nums"], [[1, 2, 3, 7, 8, 10]], [[4, 5, 9]], (nums) => { const result = []; for (const value of nums) { const last = result[result.length - 1]; if (!last || value !== last[1] + 1) result.push([value, value]); else last[1] = value; } return result; }, "Compress sorted integers into inclusive consecutive ranges.", "medium"],
  ["Is Mountain Array", ["nums"], [[1, 3, 5, 4, 2]], [[1, 2, 3]], (nums) => { const peak = nums.indexOf(Math.max(...nums)); return peak > 0 && peak < nums.length - 1 && nums.slice(1, peak + 1).every((value, index) => value > nums[index]) && nums.slice(peak + 1).every((value, index) => value < nums[peak + index]); }, "Return true if nums strictly rises to one peak then strictly falls."],
  ["Is Valley Array", ["nums"], [[5, 3, 1, 2, 4]], [[3, 2, 1]], (nums) => { const low = nums.indexOf(Math.min(...nums)); return low > 0 && low < nums.length - 1 && nums.slice(1, low + 1).every((value, index) => value < nums[index]) && nums.slice(low + 1).every((value, index) => value > nums[low + index]); }, "Return true if nums strictly falls to one valley then strictly rises."],
  ["Alternating Parity Check", ["nums"], [[1, 2, 3, 4]], [[1, 3, 2]], (nums) => nums.slice(1).every((value, index) => Math.abs(value % 2) !== Math.abs(nums[index] % 2)), "Return true if adjacent values alternate parity."],
  ["Can Split Equal Sum", ["nums"], [[1, 2, 3, 3]], [[2, 2, 2]], (nums) => nums.some((_value, index) => sum(nums.slice(0, index + 1)) === sum(nums.slice(index + 1))), "Return true if a split after some index gives equal left and right sums."],
  ["Longest Zero Streak", ["nums"], [[0, 0, 1, 0, 0, 0]], [[1, 2, 0]], (nums) => nums.reduce((state, value) => { const current = value === 0 ? state.current + 1 : 0; return { current, best: Math.max(state.best, current) }; }, { current: 0, best: 0 }).best, "Return the longest contiguous streak of zeroes."],
  ["Longest Positive Streak", ["nums"], [[1, 2, -1, 3, 4, 5]], [[-1, 2, 3, -2]], (nums) => nums.reduce((state, value) => { const current = value > 0 ? state.current + 1 : 0; return { current, best: Math.max(state.best, current) }; }, { current: 0, best: 0 }).best, "Return the longest contiguous streak of positive values."],
  ["Rank Values Dense", ["nums"], [[40, 10, 20, 20]], [[3, 3, 1]], (nums) => { const sorted = uniqueSorted(nums); return nums.map((value) => sorted.indexOf(value) + 1); }, "Return dense ranks of values, where the smallest distinct value has rank 1."],
  ["Normalize By Minimum", ["nums"], [[5, 7, 10]], [[3, 3, 8]], (nums) => { const min = Math.min(...nums); return nums.map((value) => value - min); }, "Subtract the minimum value from every number."],
];

expandedArrayTasks.forEach(([title, params, sample, hidden, solve, statement, difficulty = "easy"]) => {
  addProblem({ title, topic: "array", params, sample, hidden, solve, statement, difficulty });
});

const expandedStringTasks = [
  ["Count Exact Word", ["sentence", "target"], ["code daily code", "code"], ["one two one", "two"], (sentence, target) => sentence.split(" ").filter((word) => word === target).length, "Return how many words exactly equal target."],
  ["Replace Exact Word", ["sentence", "target", "replacement"], ["code daily code", "code", "ship"], ["one two one", "one", "1"], (sentence, target, replacement) => sentence.split(" ").map((word) => word === target ? replacement : word).join(" "), "Replace every word exactly equal to target."],
  ["Remove Exact Word", ["sentence", "target"], ["code daily code", "daily"], ["one two one", "one"], (sentence, target) => sentence.split(" ").filter((word) => word !== target).join(" "), "Remove every word exactly equal to target."],
  ["Count Words With Prefix", ["sentence", "prefix"], ["preheat prevent code", "pre"], ["alpha beta alpine", "al"], (sentence, prefix) => sentence.split(" ").filter((word) => word.startsWith(prefix)).length, "Return how many words start with prefix."],
  ["Count Words With Suffix", ["sentence", "suffix"], ["testing resting code", "ing"], ["runner walker maker", "er"], (sentence, suffix) => sentence.split(" ").filter((word) => word.endsWith(suffix)).length, "Return how many words end with suffix."],
  ["Filter Words Containing Letter", ["sentence", "letter"], ["code daily habit", "a"], ["swift ui view", "i"], (sentence, letter) => sentence.split(" ").filter((word) => word.includes(letter)), "Return words that contain letter."],
  ["Sort Words Alphabetically", ["sentence"], ["banana apple cherry"], ["dog ant cat"], (sentence) => sentence.split(" ").sort().join(" "), "Return the words sorted alphabetically."],
  ["Sort Words By Length", ["sentence"], ["bbb a cc"], ["four one three"], (sentence) => sentence.split(" ").sort((a, b) => a.length - b.length || a.localeCompare(b)).join(" "), "Return words sorted by length, then alphabetically."],
  ["Unique Words Preserving Order", ["sentence"], ["code daily code habit"], ["a b a c b"], (sentence) => sentence.split(" ").filter((word, index, words) => words.indexOf(word) === index), "Return first occurrences of words in order."],
  ["Duplicate Words Sorted", ["sentence"], ["code daily code habit daily"], ["a b a c"], (sentence) => [...new Set(sentence.split(" ").filter((word, _index, words) => words.indexOf(word) !== words.lastIndexOf(word)))].sort(), "Return sorted words that appear more than once."],
  ["Is Isogram", ["s"], ["background"], ["letter"], (s) => new Set([...s.toLowerCase()].filter((char) => /[a-z]/.test(char))).size === [...s.toLowerCase()].filter((char) => /[a-z]/.test(char)).length, "Return true if no letter repeats."],
  ["Count Bigrams", ["s"], ["banana"], ["aaaa"], (s) => { const result = {}; for (let i = 0; i < s.length - 1; i += 1) result[s.slice(i, i + 2)] = (result[s.slice(i, i + 2)] || 0) + 1; return result; }, "Return an object counting every adjacent two-character substring."],
  ["Most Common Starting Letter", ["sentence"], ["apple ant bee"], ["cat dog deer"], (sentence) => { const counts = sentence.split(" ").reduce((acc, word) => ({ ...acc, [word[0]]: (acc[word[0]] || 0) + 1 }), {}); return Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))[0]; }, "Return the most common first letter among words."],
  ["First N Characters", ["s", "n"], ["practice", 4], ["habit", 2], (s, n) => s.slice(0, n), "Return the first n characters."],
  ["Last N Characters", ["s", "n"], ["practice", 3], ["habit", 2], (s, n) => s.slice(-n), "Return the last n characters."],
  ["Drop First N Characters", ["s", "n"], ["practice", 3], ["habit", 2], (s, n) => s.slice(n), "Return s after dropping the first n characters."],
  ["Drop Last N Characters", ["s", "n"], ["practice", 3], ["habit", 2], (s, n) => s.slice(0, -n), "Return s after dropping the last n characters."],
  ["Pad Left With Character", ["s", "length", "fill"], ["42", 5, "0"], ["x", 3, "_"], (s, length, fill) => s.padStart(length, fill), "Pad s on the left with fill until it reaches length."],
  ["Pad Right With Character", ["s", "length", "fill"], ["42", 5, "0"], ["x", 3, "_"], (s, length, fill) => s.padEnd(length, fill), "Pad s on the right with fill until it reaches length."],
  ["Strip Matching Ends", ["s", "char"], ["---code---", "-"], ["***ok**", "*"], (s, char) => { while (s.startsWith(char)) s = s.slice(1); while (s.endsWith(char)) s = s.slice(0, -1); return s; }, "Remove char from both ends of s."],
  ["Substring Between Markers", ["s", "left", "right"], ["a[start]z", "[", "]"], ["x<core>y", "<", ">"], (s, left, right) => s.slice(s.indexOf(left) + left.length, s.indexOf(right, s.indexOf(left) + left.length)), "Return the substring between the first left marker and next right marker."],
  ["Count Overlapping Substring", ["s", "part"], ["aaaa", "aa"], ["banana", "ana"], (s, part) => { let count = 0; for (let i = 0; i <= s.length - part.length; i += 1) if (s.slice(i, i + part.length) === part) count += 1; return count; }, "Count overlapping occurrences of part in s."],
  ["Remove Overlapping Substring Once", ["s", "part"], ["banana", "ana"], ["aaaa", "aa"], (s, part) => s.replace(part, ""), "Remove the first occurrence of part from s."],
  ["Segment String By Size", ["s", "size"], ["abcdefg", 3], ["habit", 2], (s, size) => Array.from({ length: Math.ceil(s.length / size) }, (_, index) => s.slice(index * size, index * size + size)), "Split s into chunks of size characters."],
  ["Every Other Character", ["s"], ["abcdef"], ["practice"], (s) => [...s].filter((_char, index) => index % 2 === 0).join(""), "Return characters at even indices."],
  ["Characters Between Letters", ["s", "low", "high"], ["abcdef", "b", "e"], ["practice", "c", "t"], (s, low, high) => [...s].filter((char) => char >= low && char <= high).join(""), "Return characters alphabetically between low and high inclusive."],
  ["Keyboard Row Lite", ["word"], ["dad"], ["quiz"], (word) => ["qwertyuiop", "asdfghjkl", "zxcvbnm"].some((row) => [...word.toLowerCase()].every((char) => row.includes(char))), "Return true if all letters of word are on one keyboard row."],
  ["Morse Code Lite", ["word"], ["sos"], ["go"], (word) => { const map = { s: "...", o: "---", g: "--." }; return [...word].map((char) => map[char] || ".").join(" "); }, "Convert a small lowercase word to simple Morse tokens."],
  ["Binary String To Decimal", ["bits"], ["1011"], ["111"], (bits) => parseInt(bits, 2), "Convert a binary string to decimal."],
  ["Decimal To Binary String", ["n"], [11], [7], (n) => n.toString(2), "Convert a non-negative integer to a binary string."],
];

expandedStringTasks.forEach(([title, params, sample, hidden, solve, statement]) => {
  addProblem({ title, topic: "string", params, sample, hidden, solve, statement });
});

const rangeAndCoordinateTasks = [
  ["Count Multiples In Closed Range", "math", ["start", "end", "base"], [1, 20, 3], [5, 30, 5], (start, end, base) => Array.from({ length: end - start + 1 }, (_, index) => start + index).filter((value) => value % base === 0).length, "Return how many integers in a closed range are divisible by base."],
  ["Sum Multiples Below N", "math", ["n", "base"], [20, 3], [30, 5], (n, base) => sum(Array.from({ length: n - 1 }, (_, index) => index + 1).filter((value) => value % base === 0)), "Return the sum of positive multiples of base below n."],
  ["Inclusive Range List", "math", ["start", "end"], [3, 7], [-2, 2], (start, end) => Array.from({ length: end - start + 1 }, (_, index) => start + index), "Return all integers from start to end inclusive."],
  ["Exclusive Range List", "math", ["start", "end"], [3, 7], [-2, 2], (start, end) => Array.from({ length: Math.max(0, end - start - 1) }, (_, index) => start + 1 + index), "Return all integers strictly between start and end."],
  ["Range Intersection", "interval", ["first", "second"], [[1, 5], [3, 7]], [[1, 2], [4, 5]], (first, second) => Math.max(first[0], second[0]) <= Math.min(first[1], second[1]) ? [Math.max(first[0], second[0]), Math.min(first[1], second[1])] : [], "Return the intersection of two inclusive ranges."],
  ["Range Union If Touching", "interval", ["first", "second"], [[1, 5], [5, 9]], [[1, 2], [4, 5]], (first, second) => Math.max(first[0], second[0]) <= Math.min(first[1], second[1]) + 1 ? [Math.min(first[0], second[0]), Math.max(first[1], second[1])] : [], "Return the union of two ranges if they overlap or touch, otherwise empty list."],
  ["Manhattan Distance", "geometry", ["a", "b"], [[0, 0], [3, 4]], [[-1, 2], [4, -2]], (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]), "Return Manhattan distance between two points."],
  ["Chebyshev Distance", "geometry", ["a", "b"], [[0, 0], [3, 4]], [[-1, 2], [4, -2]], (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])), "Return Chebyshev distance between two points."],
  ["Path Manhattan Length", "geometry", ["points"], [[[0, 0], [3, 0], [3, 4]]], [[[1, 1], [2, 3], [5, 3]]], (points) => sum(points.slice(0, -1).map((point, index) => Math.abs(point[0] - points[index + 1][0]) + Math.abs(point[1] - points[index + 1][1]))), "Return the total Manhattan length of a path."],
  ["Bounding Box Area", "geometry", ["points"], [[[0, 0], [3, 4], [1, 2]]], [[[-1, 2], [4, -2]]], (points) => (Math.max(...points.map((p) => p[0])) - Math.min(...points.map((p) => p[0]))) * (Math.max(...points.map((p) => p[1])) - Math.min(...points.map((p) => p[1]))), "Return area of the axis-aligned bounding box around points."],
  ["Quadrant Label", "geometry", ["point"], [[3, 4]], [[-2, 5]], (point) => point[0] > 0 && point[1] > 0 ? "I" : point[0] < 0 && point[1] > 0 ? "II" : point[0] < 0 && point[1] < 0 ? "III" : point[0] > 0 && point[1] < 0 ? "IV" : "axis", "Return the Cartesian quadrant label for a point."],
  ["Move Point By Commands", "geometry", ["commands"], ["UURDDL"], ["RRU"], (commands) => [...commands].reduce(([x, y], command) => command === "U" ? [x, y + 1] : command === "D" ? [x, y - 1] : command === "R" ? [x + 1, y] : [x - 1, y], [0, 0]), "Start at origin and return final point after U, D, L, R commands."],
  ["Robot Returns To Origin", "geometry", ["commands"], ["UDLR"], ["UUD"], (commands) => { const [x, y] = [...commands].reduce(([cx, cy], command) => command === "U" ? [cx, cy + 1] : command === "D" ? [cx, cy - 1] : command === "R" ? [cx + 1, cy] : [cx - 1, cy], [0, 0]); return x === 0 && y === 0; }, "Return true if movement commands end at the origin."],
  ["Grid Target Coordinates", "matrix", ["grid", "target"], [[[1, 2], [3, 4]], 3], [[[5, 6, 7], [8, 9, 10]], 10], (grid, target) => { for (let r = 0; r < grid.length; r += 1) for (let c = 0; c < grid[r].length; c += 1) if (grid[r][c] === target) return [r, c]; return [-1, -1]; }, "Return row and column of target in a grid, or [-1, -1]."],
  ["Grid Neighbor Sum", "matrix", ["grid", "row", "col"], [[[1, 2, 3], [4, 5, 6]], 0, 1], [[[7, 8], [9, 10]], 1, 0], (grid, row, col) => [[1, 0], [-1, 0], [0, 1], [0, -1]].reduce((total, [dr, dc]) => total + (grid[row + dr]?.[col + dc] ?? 0), 0), "Return the sum of four-direction neighbors around a cell."],
  ["Grid Corner Values", "matrix", ["grid"], [[[1, 2, 3], [4, 5, 6]]], [[[7, 8], [9, 10], [11, 12]]], (grid) => [grid[0][0], grid[0][grid[0].length - 1], grid[grid.length - 1][0], grid[grid.length - 1][grid[0].length - 1]], "Return top-left, top-right, bottom-left, bottom-right values."],
  ["Grid Count Target", "matrix", ["grid", "target"], [[[1, 2], [2, 2]], 2], [[[3, 4], [5, 3]], 3], (grid, target) => grid.flat().filter((value) => value === target).length, "Return how many cells equal target."],
  ["Grid Replace Target", "matrix", ["grid", "target", "replacement"], [[[1, 2], [2, 3]], 2, 9], [[[4, 5], [4, 6]], 4, 0], (grid, target, replacement) => grid.map((row) => row.map((value) => value === target ? replacement : value)), "Replace every target cell with replacement."],
  ["Grid Row Of Target", "matrix", ["grid", "target"], [[[1, 2], [3, 4]], 4], [[[5, 6], [7, 8]], 5], (grid, target) => grid.findIndex((row) => row.includes(target)), "Return the row index containing target, or -1."],
  ["Grid Column Of Target", "matrix", ["grid", "target"], [[[1, 2], [3, 4]], 4], [[[5, 6], [7, 8]], 5], (grid, target) => { for (let c = 0; c < grid[0].length; c += 1) if (grid.some((row) => row[c] === target)) return c; return -1; }, "Return the column index containing target, or -1."],
];

rangeAndCoordinateTasks.forEach(([title, topic, params, sample, hidden, solve, statement]) => {
  addProblem({ title, topic, params, sample, hidden, solve, statement });
});

const recordAndSetTasks = [
  ["Set Difference Sorted", "set", ["first", "second"], [[1, 2, 3, 4], [2, 4]], [[5, 6, 7], [6]], (first, second) => uniqueSorted(first.filter((value) => !second.includes(value))), "Return sorted distinct values in first but not second."],
  ["Set Equality Check", "set", ["first", "second"], [[1, 2, 2], [2, 1]], [[1, 2], [1, 3]], (first, second) => { const a = uniqueSorted(first); const b = uniqueSorted(second); return asJson(a) === asJson(b); }, "Return true if two arrays have the same distinct values."],
  ["Subset Check", "set", ["small", "large"], [[1, 3], [1, 2, 3]], [[1, 4], [1, 2, 3]], (small, large) => small.every((value) => large.includes(value)), "Return true if every value in small appears in large."],
  ["Disjoint Check", "set", ["first", "second"], [[1, 2], [3, 4]], [[1, 2], [2, 3]], (first, second) => first.every((value) => !second.includes(value)), "Return true if arrays share no values."],
  ["Jaccard Percent Floor", "set", ["first", "second"], [[1, 2, 3], [2, 3, 4]], [[1, 2], [3, 4]], (first, second) => { const a = new Set(first); const b = new Set(second); const inter = [...a].filter((value) => b.has(value)).length; const union = new Set([...first, ...second]).size; return Math.floor(inter * 100 / union); }, "Return floor Jaccard similarity percent between distinct value sets."],
  ["Cart Total Price", "records", ["items"], [[{ price: 10, qty: 2 }, { price: 5, qty: 3 }]], [[{ price: 7, qty: 1 }, { price: 2, qty: 4 }]], (items) => sum(items.map((item) => item.price * item.qty)), "Return total cart price from price and qty fields."],
  ["Cart Expensive Names", "records", ["items", "limit"], [[{ name: "a", price: 10 }, { name: "b", price: 4 }], 5], [[{ name: "x", price: 2 }, { name: "y", price: 9 }], 3], (items, limit) => items.filter((item) => item.price > limit).map((item) => item.name), "Return names of items whose price is greater than limit."],
  ["Events By Day", "records", ["events"], [[{ day: "Mon", name: "a" }, { day: "Tue", name: "b" }, { day: "Mon", name: "c" }]], [[{ day: "Fri", name: "x" }]], (events) => events.reduce((acc, event) => ({ ...acc, [event.day]: [...(acc[event.day] || []), event.name] }), {}), "Group event names by day."],
  ["Latest Event Name", "records", ["events"], [[{ name: "a", time: 10 }, { name: "b", time: 15 }]], [[{ name: "x", time: 1 }, { name: "y", time: 0 }]], (events) => events.reduce((best, event) => event.time > best.time ? event : best).name, "Return the name of the event with the largest time."],
  ["Habit Completion Names", "records", ["habits"], [[{ name: "read", done: true }, { name: "run", done: false }]], [[{ name: "code", done: true }, { name: "sleep", done: true }]], (habits) => habits.filter((habit) => habit.done).map((habit) => habit.name), "Return names of completed habits."],
  ["Habit Completion Ratio Floor", "records", ["habits"], [[{ done: true }, { done: false }, { done: true }]], [[{ done: false }, { done: false }]], (habits) => Math.floor(habits.filter((habit) => habit.done).length * 100 / habits.length), "Return floor completion percent from habit records."],
  ["Merge User Preferences", "records", ["defaults", "overrides"], [{ theme: "light", font: "small" }, { font: "large" }], [{ a: 1, b: 2 }, { b: 3, c: 4 }], (defaults, overrides) => ({ ...defaults, ...overrides }), "Return preferences after overrides replace default keys."],
  ["Count Records By Status", "records", ["records"], [[{ status: "open" }, { status: "done" }, { status: "open" }]], [[{ status: "new" }, { status: "new" }]], (records) => records.reduce((acc, record) => ({ ...acc, [record.status]: (acc[record.status] || 0) + 1 }), {}), "Return an object counting records by status."],
  ["Names Sorted By Age", "records", ["people"], [[{ name: "Ana", age: 30 }, { name: "Bo", age: 20 }]], [[{ name: "Cy", age: 5 }, { name: "Dee", age: 7 }]], (people) => [...people].sort((a, b) => a.age - b.age || a.name.localeCompare(b.name)).map((person) => person.name), "Return names sorted by age ascending."],
  ["Oldest Person Name", "records", ["people"], [[{ name: "Ana", age: 30 }, { name: "Bo", age: 20 }]], [[{ name: "Cy", age: 5 }, { name: "Dee", age: 7 }]], (people) => people.reduce((best, person) => person.age > best.age ? person : best).name, "Return the name of the oldest person."],
  ["Youngest Person Name", "records", ["people"], [[{ name: "Ana", age: 30 }, { name: "Bo", age: 20 }]], [[{ name: "Cy", age: 5 }, { name: "Dee", age: 7 }]], (people) => people.reduce((best, person) => person.age < best.age ? person : best).name, "Return the name of the youngest person."],
  ["Tag Usage Count", "records", ["posts"], [[{ tags: ["js", "web"] }, { tags: ["js"] }]], [[{ tags: ["ios"] }, { tags: ["ios", "swift"] }]], (posts) => posts.flatMap((post) => post.tags).reduce((acc, tag) => ({ ...acc, [tag]: (acc[tag] || 0) + 1 }), {}), "Return an object counting tag usage across posts."],
  ["Posts With Tag", "records", ["posts", "tag"], [[{ id: 1, tags: ["js"] }, { id: 2, tags: ["web"] }], "js"], [[{ id: 5, tags: ["ios", "swift"] }], "swift"], (posts, tag) => posts.filter((post) => post.tags.includes(tag)).map((post) => post.id), "Return ids of posts that contain tag."],
  ["Flatten Record Values", "records", ["obj"], [{ a: [1, 2], b: [3] }], [{ x: ["a"], y: ["b", "c"] }], (obj) => Object.keys(obj).sort().flatMap((key) => obj[key]), "Return concatenated array values from object keys sorted alphabetically."],
  ["Object Key Lengths", "records", ["obj"], [{ apple: 1, pear: 2 }], [{ x: 9, long: 1 }], (obj) => Object.keys(obj).sort().map((key) => key.length), "Return lengths of object keys sorted alphabetically."],
];

recordAndSetTasks.forEach(([title, topic, params, sample, hidden, solve, statement]) => {
  addProblem({ title, topic, params, sample, hidden, solve, statement });
});

const finalConceptTasks = [
  ["Sliding Window Sum Size K", "array", ["nums", "k"], [[1, 2, 3, 4, 5], 3], [[5, 1, 2, 1], 2], (nums, k) => nums.slice(0, nums.length - k + 1).map((_value, index) => sum(nums.slice(index, index + k))), "Return sums of every contiguous window of size k."],
  ["Sliding Window Max Size K", "array", ["nums", "k"], [[1, 3, 2, 5, 4], 3], [[5, 1, 2, 1], 2], (nums, k) => nums.slice(0, nums.length - k + 1).map((_value, index) => Math.max(...nums.slice(index, index + k))), "Return maximum values of every contiguous window of size k.", "medium"],
  ["Prefix Contains Target", "array", ["nums", "target"], [[1, 2, 3], 2], [[4, 5], 1], (nums, target) => nums.map((_value, index) => nums.slice(0, index + 1).includes(target)), "Return whether each prefix contains target."],
  ["Suffix Contains Target", "array", ["nums", "target"], [[1, 2, 3], 2], [[4, 5], 1], (nums, target) => nums.map((_value, index) => nums.slice(index).includes(target)), "Return whether each suffix contains target."],
  ["First Prefix Sum Above Target", "array", ["nums", "target"], [[2, 3, 5], 4], [[1, 1, 1], 5], (nums, target) => nums.findIndex((_value, index) => sum(nums.slice(0, index + 1)) > target), "Return the first index where prefix sum is greater than target."],
  ["Smallest Missing Positive", "array", ["nums"], [[3, 4, -1, 1]], [[1, 2, 0]], (nums) => { let value = 1; while (nums.includes(value)) value += 1; return value; }, "Return the smallest missing positive integer.", "medium"],
  ["Count Distinct In Windows", "array", ["nums", "k"], [[1, 2, 1, 3, 4], 3], [[1, 1, 2], 2], (nums, k) => nums.slice(0, nums.length - k + 1).map((_value, index) => new Set(nums.slice(index, index + k)).size), "Return distinct counts for each window of size k.", "medium"],
  ["Maximum Subarray Length With Sum", "array", ["nums", "target"], [[1, 2, 1, 1, 1], 3], [[2, 2, 2], 4], (nums, target) => { let best = 0; for (let i = 0; i < nums.length; i += 1) for (let j = i; j < nums.length; j += 1) if (sum(nums.slice(i, j + 1)) === target) best = Math.max(best, j - i + 1); return best; }, "Return the longest contiguous subarray length whose sum equals target.", "medium"],
  ["Minimum Subarray Length At Least Target", "array", ["nums", "target"], [[2, 3, 1, 2, 4, 3], 7], [[1, 4, 4], 4], (nums, target) => { let best = Infinity; for (let i = 0; i < nums.length; i += 1) for (let j = i; j < nums.length; j += 1) if (sum(nums.slice(i, j + 1)) >= target) best = Math.min(best, j - i + 1); return best === Infinity ? 0 : best; }, "Return the shortest contiguous subarray length with sum at least target.", "medium"],
  ["Permutations Of Three", "recursion", ["items"], [[1, 2, 3]], [["a", "b", "c"]], (items) => items.flatMap((a, i) => items.filter((_b, j) => j !== i).flatMap((b, j2, rest) => rest.filter((_c, k) => k !== j2).map((c) => [a, b, c]))), "Return all permutations of exactly three items.", "medium"],
  ["Subsets Of Three", "recursion", ["items"], [[1, 2, 3]], [["a", "b", "c"]], (items) => [[], [items[0]], [items[1]], [items[2]], [items[0], items[1]], [items[0], items[2]], [items[1], items[2]], items], "Return all subsets of exactly three items.", "medium"],
  ["Grid Flood Fill Count", "graph", ["grid", "row", "col"], [[["1", "1", "0"], ["0", "1", "0"]], 0, 0], [[["1", "0"], ["0", "1"]], 1, 1], (grid, row, col) => { const target = grid[row][col]; const seen = new Set(); const stack = [[row, col]]; while (stack.length) { const [r, c] = stack.pop(); const key = `${r},${c}`; if (seen.has(key) || grid[r]?.[c] !== target) continue; seen.add(key); stack.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]); } return seen.size; }, "Return the size of the connected component containing a grid cell.", "medium"],
  ["Island Count Small Grid", "graph", ["grid"], [[["1", "1", "0"], ["0", "1", "0"], ["1", "0", "1"]]], [[["1", "0"], ["0", "1"]]], (grid) => { const seen = new Set(); let islands = 0; for (let r = 0; r < grid.length; r += 1) for (let c = 0; c < grid[r].length; c += 1) { const start = `${r},${c}`; if (grid[r][c] !== "1" || seen.has(start)) continue; islands += 1; const stack = [[r, c]]; while (stack.length) { const [cr, cc] = stack.pop(); const key = `${cr},${cc}`; if (seen.has(key) || grid[cr]?.[cc] !== "1") continue; seen.add(key); stack.push([cr + 1, cc], [cr - 1, cc], [cr, cc + 1], [cr, cc - 1]); } } return islands; }, "Return how many four-direction islands of '1' cells exist.", "medium"],
  ["Top K Frequent Values", "hash-map", ["nums", "k"], [[1, 1, 1, 2, 2, 3], 2], [[4, 4, 5, 6, 6], 1], (nums, k) => { const counts = nums.reduce((acc, value) => ({ ...acc, [value]: (acc[value] || 0) + 1 }), {}); return Object.keys(counts).map(Number).sort((a, b) => counts[b] - counts[a] || a - b).slice(0, k); }, "Return the k most frequent values, breaking ties by smaller value.", "medium"],
  ["Character Replacement Budget", "string", ["s", "k"], ["ABAB", 2], ["AABABBA", 1], (s, k) => { let best = 0; for (let i = 0; i < s.length; i += 1) for (let j = i; j < s.length; j += 1) { const part = s.slice(i, j + 1); const counts = [...part].reduce((acc, char) => ({ ...acc, [char]: (acc[char] || 0) + 1 }), {}); if (part.length - Math.max(...Object.values(counts)) <= k) best = Math.max(best, part.length); } return best; }, "Return the longest substring length that can become one repeated character with at most k replacements.", "hard"],
  ["Longest Palindromic Substring Lite", "string", ["s"], ["babad"], ["cbbd"], (s) => { let best = ""; for (let i = 0; i < s.length; i += 1) for (let j = i; j < s.length; j += 1) { const part = s.slice(i, j + 1); if (part.length > best.length && part === [...part].reverse().join("")) best = part; } return best; }, "Return the longest palindromic substring; if tied, return the earliest one.", "medium"],
  ["Edit Distance Tiny", "dp", ["first", "second"], ["horse", "ros"], ["kitten", "sitting"], (first, second) => { const dp = Array.from({ length: first.length + 1 }, () => Array(second.length + 1).fill(0)); for (let i = 0; i <= first.length; i += 1) dp[i][0] = i; for (let j = 0; j <= second.length; j += 1) dp[0][j] = j; for (let i = 1; i <= first.length; i += 1) for (let j = 1; j <= second.length; j += 1) dp[i][j] = first[i - 1] === second[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]); return dp[first.length][second.length]; }, "Return Levenshtein edit distance between two short strings.", "hard"],
  ["Knapsack Tiny Capacity", "dp", ["weights", "values", "capacity"], [[2, 3, 4], [4, 5, 6], 5], [[1, 2, 3], [6, 10, 12], 5], (weights, values, capacity) => { const dp = Array(capacity + 1).fill(0); for (let i = 0; i < weights.length; i += 1) for (let cap = capacity; cap >= weights[i]; cap -= 1) dp[cap] = Math.max(dp[cap], dp[cap - weights[i]] + values[i]); return dp[capacity]; }, "Return maximum value for a small 0/1 knapsack.", "hard"],
  ["Balanced Partition Difference", "dp", ["nums"], [[1, 6, 11, 5]], [[3, 1, 4, 2, 2]], (nums) => { const total = sum(nums); const possible = new Set([0]); for (const value of nums) for (const prev of [...possible]) possible.add(prev + value); return Math.min(...[...possible].map((value) => Math.abs(total - 2 * value))); }, "Return the minimum difference between two subset sums.", "hard"],
  ["Word Break Lite", "dp", ["s", "words"], ["leetcode", ["leet", "code"]], ["applepenapple", ["apple", "pen"]], (s, words) => { const dp = Array(s.length + 1).fill(false); dp[0] = true; for (let i = 1; i <= s.length; i += 1) dp[i] = words.some((word) => i >= word.length && dp[i - word.length] && s.slice(i - word.length, i) === word); return dp[s.length]; }, "Return true if s can be segmented into dictionary words.", "medium"],
];

finalConceptTasks.forEach(([title, topic, params, sample, hidden, solve, statement, difficulty = "easy"]) => {
  addProblem({ title, topic, params, sample, hidden, solve, statement, difficulty });
});

const finishingTasks = [
  ["Clamp Single Number", "math", ["value", "low", "high"], [15, 0, 10], [-3, 0, 10], (value, low, high) => Math.max(low, Math.min(high, value)), "Clamp one number to an inclusive range."],
  ["Wrap Index Into Length", "math", ["index", "length"], [7, 5], [-1, 5], (index, length) => ((index % length) + length) % length, "Wrap an index into the valid range for length."],
  ["Ceiling Division", "math", ["a", "b"], [10, 3], [20, 5], (a, b) => Math.ceil(a / b), "Return a divided by b rounded up."],
  ["Percent Increase Floor", "math", ["oldValue", "newValue"], [80, 100], [50, 65], (oldValue, newValue) => Math.floor((newValue - oldValue) * 100 / oldValue), "Return floor percent increase from oldValue to newValue."],
  ["Harshad Number Check", "math", ["n"], [18], [19], (n) => n % sum([...String(n)].map(Number)) === 0, "Return true if n is divisible by the sum of its digits."],
  ["Sum Of Squares Up To N", "math", ["n"], [4], [6], (n) => sum(Array.from({ length: n }, (_, index) => (index + 1) ** 2)), "Return 1^2 + 2^2 + ... + n^2."],
  ["Count Perfect Squares Up To N", "math", ["n"], [20], [50], (n) => Math.floor(Math.sqrt(n)), "Return how many perfect squares are less than or equal to n."],
  ["Modulo Distance Clockwise", "math", ["start", "end", "mod"], [10, 2, 12], [3, 8, 10], (start, end, mod) => (end - start + mod) % mod, "Return clockwise modular distance from start to end."],
  ["Opposite Number On Clock", "math", ["hour"], [3], [12], (hour) => ((hour + 5) % 12) + 1, "Return the hour opposite hour on a 12-hour clock."],
  ["Weekday Shift", "math", ["weekday", "days"], [2, 5], [6, 3], (weekday, days) => (weekday + days) % 7, "Return weekday index after adding days."],
  ["Weekend Index Check", "math", ["weekday"], [6], [2], (weekday) => weekday === 0 || weekday === 6, "Return true if weekday index is Sunday or Saturday."],
  ["Seconds To Minute Pair", "math", ["seconds"], [125], [59], (seconds) => [Math.floor(seconds / 60), seconds % 60], "Convert seconds to [minutes, seconds]."],
  ["Minute Pair To Seconds", "math", ["minutes", "seconds"], [2, 5], [0, 59], (minutes, seconds) => minutes * 60 + seconds, "Convert minutes and seconds to total seconds."],
  ["Count True Values", "array", ["flags"], [[true, false, true]], [[false, false]], (flags) => flags.filter(Boolean).length, "Return how many booleans are true."],
  ["Count False Values", "array", ["flags"], [[true, false, true]], [[false, false]], (flags) => flags.filter((flag) => !flag).length, "Return how many booleans are false."],
  ["Invert Boolean List", "array", ["flags"], [[true, false, true]], [[false, false]], (flags) => flags.map((flag) => !flag), "Return every boolean inverted."],
  ["Prefix All True", "array", ["flags"], [[true, true, false, true]], [[true, true]], (flags) => flags.map((_flag, index) => flags.slice(0, index + 1).every(Boolean)), "Return whether each prefix contains only true values."],
  ["Prefix Any True", "array", ["flags"], [[false, false, true]], [[false, false]], (flags) => flags.map((_flag, index) => flags.slice(0, index + 1).some(Boolean)), "Return whether each prefix contains any true value."],
  ["Boolean Run Count", "array", ["flags"], [[true, true, false, true, false, false]], [[false, false, false]], (flags) => flags.filter((flag, index) => index === 0 || flag !== flags[index - 1]).length, "Return how many contiguous boolean runs exist."],
  ["Longest True Run", "array", ["flags"], [[true, true, false, true]], [[false, true, true, true]], (flags) => flags.reduce((state, flag) => { const current = flag ? state.current + 1 : 0; return { current, best: Math.max(state.best, current) }; }, { current: 0, best: 0 }).best, "Return the longest contiguous run of true values."],
  ["Toggle Indices", "array", ["flags", "indices"], [[true, false, false], [0, 2]], [[false, false], [1]], (flags, indices) => flags.map((flag, index) => indices.includes(index) ? !flag : flag), "Toggle booleans whose indices appear in indices."],
  ["Truthy Indices", "array", ["flags"], [[true, false, true]], [[false, true]], (flags) => flags.flatMap((flag, index) => flag ? [index] : []), "Return indices of true values."],
  ["File Extension", "string", ["filename"], ["report.pdf"], ["archive.tar.gz"], (filename) => filename.includes(".") ? filename.split(".").pop() : "", "Return the file extension after the last dot."],
  ["File Base Name", "string", ["filename"], ["report.pdf"], ["archive.tar.gz"], (filename) => filename.includes(".") ? filename.split(".").slice(0, -1).join(".") : filename, "Return the filename without the last extension."],
  ["Path Directory", "string", ["pathText"], ["/app/data/problems.json"], ["/tmp/file.txt"], (pathText) => pathText.split("/").slice(0, -1).join("/") || "/", "Return the directory portion of a slash path."],
  ["Path File Name", "string", ["pathText"], ["/app/data/problems.json"], ["/tmp/file.txt"], (pathText) => pathText.split("/").pop(), "Return the final filename portion of a slash path."],
  ["Url Protocol", "string", ["url"], ["https://bayuuat.com/path"], ["http://localhost:3000"], (url) => url.split("://")[0], "Return the protocol before ://."],
  ["Url Host Lite", "string", ["url"], ["https://bayuuat.com/path"], ["http://localhost:3000/a"], (url) => url.split("://")[1].split("/")[0], "Return the host from a simple URL."],
  ["Query Parameter Count", "string", ["url"], ["https://x.test?a=1&b=2"], ["https://x.test"], (url) => url.includes("?") ? url.split("?")[1].split("&").filter(Boolean).length : 0, "Return how many query parameters a simple URL has."],
  ["Ip Address Segment Count", "string", ["ip"], ["192.168.1.1"], ["127.0.0.1"], (ip) => ip.split(".").length, "Return how many dot-separated segments an IP-like string has."],
  ["Valid IPv4 Lite", "string", ["ip"], ["192.168.1.1"], ["999.1.1.1"], (ip) => { const parts = ip.split("."); return parts.length === 4 && parts.every((part) => /^\d+$/.test(part) && Number(part) >= 0 && Number(part) <= 255); }, "Return true if an IPv4-like string has four numeric segments from 0 to 255."],
  ["Sentence Count Lite", "string", ["text"], ["Hi. Bye! Ok?"], ["No punctuation"], (text) => [...text].filter((char) => ".!?".includes(char)).length || (text ? 1 : 0), "Return a simple sentence count using . ! ? punctuation."],
  ["Repeat String Count", "string", ["s", "count"], ["ha", 3], ["go", 2], (s, count) => s.repeat(count), "Return s repeated count times."],
  ["Surround With Brackets", "string", ["s"], ["code"], ["ok"], (s) => `[${s}]`, "Return s surrounded by square brackets."],
  ["Trim Prefix If Present", "string", ["s", "prefix"], ["unhappy", "un"], ["redo", "pre"], (s, prefix) => s.startsWith(prefix) ? s.slice(prefix.length) : s, "Remove prefix only when s starts with it."],
  ["Trim Suffix If Present", "string", ["s", "suffix"], ["tested", "ed"], ["runner", "ing"], (s, suffix) => s.endsWith(suffix) ? s.slice(0, -suffix.length) : s, "Remove suffix only when s ends with it."],
  ["Tic Tac Toe Row Winner", "game", ["board"], [[["X", "X", "X"], ["O", "", "O"], ["", "", ""]]], [[["X", "O", "X"], ["O", "X", "O"], ["O", "X", "O"]]], (board) => board.find((row) => row[0] && row.every((cell) => cell === row[0]))?.[0] || "", "Return the mark that wins on a row, or empty string."],
  ["Tic Tac Toe Column Winner", "game", ["board"], [[["X", "O", ""], ["X", "O", ""], ["", "O", "X"]]], [[["X", "O", "X"], ["O", "X", "O"], ["O", "X", "O"]]], (board) => { for (let c = 0; c < 3; c += 1) if (board[0][c] && board.every((row) => row[c] === board[0][c])) return board[0][c]; return ""; }, "Return the mark that wins on a column, or empty string."],
  ["Chessboard Square Color", "game", ["square"], ["a1"], ["h3"], (square) => ((square.charCodeAt(0) - 97) + (Number(square[1]) - 1)) % 2 === 0 ? "dark" : "light", "Return dark or light for a chessboard square."],
  ["Minesweeper Neighbor Mines", "game", ["grid", "row", "col"], [[["*", "."], [".", "*"]], 0, 1], [[[".", "*", "."], [".", ".", "*"]], 1, 1], (grid, row, col) => { let count = 0; for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) if ((dr || dc) && grid[row + dr]?.[col + dc] === "*") count += 1; return count; }, "Return how many neighboring cells contain mines."],
  ["Dice Roll Ways", "math", ["target"], [7], [3], (target) => { let count = 0; for (let a = 1; a <= 6; a += 1) for (let b = 1; b <= 6; b += 1) if (a + b === target) count += 1; return count; }, "Return how many two-dice rolls sum to target."],
  ["Card Rank Value Lite", "game", ["rank"], ["A"], ["7"], (rank) => ({ A: 14, K: 13, Q: 12, J: 11 })[rank] || Number(rank), "Return a simple card rank value."],
  ["Rock Paper Scissors Result", "game", ["mine", "theirs"], ["rock", "scissors"], ["paper", "scissors"], (mine, theirs) => mine === theirs ? "draw" : (mine === "rock" && theirs === "scissors") || (mine === "paper" && theirs === "rock") || (mine === "scissors" && theirs === "paper") ? "win" : "lose", "Return win, lose, or draw for rock-paper-scissors."],
  ["Scoreboard Winner", "records", ["scores"], [{ Ada: 10, Lin: 12, Bo: 12 }], [{ X: 1, Y: 2 }], (scores) => Object.keys(scores).sort((a, b) => scores[b] - scores[a] || a.localeCompare(b))[0], "Return the winning name from a score object, breaking ties alphabetically."],
  ["Scoreboard Sorted Names", "records", ["scores"], [{ Ada: 10, Lin: 12, Bo: 12 }], [{ X: 1, Y: 2 }], (scores) => Object.keys(scores).sort((a, b) => scores[b] - scores[a] || a.localeCompare(b)), "Return names sorted by score descending, then alphabetically."],
  ["Budget Remaining", "records", ["budget", "expenses"], [100, [{ amount: 10 }, { amount: 25 }]], [50, [{ amount: 5 }, { amount: 15 }]], (budget, expenses) => budget - sum(expenses.map((expense) => expense.amount)), "Return budget after subtracting expenses."],
  ["Expenses By Category", "records", ["expenses"], [[{ category: "food", amount: 10 }, { category: "food", amount: 5 }, { category: "tools", amount: 7 }]], [[{ category: "a", amount: 1 }]], (expenses) => expenses.reduce((acc, expense) => ({ ...acc, [expense.category]: (acc[expense.category] || 0) + expense.amount }), {}), "Return total expense amount by category."],
  ["Largest Category Expense", "records", ["expenses"], [[{ category: "food", amount: 10 }, { category: "tools", amount: 20 }]], [[{ category: "a", amount: 1 }, { category: "b", amount: 1 }]], (expenses) => expenses.reduce((best, expense) => expense.amount > best.amount ? expense : best).category, "Return category of the largest single expense."],
  ["Calendar Busy Days", "records", ["events"], [[{ day: "Mon" }, { day: "Wed" }, { day: "Mon" }]], [[{ day: "Fri" }]], (events) => [...new Set(events.map((event) => event.day))].sort(), "Return sorted distinct days that have events."],
  ["Calendar Free Weekdays", "records", ["events"], [[{ day: "Mon" }, { day: "Wed" }]], [[{ day: "Fri" }]], (events) => ["Mon", "Tue", "Wed", "Thu", "Fri"].filter((day) => !events.some((event) => event.day === day)), "Return weekdays with no events."],
  ["Build Query String", "records", ["params"], [{ a: "1", b: "two" }], [{ q: "code" }], (params) => Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join("&"), "Build a query string from object keys sorted alphabetically."],
  ["Parse Query String Lite", "records", ["query"], ["a=1&b=two"], ["q=code"], (query) => Object.fromEntries(query.split("&").map((pair) => pair.split("="))), "Parse a simple query string into an object."],
  ["Phone Number Mask", "string", ["phone"], ["1234567890"], ["5551234"], (phone) => "*".repeat(Math.max(0, phone.length - 4)) + phone.slice(-4), "Mask all but the final four phone digits."],
  ["Credit Card Last Four", "string", ["card"], ["1234-5678-0000-9999"], ["1111222233334444"], (card) => card.replace(/-/g, "").slice(-4), "Return the last four digits of a card-like string."],
  ["Hex Color Invert Lite", "string", ["hex"], ["#000000"], ["#ffffff"], (hex) => `#${(0xffffff - parseInt(hex.slice(1), 16)).toString(16).padStart(6, "0")}`, "Invert a six-digit hex color."],
  ["Rgb To Hex Lite", "string", ["rgb"], [[255, 0, 16]], [[0, 128, 255]], (rgb) => `#${rgb.map((value) => value.toString(16).padStart(2, "0")).join("")}`, "Convert RGB integer values to a hex color string."],
  ["Hex To Rgb Lite", "string", ["hex"], ["#ff0010"], ["#0080ff"], (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)], "Convert a six-digit hex color to RGB integer values."],
  ["Markdown Heading Level", "string", ["line"], ["### Title"], ["# Main"], (line) => line.match(/^#+/)?.[0].length || 0, "Return heading level from a Markdown heading line."],
  ["Markdown Checklist Done", "string", ["line"], ["- [x] Ship"], ["- [ ] Plan"], (line) => line.includes("[x]"), "Return true if a Markdown checklist line is checked."],
  ["Json Pointer Segments", "string", ["pointer"], ["/a/b/c"], ["/data/items/0"], (pointer) => pointer.split("/").filter(Boolean), "Split a JSON pointer into path segments."],
  ["Semver Major", "string", ["version"], ["14.2.0"], ["1.0.5"], (version) => Number(version.split(".")[0]), "Return the major number from a semantic version string."],
  ["Semver Compare Major Minor", "string", ["first", "second"], ["1.2.0", "1.3.0"], ["2.0.0", "1.9.9"], (first, second) => { const [a1, a2] = first.split(".").map(Number); const [b1, b2] = second.split(".").map(Number); return a1 === b1 ? Math.sign(a2 - b2) : Math.sign(a1 - b1); }, "Compare semantic versions using major and minor only; return -1, 0, or 1."],
  ["Package Scope Name", "string", ["packageName"], ["@scope/pkg"], ["plain"], (packageName) => packageName.startsWith("@") ? packageName.split("/")[0].slice(1) : "", "Return the npm scope without @, or empty string when unscoped."],
  ["Package Bare Name", "string", ["packageName"], ["@scope/pkg"], ["plain"], (packageName) => packageName.includes("/") ? packageName.split("/")[1] : packageName, "Return the package name without scope."],
  ["Css Class Toggle", "string", ["classText", "name"], ["btn active large", "active"], ["btn large", "active"], (classText, name) => { const classes = classText.split(" ").filter(Boolean); return classes.includes(name) ? classes.filter((item) => item !== name).join(" ") : [...classes, name].join(" "); }, "Toggle one CSS class name in a space-separated class string."],
  ["Css Class Contains", "string", ["classText", "name"], ["btn active large", "active"], ["btn large", "active"], (classText, name) => classText.split(" ").includes(name), "Return true if a space-separated class string contains name."],
  ["Html Tag Name Lite", "string", ["html"], ["<button disabled>Ok</button>"], ["<div>Hi</div>"], (html) => html.slice(1).split(/[ >]/)[0], "Return the opening HTML tag name from a simple tag string."],
  ["Csv Row To Object", "records", ["headers", "row"], [["name", "age"], ["Ada", "30"]], [["city", "zip"], ["Jakarta", "10110"]], (headers, row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])), "Build an object from CSV headers and one row."],
  ["Csv Object To Row", "records", ["headers", "obj"], [["name", "age"], { name: "Ada", age: "30" }], [["city", "zip"], { city: "Jakarta", zip: "10110" }], (headers, obj) => headers.map((header) => obj[header]), "Build a CSV row from headers and an object."],
  ["Sparse Vector Dot Product", "hash-map", ["first", "second"], [{ "0": 1, "3": 2 }, { "3": 4, "4": 5 }], [{ "1": 2 }, { "1": 3, "2": 9 }], (first, second) => sum(Object.keys(first).map((key) => first[key] * (second[key] || 0))), "Return dot product of sparse vectors represented as objects.", "medium"],
  ["Sparse Vector Add", "hash-map", ["first", "second"], [{ "0": 1, "3": 2 }, { "3": 4, "4": 5 }], [{ "1": 2 }, { "1": 3, "2": 9 }], (first, second) => Object.fromEntries([...new Set([...Object.keys(first), ...Object.keys(second)])].sort((a, b) => Number(a) - Number(b)).map((key) => [key, (first[key] || 0) + (second[key] || 0)]).filter(([, value]) => value !== 0)), "Add sparse vectors represented as objects.", "medium"],
  ["Polynomial Evaluate Lite", "math", ["coefficients", "x"], [[2, 3, 1], 2], [[1, 0, 4], 3], (coefficients, x) => sum(coefficients.map((coef, power) => coef * x ** power)), "Evaluate a polynomial whose coefficients are ordered by increasing power.", "medium"],
  ["Polynomial Derivative Coefficients", "math", ["coefficients"], [[2, 3, 1]], [[1, 0, 4]], (coefficients) => coefficients.slice(1).map((coef, index) => coef * (index + 1)), "Return derivative coefficients for a polynomial ordered by increasing power.", "medium"],
  ["Matrix Is Symmetric", "matrix", ["matrix"], [[[1, 2], [2, 1]]], [[[1, 0], [2, 1]]], (matrix) => matrix.every((row, r) => row.every((value, c) => value === matrix[c][r])), "Return true if a square matrix is symmetric."],
  ["Matrix Identity Check", "matrix", ["matrix"], [[[1, 0], [0, 1]]], [[[1, 0], [1, 1]]], (matrix) => matrix.every((row, r) => row.every((value, c) => value === (r === c ? 1 : 0))), "Return true if a square matrix is an identity matrix."],
  ["Matrix Zero Rows", "matrix", ["matrix"], [[[0, 0], [1, 0], [0, 0]]], [[[1], [0]]], (matrix) => matrix.flatMap((row, index) => row.every((value) => value === 0) ? [index] : []), "Return indices of rows made entirely of zeroes."],
  ["Matrix Zero Columns", "matrix", ["matrix"], [[[0, 1, 0], [0, 2, 0]]], [[[1, 0], [2, 0]]], (matrix) => matrix[0].flatMap((_value, column) => matrix.every((row) => row[column] === 0) ? [column] : []), "Return indices of columns made entirely of zeroes."],
  ["Matrix Multiply Two By Two", "matrix", ["first", "second"], [[ [1, 2], [3, 4] ], [ [5, 6], [7, 8] ]], [[ [2, 0], [1, 2] ], [ [1, 1], [0, 1] ]], (first, second) => [[first[0][0] * second[0][0] + first[0][1] * second[1][0], first[0][0] * second[0][1] + first[0][1] * second[1][1]], [first[1][0] * second[0][0] + first[1][1] * second[1][0], first[1][0] * second[0][1] + first[1][1] * second[1][1]]], "Multiply two 2x2 matrices.", "medium"],
  ["Nested List Depth", "array", ["value"], [[[1, [2, [3]]]]], [[["a", ["b"]]]], (value) => { const depth = (item) => Array.isArray(item) ? 1 + Math.max(0, ...item.map(depth)) : 0; return depth(value); }, "Return maximum nesting depth of a list.", "medium"],
  ["Flatten Deep List", "array", ["value"], [[[1, [2, [3]]]]], [[["a", ["b"]]]], (value) => { const flat = (item) => Array.isArray(item) ? item.flatMap(flat) : [item]; return flat(value); }, "Flatten a nested list of any depth.", "medium"],
  ["Tree Leaf Values Lite", "tree", ["tree"], [{ value: 1, children: [{ value: 2, children: [] }, { value: 3, children: [] }] }], [{ value: "a", children: [{ value: "b", children: [{ value: "c", children: [] }] }] }], (tree) => { const leaves = []; const walk = (node) => node.children.length ? node.children.forEach(walk) : leaves.push(node.value); walk(tree); return leaves; }, "Return leaf values from a simple tree object.", "medium"],
  ["Tree Node Count Lite", "tree", ["tree"], [{ value: 1, children: [{ value: 2, children: [] }, { value: 3, children: [] }] }], [{ value: "a", children: [{ value: "b", children: [{ value: "c", children: [] }] }] }], (tree) => { let count = 0; const walk = (node) => { count += 1; node.children.forEach(walk); }; walk(tree); return count; }, "Return how many nodes are in a simple tree object.", "medium"],
  ["Tree Max Depth Lite", "tree", ["tree"], [{ value: 1, children: [{ value: 2, children: [] }, { value: 3, children: [] }] }], [{ value: "a", children: [{ value: "b", children: [{ value: "c", children: [] }] }] }], (tree) => { const depth = (node) => 1 + Math.max(0, ...node.children.map(depth)); return depth(tree); }, "Return maximum depth of a simple tree object.", "medium"],
  ["Trie Prefix Count Lite", "string", ["words", "prefix"], [["apple", "app", "bat"], "app"], [["code", "coder", "cat"], "co"], (words, prefix) => words.filter((word) => word.startsWith(prefix)).length, "Return how many words start with prefix."],
  ["Trie Unique Prefixes Lite", "string", ["words"], [["apple", "app", "bat"]], [["code", "coder"]], (words) => uniqueSorted(words.flatMap((word) => Array.from({ length: word.length }, (_, index) => word.slice(0, index + 1)))), "Return sorted distinct non-empty prefixes from words."],
  ["Topological Ready Tasks", "graph", ["tasks", "deps"], [["a", "b", "c"], [["a", "b"]]], [["x", "y"], []], (tasks, deps) => tasks.filter((task) => !deps.some(([, after]) => after === task)).sort(), "Return tasks that have no incoming dependency.", "medium"],
  ["Dependency Children", "graph", ["deps", "task"], [[["a", "b"], ["a", "c"], ["b", "d"]], "a"], [[["x", "y"]], "x"], (deps, task) => deps.filter(([before]) => before === task).map(([, after]) => after).sort(), "Return tasks that directly depend on task."],
];

finishingTasks.forEach(([title, topic, params, sample, hidden, solve, statement, difficulty = "easy"]) => {
  addProblem({ title, topic, params, sample, hidden, solve, statement, difficulty });
});

if (problems.length < targetCount) {
  throw new Error(`Only generated ${problems.length} problems; expected ${targetCount}.`);
}

const slugs = new Set();
for (const problem of problems) {
  if (slugs.has(problem.slug)) throw new Error(`Duplicate slug: ${problem.slug}`);
  slugs.add(problem.slug);
}

await writeFile(problemsPath, `${JSON.stringify(problems, null, 2)}\n`, "utf8");
console.log(`Problem bank now has ${problems.length} varied problems.`);
