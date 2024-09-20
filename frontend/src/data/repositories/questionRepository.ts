import { IQuestionInput, IQuestionUpdateInput } from '../../domain/repositories/IQuestionRepository';

// Update the Question interface to include the link
interface Question {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    categories: string[];
    status: 'complete' | 'working' | 'starting';
    link: string; // Add this line
}

const initialQuestions: Question[] = [
    {
        id: "1",
        title: "Reverse a String",
        description: "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
        difficulty: "Easy",
        categories: ["Strings", "Algorithms"],
        status: "complete",
        link: "https://leetcode.com/problems/reverse-string/"
    },
    {
        id: "2",
        title: "Linked List Cycle Detection",
        description: "Implement a function to detect if a linked list contains a cycle.",
        difficulty: "Easy",
        categories: ["Data Structures", "Algorithms"],
        status: "working",
        link: "https://leetcode.com/problems/linked-list-cycle/"
    },
    {
        id: "3",
        title: "Roman to Integer",
        description: "Given a roman numeral, convert it to an integer.",
        difficulty: "Easy",
        categories: ["Algorithms"],
        status: "starting",
        link: "https://leetcode.com/problems/roman-to-integer/"
    },
    {
        id: "4",
        title: "Add Binary",
        description: "Given two binary strings a and b, return their sum as a binary string.",
        difficulty: "Easy",
        categories: ["Bit Manipulation", "Algorithms"],
        status: "working",
        link: "https://leetcode.com/problems/add-binary/"
    },
    {
        id: "5",
        title: "Fibonacci Number",
        description: "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. Given n, calculate F(n).",
        difficulty: "Easy",
        categories: ["Recursion", "Algorithms"],
        status: "complete",
        link: "https://leetcode.com/problems/fibonacci-number/"
    },
    {
        id: "6",
        title: "Implement Stack using Queues",
        description: "Implement a last-in-first-out (LIFO) stack using only two queues. The implemented stack should support all the functions of a normal stack (push, top, pop, and empty).",
        difficulty: "Easy",
        categories: ["Data Structures"],
        status: "starting",
        link: "https://leetcode.com/problems/implement-stack-using-queues/"
    },
    {
        id: "7",
        title: "Combine Two Tables",
        description: "Write a SQL solution to report the first name, last name, city, and state of each person in the Person table. If the address of a personId is not present in the Address table, report null instead.",
        difficulty: "Easy",
        categories: ["Databases"],
        status: "working",
        link: "https://leetcode.com/problems/combine-two-tables/"
    },
    {
        id: "8",
        title: "Repeated DNA Sequences",
        description: "Given a string s that represents a DNA sequence, return all the 10-letter-long sequences (substrings) that occur more than once in a DNA molecule.",
        difficulty: "Medium",
        categories: ["Algorithms", "Bit Manipulation"],
        status: "starting",
        link: "https://leetcode.com/problems/repeated-dna-sequences/"
    },
    {
        id: "9",
        title: "Course Schedule",
        description: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses. Otherwise, return false.",
        difficulty: "Medium",
        categories: ["Data Structures", "Algorithms"],
        status: "working",
        link: "https://leetcode.com/problems/course-schedule/"
    },
    {
        id: "10",
        title: "LRU Cache Design",
        description: "Design and implement an LRU (Least Recently Used) cache.",
        difficulty: "Medium",
        categories: ["Data Structures"],
        status: "complete",
        link: "https://leetcode.com/problems/lru-cache/"
    },
    {
        id: "11",
        title: "Longest Common Subsequence",
        description: "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
        difficulty: "Medium",
        categories: ["Strings", "Algorithms"],
        status: "starting",
        link: "https://leetcode.com/problems/longest-common-subsequence/"
    },
    {
        id: "12",
        title: "Rotate Image",
        description: "You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).",
        difficulty: "Medium",
        categories: ["Arrays", "Algorithms"],
        status: "working",
        link: "https://leetcode.com/problems/rotate-image/"
    },
    {
        id: "13",
        title: "Airplane Seat Assignment Probability",
        description: "n passengers board an airplane with exactly n seats. The first passenger has lost the ticket and picks a seat randomly. But after that, the rest of the passengers will take their own seat if it is still available, and pick other seats randomly when they find their seat occupied. Return the probability that the nth person gets his own seat.",
        difficulty: "Medium",
        categories: ["Brainteaser"],
        status: "starting",
        link: "https://leetcode.com/problems/airplane-seat-assignment-probability/"
    },
    {
        id: "14",
        title: "Validate Binary Search Tree",
        description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
        difficulty: "Medium",
        categories: ["Data Structures", "Algorithms"],
        status: "complete",
        link: "https://leetcode.com/problems/validate-binary-search-tree/"
    },
    {
        id: "15",
        title: "Sliding Window Maximum",
        description: "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position. Return the max sliding window.",
        difficulty: "Hard",
        categories: ["Arrays", "Algorithms"],
        status: "working",
        link: "https://leetcode.com/problems/sliding-window-maximum/"
    },
    {
        id: "16",
        title: "N-Queen Problem",
        description: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return all distinct solutions to the n-queens puzzle. You may return the answer in any order.",
        difficulty: "Hard",
        categories: ["Algorithms"],
        status: "starting",
        link: "https://leetcode.com/problems/n-queens/"
    },
    {
        id: "17",
        title: "Serialize and Deserialize a Binary Tree",
        description: "Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.",
        difficulty: "Hard",
        categories: ["Data Structures", "Algorithms"],
        status: "working",
        link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/"
    },
    {
        id: "18",
        title: "Wildcard Matching",
        description: "Given an input string (s) and a pattern (p), implement wildcard pattern matching with support for '?' and '*' where: '?' Matches any single character. '*' Matches any sequence of characters (including the empty sequence). The matching should cover the entire input string (not partial).",
        difficulty: "Hard",
        categories: ["Strings", "Algorithms"],
        status: "complete",
        link: "https://leetcode.com/problems/wildcard-matching/"
    },
    {
        id: "19",
        title: "Chalkboard XOR Game",
        description: "You are given an array of integers nums represents the numbers written on a chalkboard. Alice and Bob take turns erasing exactly one number from the chalkboard, with Alice starting first. If erasing a number causes the bitwise XOR of all the elements of the chalkboard to become 0, then that player loses. Return true if and only if Alice wins the game, assuming both players play optimally.",
        difficulty: "Hard",
        categories: ["Brainteaser"],
        status: "starting",
        link: "https://leetcode.com/problems/chalkboard-xor-game/"
    },
    {
        id: "20",
        title: "Trips and Users",
        description: "Write a SQL solution to find the cancellation rate of requests with unbanned users (both client and driver must not be banned) each day between '2013-10-01' and '2013-10-03'. Round Cancellation Rate to two decimal points.",
        difficulty: "Hard",
        categories: ["Databases"],
        status: "working",
        link: "https://leetcode.com/problems/trips-and-users/"
    }
];

