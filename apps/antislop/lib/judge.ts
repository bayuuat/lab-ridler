import { spawn } from 'child_process'
import vm from 'vm'

import type { Problem, ProblemSample } from '@/lib/problem-store'

export type JudgeLanguage = 'python' | 'javascript'

export type JudgeResult = {
  input: string
  expected: string
  stdout: string
  stderr: string
  pass: boolean
}

function normalizeOutput(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  try {
    return JSON.stringify(JSON.parse(trimmed))
  } catch {
    return trimmed.replace(/\s+/g, ' ')
  }
}

function parseJsonValue(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    return JSON.parse(trimmed)
  } catch {
    return null
  }
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a).sort()
    const bKeys = Object.keys(b).sort()
    if (aKeys.length !== bKeys.length) return false
    if (!aKeys.every((key, index) => key === bKeys[index])) return false
    return aKeys.every((key) => deepEqual(a[key], b[key]))
  }
  return false
}

function validateTwoSum(testCase: ProblemSample, stdout: string): boolean {
  const parsedInput = parseJsonValue(testCase.input)
  const parsedOutput = parseJsonValue(stdout)
  if (!Array.isArray(parsedInput) || parsedInput.length !== 2) return false
  if (!Array.isArray(parsedInput[0]) || typeof parsedInput[1] !== 'number') return false
  if (!Array.isArray(parsedOutput) || parsedOutput.length !== 2) return false

  const nums = parsedInput[0]
  const target = parsedInput[1]
  const [firstIndex, secondIndex] = parsedOutput
  if (!Number.isInteger(firstIndex) || !Number.isInteger(secondIndex)) return false
  if (firstIndex === secondIndex) return false
  if (firstIndex < 0 || secondIndex < 0 || firstIndex >= nums.length || secondIndex >= nums.length) return false

  return nums[firstIndex] + nums[secondIndex] === target
}

function buildPythonWrapper(code: string, entryPoint: string) {
  const encodedCode = JSON.stringify(code)
  const encodedEntryPoint = JSON.stringify(entryPoint)

  return `
import json
import sys
import traceback

user_code = ${encodedCode}
entry_point = ${encodedEntryPoint}
namespace = {}

try:
    exec(user_code, namespace, namespace)
except Exception:
    traceback.print_exc()
    sys.exit(1)

try:
    raw_input = sys.stdin.read().strip()
    args = json.loads(raw_input) if raw_input else []
    if not isinstance(args, list):
        args = [args]
    result = namespace[entry_point](*args)
    if isinstance(result, tuple):
        result = list(result)
    print(json.dumps(result, ensure_ascii=False))
except Exception:
    traceback.print_exc()
    sys.exit(1)
`
}

function buildJavaScriptWrapper(code: string, entryPoint: string, input: string) {
  const encodedCode = JSON.stringify(code)
  const encodedEntryPoint = JSON.stringify(entryPoint)
  const encodedInput = JSON.stringify(input)

  return `
const __judge_user_code__ = ${encodedCode}

eval(__judge_user_code__)

const __judge_entry_point__ = ${encodedEntryPoint}
const __judge_input__ = ${encodedInput}
const __judge_args__ = __judge_input__ ? JSON.parse(__judge_input__) : []

if (!Array.isArray(__judge_args__)) {
  throw new Error('Judge input must decode to an array')
}

const __judge_handler__ = globalThis[__judge_entry_point__]
if (typeof __judge_handler__ !== 'function') {
  throw new Error('Entry point ' + __judge_entry_point__ + ' is not defined as a function')
}

const __judge_result__ = __judge_handler__(...__judge_args__)
globalThis.__judge_output__ = JSON.stringify(__judge_result__ === undefined ? null : __judge_result__)
`
}

export function runPython(code: string, input: string, entryPoint: string, timeoutMs = 3000): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    const child = spawn('python3', ['-u', '-c', buildPythonWrapper(code, entryPoint)], { stdio: ['pipe', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      resolve({ stdout, stderr: `${stderr}\nTimeout`, code: null })
    }, timeoutMs)

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    child.on('close', (exitCode) => {
      clearTimeout(timer)
      resolve({ stdout, stderr, code: exitCode })
    })
    if (input) child.stdin.write(input)
    child.stdin.end()
  })
}

export function runJavaScript(code: string, input: string, entryPoint: string, timeoutMs = 3000): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''
    try {
      const context = vm.createContext({
        console,
        JSON,
        Math,
        Number,
        String,
        Boolean,
        Array,
        Object,
        RegExp,
        Date,
        Set,
        Map,
        Promise,
      })

      const script = new vm.Script(buildJavaScriptWrapper(code, entryPoint, input))
      script.runInContext(context, { timeout: timeoutMs })
      const output = (context as any).__judge_output__
      stdout = typeof output === 'string' ? `${output}\n` : ''
      resolve({ stdout, stderr, code: 0 })
    } catch (error: any) {
      stderr = error?.stack || error?.message || String(error)
      resolve({ stdout, stderr, code: 1 })
    }
  })
}

export async function evaluateProblem(problem: Problem, code: string, includeHidden = false, language: JudgeLanguage = 'python') {
  const tests: ProblemSample[] = includeHidden
    ? [...(problem.samples || []), ...(problem.hidden_tests || [])]
    : [...(problem.samples || [])]

  const results: JudgeResult[] = []
  for (const testCase of tests) {
    const run = language === 'javascript'
      ? await runJavaScript(code, testCase.input, problem.entry_point)
      : await runPython(code, testCase.input, problem.entry_point)
    const pass = problem.judge?.mode === 'two-sum'
      ? validateTwoSum(testCase, run.stdout)
      : deepEqual(parseJsonValue(run.stdout), parseJsonValue(testCase.output)) || normalizeOutput(run.stdout) === normalizeOutput(testCase.output)
    results.push({
      input: testCase.input,
      expected: testCase.output,
      stdout: run.stdout,
      stderr: run.stderr,
      pass,
    })
  }

  const passedTests = results.filter((result) => result.pass).length
  return {
    results,
    passedTests,
    totalTests: results.length,
    passAll: results.length > 0 && passedTests === results.length,
  }
}
