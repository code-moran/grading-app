import { QuizQuestion } from './types';

// Quiz questions mapped by lesson number (not lesson ID)
// This maps to the lesson.number field in the database
export const quizQuestionsByLessonNumber: { [lessonNumber: number]: Omit<QuizQuestion, 'id'>[] } = {
  1: [
    {
      question: "What does HTML stand for?",
      options: [
        "HyperText Markup Language",
        "High-level Text Management Language",
        "Home Tool Markup Language",
        "Hyperlink and Text Markup Language",
      ],
      correctAnswer: 0,
      explanation: "HTML stands for HyperText Markup Language, which is the standard markup language for creating web pages.",
    },
    {
      question: "Which HTML element is used to define the document type?",
      options: ["<!DOCTYPE>", "<document>", "<html>", "<head>"],
      correctAnswer: 0,
      explanation: "The <!DOCTYPE> declaration defines the document type and HTML version.",
    },
    {
      question: "What is the correct HTML element for the largest heading?",
      options: ["<h6>", "<heading>", "<h1>", "<head>"],
      correctAnswer: 2,
      explanation: "<h1> is used for the largest heading, while <h2> through <h6> are used for smaller headings.",
    },
  ],
  2: [
    {
      question: "Which HTML element is used to create an unordered list?",
      options: ["<ol>", "<ul>", "<li>", "<list>"],
      correctAnswer: 1,
      explanation: "<ul> is used for unordered lists, while <ol> is for ordered lists.",
    },
    {
      question: "What attribute is used to specify the destination of a link?",
      options: ["src", "href", "link", "url"],
      correctAnswer: 1,
      explanation: "The href attribute specifies the URL of the page the link goes to.",
    },
  ],
  3: [
    {
      question: "Which HTML5 semantic element is used for the main content of a page?",
      options: ["<header>", "<main>", "<section>", "<article>"],
      correctAnswer: 1,
      explanation: "<main> represents the main content of the document.",
    },
    {
      question: "What is the purpose of the <nav> element?",
      options: [
        "To define navigation links",
        "To create a new section",
        "To add notes to the page",
        "To define a navigation bar",
      ],
      correctAnswer: 0,
      explanation: "<nav> defines a set of navigation links.",
    },
  ],
  4: [
    {
      question: "Where should internal CSS be placed in an HTML document?",
      options: [
        "In the <body> section",
        "In the <head> section",
        "At the end of the document",
        "Anywhere in the document",
      ],
      correctAnswer: 1,
      explanation: "Internal CSS should be placed in the <head> section within <style> tags.",
    },
    {
      question: "Which CSS property is used to change the text color?",
      options: ["text-color", "color", "font-color", "text-style"],
      correctAnswer: 1,
      explanation: "The color property is used to set the color of text.",
    },
  ],
  5: [
    {
      question: "Which HTML element is used to link external CSS files?",
      options: ["<style>", "<link>", "<css>", "<import>"],
      correctAnswer: 1,
      explanation: "The <link> element is used to link external CSS files.",
    },
    {
      question: "What is the main advantage of using external CSS?",
      options: [
        "Faster loading",
        "Style reusability across multiple pages",
        "Better security",
        "Easier debugging",
      ],
      correctAnswer: 1,
      explanation: "External CSS allows you to reuse styles across multiple pages.",
    },
  ],
  6: [
    {
      question: "Which keyword is used to declare a variable in JavaScript?",
      options: ["var", "let", "const", "All of the above"],
      correctAnswer: 3,
      explanation: "JavaScript supports var, let, and const for variable declaration.",
    },
    {
      question: 'What is the result of 5 + "5" in JavaScript?',
      options: ["10", "55", "Error", "undefined"],
      correctAnswer: 1,
      explanation: "JavaScript performs type coercion, converting the number to a string and concatenating.",
    },
  ],
  7: [
    {
      question: "Which of the following is NOT a primitive data type in JavaScript?",
      options: ["string", "number", "object", "boolean"],
      correctAnswer: 2,
      explanation: "Object is not a primitive data type; it is a reference type.",
    },
    {
      question: "What does typeof null return in JavaScript?",
      options: ["null", "object", "undefined", "string"],
      correctAnswer: 1,
      explanation: 'typeof null returns "object" due to a historical bug in JavaScript.',
    },
  ],
  8: [
    {
      question: "Which method adds an element to the end of an array?",
      options: ["push()", "pop()", "shift()", "unshift()"],
      correctAnswer: 0,
      explanation: "push() adds one or more elements to the end of an array.",
    },
    {
      question: "What does the length property of an array return?",
      options: [
        "The number of elements in the array",
        "The index of the last element",
        "The memory size of the array",
        "The data type of array elements",
      ],
      correctAnswer: 0,
      explanation: "The length property returns the number of elements in the array.",
    },
  ],
  9: [
    {
      question: "How do you declare a function in JavaScript?",
      options: [
        "function myFunction()",
        "function = myFunction()",
        "function:myFunction()",
        "function.myFunction()",
      ],
      correctAnswer: 0,
      explanation: "Functions in JavaScript are declared using the function keyword followed by the function name and parentheses.",
    },
    {
      question: "What keyword is used to return a value from a function?",
      options: ["return", "break", "continue", "exit"],
      correctAnswer: 0,
      explanation: "The return keyword is used to return a value from a function and exit the function execution.",
    },
  ],
  10: [
    {
      question: "What is jQuery?",
      options: [
        "A programming language",
        "A JavaScript library",
        "A CSS framework",
        "An HTML editor",
      ],
      correctAnswer: 1,
      explanation: "jQuery is a fast, small, and feature-rich JavaScript library.",
    },
    {
      question: "Which symbol is used as a shorthand for jQuery?",
      options: ["&", "$", "#", "@"],
      correctAnswer: 1,
      explanation: "The dollar sign ($) is used as a shorthand for jQuery.",
    },
  ],
  11: [
    {
      question: "Which jQuery selector selects elements by class?",
      options: ['$("element")', '$(".class")', '$("#id")', '$("*")'],
      correctAnswer: 1,
      explanation: "The dot (.) is used to select elements by class name in jQuery.",
    },
    {
      question: 'What does $("div p") select?',
      options: [
        "All div elements",
        "All p elements",
        "All p elements inside div elements",
        "All div and p elements",
      ],
      correctAnswer: 2,
      explanation: "This descendant selector selects all p elements that are inside div elements.",
    },
  ],
  12: [
    {
      question: "Which jQuery method is used to bind a click event?",
      options: ["click()", "onclick()", "bind()", "attach()"],
      correctAnswer: 0,
      explanation: "The click() method is used to bind a click event handler.",
    },
    {
      question: "What does event.preventDefault() do?",
      options: [
        "Stops event propagation",
        "Prevents the default action of an event",
        "Removes the event listener",
        "Triggers the event again",
      ],
      correctAnswer: 1,
      explanation: "preventDefault() prevents the default action of an event from occurring.",
    },
  ],
  13: [
    {
      question: "Which jQuery method is used to get the text content of an element?",
      options: ["html()", "text()", "val()", "content()"],
      correctAnswer: 1,
      explanation: "text() gets the combined text contents of each element in the set of matched elements.",
    },
    {
      question: "What does append() do in jQuery?",
      options: [
        "Adds content at the beginning of an element",
        "Adds content at the end of an element",
        "Replaces the content of an element",
        "Removes content from an element",
      ],
      correctAnswer: 1,
      explanation: "append() inserts content at the end of each element in the set of matched elements.",
    },
  ],
  14: [
    {
      question: "What is the main purpose of a portfolio website?",
      options: [
        "To sell products",
        "To showcase work and skills",
        "To provide news updates",
        "To host a blog",
      ],
      correctAnswer: 1,
      explanation: "A portfolio website is primarily used to showcase work, skills, and achievements.",
    },
    {
      question: "Which section is typically NOT included in a portfolio?",
      options: ["About", "Projects", "Contact", "Shopping cart"],
      correctAnswer: 3,
      explanation: "Shopping cart is not typically part of a portfolio website.",
    },
  ],
  15: [
    {
      question: "What is smooth scrolling?",
      options: [
        "Fast page loading",
        "Animated scrolling between sections",
        "Infinite scroll",
        "Auto-scroll feature",
      ],
      correctAnswer: 1,
      explanation: "Smooth scrolling provides animated transitions when navigating between sections.",
    },
    {
      question: "What is the purpose of form validation?",
      options: [
        "To make forms look better",
        "To ensure data integrity and user experience",
        "To speed up form submission",
        "To reduce server load",
      ],
      correctAnswer: 1,
      explanation: "Form validation ensures data integrity and provides better user experience.",
    },
  ],
  16: [
    {
      question: "What is responsive web design?",
      options: [
        "Designing for mobile only",
        "Creating websites that work on all devices",
        "Using only CSS Grid",
        "Designing with large screens in mind",
      ],
      correctAnswer: 1,
      explanation: "Responsive web design creates websites that work well on all devices and screen sizes.",
    },
    {
      question: "What CSS feature is used to create responsive designs?",
      options: ["Media queries", "JavaScript", "HTML5", "Server-side code"],
      correctAnswer: 0,
      explanation: "Media queries allow CSS to apply different styles based on device characteristics.",
    },
  ],
  17: [
    {
      question: "What CSS property is used to create a grid container?",
      options: [
        "display: flex",
        "display: grid",
        "display: block",
        "display: inline",
      ],
      correctAnswer: 1,
      explanation: "display: grid creates a grid container for CSS Grid layout.",
    },
    {
      question: "What does grid-template-columns define?",
      options: [
        "The number of rows",
        "The size of columns",
        "The gap between items",
        "The alignment of items",
      ],
      correctAnswer: 1,
      explanation: "grid-template-columns defines the size of the columns in a grid.",
    },
  ],
  18: [
    {
      question: "What CSS property is used to create transitions?",
      options: ["animation", "transition", "transform", "keyframes"],
      correctAnswer: 1,
      explanation: "The transition property is used to create smooth transitions between states.",
    },
    {
      question: "What does @keyframes define?",
      options: [
        "CSS transitions",
        "Animation sequences",
        "Media queries",
        "Grid layouts",
      ],
      correctAnswer: 1,
      explanation: "@keyframes defines the animation sequence with keyframes.",
    },
  ],
  19: [
    {
      question: "What does the descendant selector (space) do?",
      options: [
        "Selects direct children",
        "Selects all descendants",
        "Selects adjacent siblings",
        "Selects general siblings",
      ],
      correctAnswer: 1,
      explanation: "The descendant selector selects all elements that are descendants of a specified element.",
    },
    {
      question: "What does the > selector do?",
      options: [
        "Selects all descendants",
        "Selects direct children only",
        "Selects adjacent siblings",
        "Selects general siblings",
      ],
      correctAnswer: 1,
      explanation: "The child combinator (>) selects direct children only.",
    },
  ],
  20: [
    {
      question: "What is the result of 5 > 3 in JavaScript?",
      options: ["true", "false", "5", "3"],
      correctAnswer: 0,
      explanation: "The comparison 5 > 3 evaluates to true because 5 is greater than 3.",
    },
    {
      question: "What does the && operator do?",
      options: ["Logical OR", "Logical AND", "Logical NOT", "Assignment"],
      correctAnswer: 1,
      explanation: "The && operator performs logical AND operation.",
    },
  ],
  21: [
    {
      question: "Which loop executes at least once?",
      options: ["for loop", "while loop", "do-while loop", "forEach loop"],
      correctAnswer: 2,
      explanation: "The do-while loop executes the code block at least once before checking the condition.",
    },
    {
      question: "What does break do in a loop?",
      options: [
        "Continues to next iteration",
        "Exits the loop completely",
        "Restarts the loop",
        "Pauses the loop",
      ],
      correctAnswer: 1,
      explanation: "break exits the loop completely and continues with the next statement.",
    },
  ],
  22: [
    {
      question: "How do you access an object property using bracket notation?",
      options: [
        "object.property",
        "object[property]",
        "object->property",
        "object::property",
      ],
      correctAnswer: 1,
      explanation: 'Bracket notation uses square brackets: object[property] or object["property"].',
    },
    {
      question: "What is a method in JavaScript?",
      options: [
        "A variable",
        "A function that belongs to an object",
        "A data type",
        "A loop",
      ],
      correctAnswer: 1,
      explanation: "A method is a function that is a property of an object.",
    },
  ],
  23: [
    {
      question: "What is event bubbling?",
      options: [
        "Events moving from child to parent elements",
        "Events moving from parent to child elements",
        "Multiple events firing at once",
        "Events being cancelled",
      ],
      correctAnswer: 0,
      explanation: "Event bubbling is when events propagate from child elements up to parent elements.",
    },
    {
      question: "What does event.stopPropagation() do?",
      options: [
        "Prevents the default action",
        "Stops event from bubbling up",
        "Removes the event listener",
        "Triggers the event again",
      ],
      correctAnswer: 1,
      explanation: "stopPropagation() prevents the event from bubbling up the DOM tree.",
    },
  ],
  24: [
    {
      question: "What is a callback function?",
      options: [
        "A function that calls itself",
        "A function passed as an argument to another function",
        "A function that returns a value",
        "A function with no parameters",
      ],
      correctAnswer: 1,
      explanation: "A callback function is a function passed as an argument to another function.",
    },
    {
      question: "What are the three states of a Promise?",
      options: [
        "pending, resolved, rejected",
        "waiting, success, failure",
        "loading, complete, error",
        "start, middle, end",
      ],
      correctAnswer: 0,
      explanation: "Promises have three states: pending, fulfilled (resolved), and rejected.",
    },
  ],
  25: [
    {
      question: "What keyword is used to declare an async function?",
      options: ["async", "await", "promise", "function"],
      correctAnswer: 0,
      explanation: "The async keyword is used to declare an asynchronous function.",
    },
    {
      question: "What does await do?",
      options: [
        "Creates a new Promise",
        "Pauses execution until Promise resolves",
        "Rejects a Promise",
        "Cancels a Promise",
      ],
      correctAnswer: 1,
      explanation: "await pauses the execution of an async function until the Promise resolves.",
    },
  ],
  26: [
    {
      question: "What does the Fetch API return?",
      options: ["A string", "A number", "A Promise", "An object"],
      correctAnswer: 2,
      explanation: "The Fetch API returns a Promise that resolves to the Response object.",
    },
    {
      question: "What method is used to parse JSON from a fetch response?",
      options: ["parse()", "json()", "text()", "stringify()"],
      correctAnswer: 1,
      explanation: "The json() method parses the response body as JSON.",
    },
  ],
  27: [
    {
      question: "What is the main difference between localStorage and sessionStorage?",
      options: [
        "localStorage is faster",
        "sessionStorage persists after browser close",
        "localStorage persists after browser close",
        "sessionStorage has more storage space",
      ],
      correctAnswer: 2,
      explanation: "localStorage persists data after the browser is closed, while sessionStorage does not.",
    },
    {
      question: "What method is used to store data in localStorage?",
      options: ["setItem()", "store()", "save()", "put()"],
      correctAnswer: 0,
      explanation: "setItem() is used to store data in localStorage.",
    },
  ],
  28: [
    {
      question: "What does git init do?",
      options: [
        "Creates a new repository",
        "Initializes a new Git repository",
        "Clones a repository",
        "Commits changes",
      ],
      correctAnswer: 1,
      explanation: "git init initializes a new Git repository in the current directory.",
    },
    {
      question: "What does git add do?",
      options: [
        "Commits changes",
        "Stages changes for commit",
        "Creates a new branch",
        "Merges branches",
      ],
      correctAnswer: 1,
      explanation: "git add stages changes to be committed.",
    },
  ],
  29: [
    {
      question: "What is GitHub?",
      options: [
        "A version control system",
        "A web-based Git repository hosting service",
        "A programming language",
        "A text editor",
      ],
      correctAnswer: 1,
      explanation: "GitHub is a web-based Git repository hosting service.",
    },
    {
      question: "What does git push do?",
      options: [
        "Downloads changes from remote",
        "Uploads local commits to remote repository",
        "Creates a new branch",
        "Merges branches",
      ],
      correctAnswer: 1,
      explanation: "git push uploads local commits to the remote repository.",
    },
  ],
  30: [
    {
      question: "What is web hosting?",
      options: [
        "Creating websites",
        "Storing and serving websites on the internet",
        "Designing websites",
        "Programming websites",
      ],
      correctAnswer: 1,
      explanation: "Web hosting is the service of storing and serving websites on the internet.",
    },
    {
      question: "What is GitHub Pages?",
      options: [
        "A version control system",
        "A free static site hosting service",
        "A programming language",
        "A database service",
      ],
      correctAnswer: 1,
      explanation: "GitHub Pages is a free static site hosting service provided by GitHub.",
    },
  ],
};