export class MockQuestionRemoteDataSource {
    private questions: Question[] = [...initialQuestions];

    async getAllQuestions(): Promise<Question[]> {
        return new Promise(resolve => {
            setTimeout(() => resolve([...this.questions]), 300);
        });
    }

    async getQuestion(id: string): Promise<Question> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const question = this.questions.find(q => q.id === id);
                if (question) {
                    resolve({ ...question });
                } else {
                    reject(new Error('Question not found'));
                }
            }, 300);
        });
    }

    async createQuestion(question: IQuestionInput): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => {
                const newQuestion: Question = {
                    ...question,
                    id: (this.questions.length + 1).toString(),
                    difficulty: "Medium", // Default difficulty
                    status: "starting", // Default status
                    link: "" // Default empty link
                };
                this.questions.push(newQuestion);
                resolve();
            }, 300);
        });
    }

    async updateQuestion(id: string, questionUpdate: IQuestionUpdateInput): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.questions.findIndex(q => q.id === id);
                if (index !== -1) {
                    this.questions[index] = { ...this.questions[index], ...questionUpdate };
                    resolve();
                } else {
                    reject(new Error('Question not found'));
                }
            }, 300);
        });
    }

    async deleteQuestion(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.questions.findIndex(q => q.id === id);
                if (index !== -1) {
                    this.questions.splice(index, 1);
                    resolve();
                } else {
                    reject(new Error('Question not found'));
                }
            }, 300);
        });
    }
}

export const mockQuestionRemoteDataSource = new MockQuestionRemoteDataSource();