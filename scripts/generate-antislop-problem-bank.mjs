import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const problemsPath = path.join(rootDir, "apps", "antislop", "data", "problems.json");
const targetCount = 500;

function titleCase(value) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function json(value) {
  return JSON.stringify(value);
}

function suffix(index) {
  return String(index).padStart(3, "0");
}

const templates = [
  {
    base: "sum-array",
    title: "Sum Array",
    topic: "array",
    entry: "sum_array",
    statement: "Return the sum of all integers in nums.",
    starter: (entry) => `def ${entry}(nums):\n    return 0\n`,
    make: (n) => {
      const sample = [n, n + 2, -1, 4];
      const hidden = [n * 2, -n, 3];
      return { samples: [[sample], [sample.reduce((a, b) => a + b, 0)]], hidden: [[hidden], [hidden.reduce((a, b) => a + b, 0)]] };
    },
  },
  {
    base: "count-even",
    title: "Count Even Numbers",
    topic: "array",
    entry: "count_even",
    statement: "Return how many numbers in nums are even.",
    starter: (entry) => `def ${entry}(nums):\n    return 0\n`,
    make: (n) => {
      const sample = [n, n + 1, n + 2, n + 5, 8];
      const hidden = [1, 3, n * 2, n * 2 + 1, 12];
      return { samples: [[sample], [sample.filter((x) => x % 2 === 0).length]], hidden: [[hidden], [hidden.filter((x) => x % 2 === 0).length]] };
    },
  },
  {
    base: "max-value",
    title: "Maximum Value",
    topic: "array",
    entry: "max_value",
    statement: "Return the largest integer in nums.",
    starter: (entry) => `def ${entry}(nums):\n    return 0\n`,
    make: (n) => {
      const sample = [n - 7, n + 3, -2, n];
      const hidden = [-10, -3, -n, n - 4];
      return { samples: [[sample], [Math.max(...sample)]], hidden: [[hidden], [Math.max(...hidden)]] };
    },
  },
  {
    base: "min-value",
    title: "Minimum Value",
    topic: "array",
    entry: "min_value",
    statement: "Return the smallest integer in nums.",
    starter: (entry) => `def ${entry}(nums):\n    return 0\n`,
    make: (n) => {
      const sample = [n + 4, -n, 2, n - 9];
      const hidden = [7, n, -n - 2, 0];
      return { samples: [[sample], [Math.min(...sample)]], hidden: [[hidden], [Math.min(...hidden)]] };
    },
  },
  {
    base: "count-target",
    title: "Count Target",
    topic: "array",
    entry: "count_target",
    statement: "Return how many times target appears in nums.",
    starter: (entry) => `def ${entry}(nums, target):\n    return 0\n`,
    make: (n) => {
      const target = n % 5;
      const sample = [target, 1, target, 2, target + 1, target];
      const hidden = [3, target, 4, target, 5];
      return { samples: [[sample, target], [sample.filter((x) => x === target).length]], hidden: [[hidden, target], [hidden.filter((x) => x === target).length]] };
    },
  },
  {
    base: "filter-positive",
    title: "Filter Positive Numbers",
    topic: "array",
    entry: "filter_positive",
    statement: "Return a new list containing only the positive numbers in nums, preserving order.",
    starter: (entry) => `def ${entry}(nums):\n    return []\n`,
    make: (n) => {
      const sample = [-n, n, 0, n + 2, -3];
      const hidden = [-1, -2, n + 1, 5];
      return { samples: [[sample], [sample.filter((x) => x > 0)]], hidden: [[hidden], [hidden.filter((x) => x > 0)]] };
    },
  },
  {
    base: "square-numbers",
    title: "Square Numbers",
    topic: "array",
    entry: "square_numbers",
    statement: "Return a new list where each number in nums is squared.",
    starter: (entry) => `def ${entry}(nums):\n    return []\n`,
    make: (n) => {
      const sample = [n % 4, -2, 3];
      const hidden = [-1, n % 6, 5];
      return { samples: [[sample], [sample.map((x) => x * x)]], hidden: [[hidden], [hidden.map((x) => x * x)]] };
    },
  },
  {
    base: "prefix-sums",
    title: "Prefix Sums",
    topic: "array",
    entry: "prefix_sums",
    statement: "Return a list where each position contains the sum of nums up to that position.",
    starter: (entry) => `def ${entry}(nums):\n    return []\n`,
    make: (n) => {
      const build = (arr) => arr.map((_, i) => arr.slice(0, i + 1).reduce((a, b) => a + b, 0));
      const sample = [1, n % 7, 3, -1];
      const hidden = [n % 5, 2, 2];
      return { samples: [[sample], [build(sample)]], hidden: [[hidden], [build(hidden)]] };
    },
  },
  {
    base: "string-length",
    title: "String Length",
    topic: "string",
    entry: "string_length",
    statement: "Return the number of characters in s.",
    starter: (entry) => `def ${entry}(s):\n    return 0\n`,
    make: (n) => {
      const sample = `daily-${n}`;
      const hidden = `code-${n}-practice`;
      return { samples: [[sample], [sample.length]], hidden: [[hidden], [hidden.length]] };
    },
  },
  {
    base: "count-vowels",
    title: "Count Vowels",
    topic: "string",
    entry: "count_vowels",
    statement: "Return how many vowels appear in s. Treat a, e, i, o, and u as vowels.",
    starter: (entry) => `def ${entry}(s):\n    return 0\n`,
    make: (n) => {
      const count = (s) => [...s.toLowerCase()].filter((c) => "aeiou".includes(c)).length;
      const sample = `algorithm ${n}`;
      const hidden = `debug every issue ${n}`;
      return { samples: [[sample], [count(sample)]], hidden: [[hidden], [count(hidden)]] };
    },
  },
  {
    base: "reverse-words",
    title: "Reverse Words",
    topic: "string",
    entry: "reverse_words",
    statement: "Return the words in sentence in reverse order, joined by a single space.",
    starter: (entry) => `def ${entry}(sentence):\n    return \"\"\n`,
    make: (n) => {
      const solve = (s) => s.split(" ").reverse().join(" ");
      const sample = `learn arrays day ${n}`;
      const hidden = `practice makes steady progress`;
      return { samples: [[sample], [solve(sample)]], hidden: [[hidden], [solve(hidden)]] };
    },
  },
  {
    base: "palindrome-string",
    title: "Palindrome String",
    topic: "string",
    entry: "is_palindrome_string",
    statement: "Return true if s reads the same forward and backward.",
    starter: (entry) => `def ${entry}(s):\n    return False\n`,
    make: (n) => {
      const sample = n % 2 === 0 ? "level" : "daily";
      const hidden = n % 3 === 0 ? "radar" : "python";
      return { samples: [[sample], [sample === [...sample].reverse().join("")]], hidden: [[hidden], [hidden === [...hidden].reverse().join("")]] };
    },
  },
  {
    base: "contains-duplicate",
    title: "Contains Duplicate",
    topic: "hash-map",
    entry: "contains_duplicate",
    statement: "Return true if any value appears at least twice in nums.",
    starter: (entry) => `def ${entry}(nums):\n    return False\n`,
    make: (n) => {
      const sample = [n, n + 1, n];
      const hidden = [n, n + 1, n + 2];
      return { samples: [[sample], [new Set(sample).size !== sample.length]], hidden: [[hidden], [new Set(hidden).size !== hidden.length]] };
    },
  },
  {
    base: "word-frequency",
    title: "Word Frequency",
    topic: "hash-map",
    entry: "word_frequency",
    statement: "Return an object counting how many times each word appears in words.",
    starter: (entry) => `def ${entry}(words):\n    return {}\n`,
    make: (n) => {
      const count = (words) => words.reduce((acc, word) => ({ ...acc, [word]: (acc[word] || 0) + 1 }), {});
      const sample = ["code", "daily", "code", `p${n}`];
      const hidden = ["a", "b", "a", "c", "b"];
      return { samples: [[sample], [count(sample)]], hidden: [[hidden], [count(hidden)]] };
    },
  },
  {
    base: "factorial",
    title: "Factorial",
    topic: "math",
    entry: "factorial",
    statement: "Return n factorial. n is a non-negative integer.",
    starter: (entry) => `def ${entry}(n):\n    return 1\n`,
    make: (n) => {
      const fact = (x) => Array.from({ length: x }, (_, i) => i + 1).reduce((a, b) => a * b, 1);
      const sample = (n % 5) + 3;
      const hidden = (n % 4) + 1;
      return { samples: [[sample], [fact(sample)]], hidden: [[hidden], [fact(hidden)]] };
    },
  },
  {
    base: "is-prime",
    title: "Is Prime",
    topic: "math",
    entry: "is_prime",
    statement: "Return true if n is a prime number.",
    starter: (entry) => `def ${entry}(n):\n    return False\n`,
    make: (n) => {
      const prime = (x) => x > 1 && Array.from({ length: Math.floor(Math.sqrt(x)) - 1 }, (_, i) => i + 2).every((d) => x % d !== 0);
      const sample = [2, 3, 5, 7, 11, 13, 17][n % 7];
      const hidden = [1, 4, 9, 15, 21, 25][n % 6];
      return { samples: [[sample], [prime(sample)]], hidden: [[hidden], [prime(hidden)]] };
    },
  },
  {
    base: "digit-sum",
    title: "Digit Sum",
    topic: "math",
    entry: "digit_sum",
    statement: "Return the sum of the decimal digits of n.",
    starter: (entry) => `def ${entry}(n):\n    return 0\n`,
    make: (n) => {
      const sum = (x) => [...String(Math.abs(x))].reduce((a, c) => a + Number(c), 0);
      const sample = n * 101 + 23;
      const hidden = n * 37 + 9;
      return { samples: [[sample], [sum(sample)]], hidden: [[hidden], [sum(hidden)]] };
    },
  },
  {
    base: "range-sum",
    title: "Range Sum",
    topic: "math",
    entry: "range_sum",
    statement: "Return the sum of every integer from start to end, inclusive.",
    starter: (entry) => `def ${entry}(start, end):\n    return 0\n`,
    make: (n) => {
      const solve = (a, b) => ((a + b) * (b - a + 1)) / 2;
      const start = n % 10;
      const end = start + 5;
      return { samples: [[start, end], [solve(start, end)]], hidden: [[1, (n % 6) + 3], [solve(1, (n % 6) + 3)]] };
    },
  },
  {
    base: "last-index",
    title: "Last Index",
    topic: "array",
    entry: "last_index",
    statement: "Return the last index where target appears in nums, or -1 if it is missing.",
    starter: (entry) => `def ${entry}(nums, target):\n    return -1\n`,
    make: (n) => {
      const target = n % 4;
      const sample = [target, 2, target + 1, target, 5];
      const hidden = [1, 2, 3, 4];
      return { samples: [[sample, target], [sample.lastIndexOf(target)]], hidden: [[hidden, target], [hidden.lastIndexOf(target)]] };
    },
  },
  {
    base: "capitalize-words",
    title: "Capitalize Words",
    topic: "string",
    entry: "capitalize_words",
    statement: "Return sentence with the first letter of each word uppercased.",
    starter: (entry) => `def ${entry}(sentence):\n    return \"\"\n`,
    make: (n) => {
      const solve = (s) => s.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const sample = `daily code ${n}`;
      const hidden = "small steady practice";
      return { samples: [[sample], [solve(sample)]], hidden: [[hidden], [solve(hidden)]] };
    },
  },
];

const raw = await readFile(problemsPath, "utf8");
const problems = JSON.parse(raw);
const usedSlugs = new Set(problems.map((problem) => problem.slug));

let variant = 1;
while (problems.length < targetCount) {
  for (const template of templates) {
    if (problems.length >= targetCount) break;

    const id = `${template.base}-${suffix(variant)}`;
    if (usedSlugs.has(id)) continue;

    const entryPoint = `${template.entry}_${suffix(variant)}`;
    const data = template.make(variant);

    problems.push({
      id,
      title: `${template.title} ${suffix(variant)}`,
      slug: id,
      difficulty: "easy",
      topic: template.topic,
      entry_point: entryPoint,
      statement: `${template.statement} This is ${titleCase(template.base)} practice variant ${variant}.`,
      starter_code: template.starter(entryPoint),
      samples: [{ input: json(data.samples[0]), output: json(data.samples[1][0]) }],
      hidden_tests: [{ input: json(data.hidden[0]), output: json(data.hidden[1][0]) }],
    });

    usedSlugs.add(id);
  }
  variant += 1;
}

await writeFile(problemsPath, `${JSON.stringify(problems, null, 2)}\n`, "utf8");
console.log(`Problem bank now has ${problems.length} problems.`);
