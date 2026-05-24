export interface Hint {
  id: number
  type: 'syntax' | 'logic' | 'performance' | 'best-practice'
  message: string
  severity: 'low' | 'medium' | 'high'
  line?: number
  timestamp: number
}

export const mockHints: Hint[] = [
  {
    id: 1,
    type: 'syntax',
    message: 'Looks like you forgot a semicolon at the end of line 5.',
    severity: 'high',
    line: 5,
    timestamp: Date.now() - 30000
  },
  {
    id: 2,
    type: 'logic',
    message: 'Check your loop bounds; you may be iterating one step too far.',
    severity: 'medium',
    line: 12,
    timestamp: Date.now() - 25000
  },
  {
    id: 3,
    type: 'performance',
    message: 'Consider using a HashMap for O(1) lookups instead of O(n) array search.',
    severity: 'medium',
    line: 8,
    timestamp: Date.now() - 20000
  },
  {
    id: 4,
    type: 'best-practice',
    message: 'Add input validation to handle edge cases like empty arrays.',
    severity: 'low',
    line: 3,
    timestamp: Date.now() - 15000
  },
  {
    id: 5,
    type: 'syntax',
    message: 'Missing closing brace for the function starting at line 2.',
    severity: 'high',
    line: 15,
    timestamp: Date.now() - 10000
  },
  {
    id: 6,
    type: 'logic',
    message: 'Your base case for the recursive function might be incorrect.',
    severity: 'medium',
    line: 7,
    timestamp: Date.now() - 5000
  },
  {
    id: 7,
    type: 'performance',
    message: 'This nested loop creates O(n²) complexity. Consider optimizing.',
    severity: 'high',
    line: 10,
    timestamp: Date.now() - 2000
  },
  {
    id: 8,
    type: 'best-practice',
    message: 'Use meaningful variable names instead of single letters.',
    severity: 'low',
    line: 4,
    timestamp: Date.now() - 1000
  }
]

export const mockProgress = {
  'leetcode_two_sum': {
    attempts: 3,
    hintsUsed: [1, 2, 4],
    timeSpent: 1800000, // 30 minutes
    lastAttempt: Date.now() - 3600000, // 1 hour ago
    solved: true,
    difficulty: 'easy'
  },
  'leetcode_add_two_numbers': {
    attempts: 5,
    hintsUsed: [2, 3, 5],
    timeSpent: 2700000, // 45 minutes
    lastAttempt: Date.now() - 7200000, // 2 hours ago
    solved: false,
    difficulty: 'medium'
  },
  'leetcode_longest_substring': {
    attempts: 2,
    hintsUsed: [1],
    timeSpent: 900000, // 15 minutes
    lastAttempt: Date.now() - 86400000, // 1 day ago
    solved: true,
    difficulty: 'medium'
  },
  'gfg_binary_search': {
    attempts: 1,
    hintsUsed: [],
    timeSpent: 600000, // 10 minutes
    lastAttempt: Date.now() - 172800000, // 2 days ago
    solved: true,
    difficulty: 'easy'
  },
  'hackerrank_array_manipulation': {
    attempts: 4,
    hintsUsed: [3, 6, 7],
    timeSpent: 3600000, // 60 minutes
    lastAttempt: Date.now() - 259200000, // 3 days ago
    solved: false,
    difficulty: 'hard'
  }
}

export const mockProblems = [
  {
    id: 'leetcode_two_sum',
    title: 'Two Sum',
    platform: 'leetcode',
    difficulty: 'easy',
    language: 'javascript',
    url: 'https://leetcode.com/problems/two-sum/'
  },
  {
    id: 'leetcode_add_two_numbers',
    title: 'Add Two Numbers',
    platform: 'leetcode',
    difficulty: 'medium',
    language: 'python',
    url: 'https://leetcode.com/problems/add-two-numbers/'
  },
  {
    id: 'leetcode_longest_substring',
    title: 'Longest Substring Without Repeating Characters',
    platform: 'leetcode',
    difficulty: 'medium',
    language: 'java',
    url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/'
  },
  {
    id: 'gfg_binary_search',
    title: 'Binary Search',
    platform: 'geeksforgeeks',
    difficulty: 'easy',
    language: 'cpp',
    url: 'https://www.geeksforgeeks.org/binary-search/'
  },
  {
    id: 'hackerrank_array_manipulation',
    title: 'Array Manipulation',
    platform: 'hackerrank',
    difficulty: 'hard',
    language: 'python',
    url: 'https://www.hackerrank.com/challenges/crush/problem'
  }
]
