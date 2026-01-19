import { Lesson, Rubric, RubricCriteria, RubricLevel } from './types';

const createRubric = (
  id: string,
  name: string,
  description: string,
  criteria: Omit<RubricCriteria, 'id'>[],
  levels: Omit<RubricLevel, 'id'>[]
): Rubric => ({
  id,
  name,
  description,
  criteria: criteria.map((c, index) => ({ ...c, id: `${id}-criteria-${index}` })),
  levels: levels.map((l, index) => ({ ...l, id: `${id}-level-${index}` })),
  totalPoints: levels.reduce((sum, level) => sum + level.points, 0)
});

// Common rubric levels for all lessons
const commonLevels: Omit<RubricLevel, 'id'>[] = [
  {
    name: "Excellent (4)",
    description: "Exceeds expectations with exceptional quality and understanding",
    points: 4,
    color: "bg-green-100 text-green-800 border-green-200"
  },
  {
    name: "Good (3)",
    description: "Meets expectations with good quality and understanding",
    points: 3,
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  {
    name: "Satisfactory (2)",
    description: "Meets basic expectations with adequate quality",
    points: 2,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  {
    name: "Needs Improvement (1)",
    description: "Below expectations, requires significant improvement",
    points: 1,
    color: "bg-red-100 text-red-800 border-red-200"
  }
];

export const lessons: Lesson[] = [
  {
    id: "lesson-01",
    number: 1,
    title: "Introduction to HTML",
    description: "Understanding HTML basics, document structure, and core elements",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-01-01",
        title: "Create Your First Web Page",
        description: "Create a simple HTML document with core elements and view it in a web browser",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-01-01",
          "HTML Basics Assessment",
          "Evaluate student's understanding and implementation of basic HTML structure",
          [
            {
              name: "Document Structure",
              description: "Correctly implements DOCTYPE, html, head, and body elements",
              weight: 25
            },
            {
              name: "Core Elements",
              description: "Uses title, h1, and p elements appropriately",
              weight: 25
            },
            {
              name: "File Management",
              description: "Saves file with correct .html extension and opens in browser",
              weight: 25
            },
            {
              name: "Content Quality",
              description: "Creates meaningful content and follows instructions",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-02",
    number: 2,
    title: "Basic HTML Elements",
    description: "Understanding common HTML elements and their proper usage",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-02-01",
        title: "HTML Elements Practice",
        description: "Create a webpage using various HTML elements including headings, paragraphs, lists, and links",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-02-01",
          "HTML Elements Assessment",
          "Evaluate student's understanding and implementation of basic HTML elements",
          [
            {
              name: "Heading Elements",
              description: "Uses h1-h6 elements appropriately for content hierarchy",
              weight: 25
            },
            {
              name: "Text Elements",
              description: "Implements paragraphs, emphasis, and text formatting elements",
              weight: 25
            },
            {
              name: "List Elements",
              description: "Creates ordered and unordered lists with proper nesting",
              weight: 25
            },
            {
              name: "Link Elements",
              description: "Creates functional links with proper href attributes",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-03",
    number: 3,
    title: "Web Page Formatting and Layout Elements",
    description: "Understanding HTML elements for page structure and layout",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-03-01",
        title: "Page Structure Implementation",
        description: "Create a well-structured webpage using semantic HTML elements",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-03-01",
          "HTML Structure Assessment",
          "Evaluate student's understanding and implementation of HTML page structure",
          [
            {
              name: "Semantic Elements",
              description: "Uses header, nav, main, section, article, and footer elements",
              weight: 25
            },
            {
              name: "Content Organization",
              description: "Organizes content logically with proper element hierarchy",
              weight: 25
            },
            {
              name: "Accessibility",
              description: "Implements proper heading structure and alt attributes",
              weight: 25
            },
            {
              name: "Code Quality",
              description: "Writes clean, well-indented, and commented HTML code",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-04",
    number: 4,
    title: "Apply Styles with Internal CSS",
    description: "Understanding CSS basics and applying styles within HTML documents",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-04-01",
        title: "Internal CSS Implementation",
        description: "Style a webpage using internal CSS with various selectors and properties",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-04-01",
          "Internal CSS Assessment",
          "Evaluate student's understanding and implementation of internal CSS",
          [
            {
              name: "CSS Syntax",
              description: "Uses proper CSS syntax with selectors, properties, and values",
              weight: 25
            },
            {
              name: "Selector Types",
              description: "Implements element, class, and ID selectors correctly",
              weight: 25
            },
            {
              name: "Styling Properties",
              description: "Applies colors, fonts, spacing, and layout properties",
              weight: 25
            },
            {
              name: "Code Organization",
              description: "Organizes CSS code logically and follows best practices",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-05",
    number: 5,
    title: "Apply Styles with External CSS",
    description: "Understanding external CSS files and separation of concerns",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-05-01",
        title: "External CSS Implementation",
        description: "Create and link external CSS files to style multiple web pages",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-05-01",
          "External CSS Assessment",
          "Evaluate student's understanding and implementation of external CSS",
          [
            {
              name: "File Structure",
              description: "Creates separate CSS files and links them properly",
              weight: 25
            },
            {
              name: "CSS Linking",
              description: "Uses proper link tags and file paths for CSS inclusion",
              weight: 25
            },
            {
              name: "Style Consistency",
              description: "Maintains consistent styling across multiple pages",
              weight: 25
            },
            {
              name: "Code Reusability",
              description: "Creates reusable CSS rules and follows DRY principles",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-06",
    number: 6,
    title: "Understand JavaScript Basics",
    description: "Introduction to JavaScript programming fundamentals",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-06-01",
        title: "JavaScript Fundamentals",
        description: "Create JavaScript code demonstrating variables, data types, and basic operations",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-06-01",
          "JavaScript Basics Assessment",
          "Evaluate student's understanding and implementation of JavaScript fundamentals",
          [
            {
              name: "Variables and Data Types",
              description: "Declares variables and uses different data types correctly",
              weight: 25
            },
            {
              name: "Operators",
              description: "Uses arithmetic, comparison, and logical operators",
              weight: 25
            },
            {
              name: "Console Output",
              description: "Uses console.log() and other console methods for output",
              weight: 25
            },
            {
              name: "Code Structure",
              description: "Writes clean, readable JavaScript code with proper syntax",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-07",
    number: 7,
    title: "JavaScript Data Types",
    description: "Understanding JavaScript data types and type conversion",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-07-01",
        title: "Data Types Implementation",
        description: "Demonstrate understanding of JavaScript data types and type conversion",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-07-01",
          "JavaScript Data Types Assessment",
          "Evaluate student's understanding and implementation of JavaScript data types",
          [
            {
              name: "Primitive Types",
              description: "Uses strings, numbers, booleans, null, and undefined correctly",
              weight: 25
            },
            {
              name: "Type Conversion",
              description: "Performs explicit and implicit type conversion",
              weight: 25
            },
            {
              name: "Type Checking",
              description: "Uses typeof operator and other type checking methods",
              weight: 25
            },
            {
              name: "Type Coercion",
              description: "Understands and handles JavaScript type coercion",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-08",
    number: 8,
    title: "JavaScript Arrays",
    description: "Understanding arrays and array methods in JavaScript",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-08-01",
        title: "Array Manipulation",
        description: "Create and manipulate arrays using various array methods",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-08-01",
          "JavaScript Arrays Assessment",
          "Evaluate student's understanding and implementation of JavaScript arrays",
          [
            {
              name: "Array Creation",
              description: "Creates arrays using different methods and initializes with data",
              weight: 25
            },
            {
              name: "Array Methods",
              description: "Uses push, pop, shift, unshift, and other array methods",
              weight: 25
            },
            {
              name: "Array Iteration",
              description: "Iterates through arrays using for loops and array methods",
              weight: 25
            },
            {
              name: "Array Manipulation",
              description: "Modifies array contents and structure effectively",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-09",
    number: 9,
    title: "JavaScript Functions",
    description: "Understanding function declaration, parameters, return values, and scope",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-09-01",
        title: "Function Creation and Usage",
        description: "Create and use JavaScript functions with parameters and return values",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-09-01",
          "JavaScript Functions Assessment",
          "Evaluate student's understanding and implementation of JavaScript functions",
          [
            {
              name: "Function Declaration",
              description: "Properly declares functions using function keyword or arrow syntax",
              weight: 25
            },
            {
              name: "Parameters and Arguments",
              description: "Correctly uses parameters and passes arguments to functions",
              weight: 25
            },
            {
              name: "Return Values",
              description: "Functions return appropriate values and handle return statements",
              weight: 25
            },
            {
              name: "Code Quality",
              description: "Code is clean, readable, and follows best practices",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-10",
    number: 10,
    title: "JavaScript Libraries (jQuery Introduction)",
    description: "Introduction to jQuery library and its benefits",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-10-01",
        title: "jQuery Setup and Basic Usage",
        description: "Set up jQuery and implement basic functionality",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-10-01",
          "jQuery Introduction Assessment",
          "Evaluate student's understanding of jQuery library and basic implementation",
          [
            {
              name: "jQuery Setup",
              description: "Correctly includes jQuery library and sets up basic structure",
              weight: 25
            },
            {
              name: "jQuery Syntax",
              description: "Uses proper jQuery syntax and selectors",
              weight: 25
            },
            {
              name: "Basic Functionality",
              description: "Implements basic jQuery functionality as required",
              weight: 25
            },
            {
              name: "Code Organization",
              description: "Code is well-organized and follows jQuery best practices",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-11",
    number: 11,
    title: "jQuery Syntax and Selectors",
    description: "Understanding jQuery syntax and various selector types",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-11-01",
        title: "jQuery Selectors Implementation",
        description: "Implement various jQuery selectors and demonstrate their usage",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-11-01",
          "jQuery Selectors Assessment",
          "Evaluate student's understanding and implementation of jQuery selectors",
          [
            {
              name: "Basic Selectors",
              description: "Correctly uses element, class, and ID selectors",
              weight: 25
            },
            {
              name: "Advanced Selectors",
              description: "Implements attribute, pseudo-class, and hierarchical selectors",
              weight: 25
            },
            {
              name: "Selector Efficiency",
              description: "Uses efficient selectors and follows best practices",
              weight: 25
            },
            {
              name: "Practical Application",
              description: "Applies selectors effectively in real-world scenarios",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-12",
    number: 12,
    title: "jQuery Events",
    description: "Understanding and implementing jQuery event handling",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-12-01",
        title: "Event Handling Implementation",
        description: "Implement various jQuery event handlers and demonstrate event management",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-12-01",
          "jQuery Events Assessment",
          "Evaluate student's understanding and implementation of jQuery events",
          [
            {
              name: "Event Binding",
              description: "Correctly binds events using jQuery methods",
              weight: 25
            },
            {
              name: "Event Types",
              description: "Implements various event types (click, hover, keypress, etc.)",
              weight: 25
            },
            {
              name: "Event Object Usage",
              description: "Properly uses event object and prevents default behaviors",
              weight: 25
            },
            {
              name: "Event Management",
              description: "Manages event bubbling and delegation effectively",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-13",
    number: 13,
    title: "jQuery DOM Manipulation",
    description: "Understanding DOM manipulation using jQuery methods",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-13-01",
        title: "DOM Manipulation Techniques",
        description: "Implement various DOM manipulation methods using jQuery",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-13-01",
          "jQuery DOM Manipulation Assessment",
          "Evaluate student's understanding and implementation of jQuery DOM manipulation",
          [
            {
              name: "Content Manipulation",
              description: "Uses text(), html(), and val() methods correctly",
              weight: 25
            },
            {
              name: "Element Creation and Insertion",
              description: "Creates and inserts elements using append(), prepend(), etc.",
              weight: 25
            },
            {
              name: "Attribute and Class Management",
              description: "Manages attributes and CSS classes effectively",
              weight: 25
            },
            {
              name: "Dynamic Updates",
              description: "Creates responsive and dynamic user interfaces",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-14",
    number: 14,
    title: "Project 1 Interactive Portfolio",
    description: "Creating an interactive portfolio website with HTML, CSS, and JavaScript",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-14-01",
        title: "Interactive Portfolio Creation",
        description: "Create a complete interactive portfolio website with multiple sections and functionality",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-14-01",
          "Interactive Portfolio Assessment",
          "Evaluate student's ability to create a complete interactive portfolio",
          [
            {
              name: "HTML Structure",
              description: "Creates well-structured HTML with semantic elements",
              weight: 25
            },
            {
              name: "CSS Styling",
              description: "Implements responsive design with modern CSS techniques",
              weight: 25
            },
            {
              name: "JavaScript Functionality",
              description: "Adds interactive features and dynamic content",
              weight: 25
            },
            {
              name: "User Experience",
              description: "Creates intuitive navigation and engaging user interface",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-15",
    number: 15,
    title: "Project 1 Interactive Portfolio Part 2",
    description: "Advanced portfolio features with smooth scrolling and form validation",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-15-01",
        title: "Advanced Portfolio Features",
        description: "Implement smooth scrolling, event handling, and form validation",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-15-01",
          "Advanced Portfolio Assessment",
          "Evaluate student's implementation of advanced portfolio features",
          [
            {
              name: "Smooth Scrolling",
              description: "Implements smooth scrolling navigation between sections",
              weight: 25
            },
            {
              name: "Event Handling",
              description: "Handles user interactions and events effectively",
              weight: 25
            },
            {
              name: "Form Validation",
              description: "Implements client-side form validation with user feedback",
              weight: 25
            },
            {
              name: "User Experience",
              description: "Creates intuitive and responsive user interface",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-16",
    number: 16,
    title: "Responsive Web Design and Media Queries",
    description: "Understanding responsive design principles and implementing media queries",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-16-01",
        title: "Responsive Design Implementation",
        description: "Create a responsive website that works across different screen sizes",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-16-01",
          "Responsive Design Assessment",
          "Evaluate student's understanding and implementation of responsive web design",
          [
            {
              name: "Media Queries",
              description: "Implements media queries for different screen sizes",
              weight: 25
            },
            {
              name: "Flexible Layouts",
              description: "Uses flexible units and layouts that adapt to screen size",
              weight: 25
            },
            {
              name: "Mobile Optimization",
              description: "Optimizes design for mobile devices and touch interfaces",
              weight: 25
            },
            {
              name: "Cross-Device Testing",
              description: "Tests and ensures functionality across different devices",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-17",
    number: 17,
    title: "CSS Grid Layout",
    description: "Understanding and implementing CSS Grid for complex layouts",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-17-01",
        title: "CSS Grid Implementation",
        description: "Create complex layouts using CSS Grid properties",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-17-01",
          "CSS Grid Assessment",
          "Evaluate student's understanding and implementation of CSS Grid",
          [
            {
              name: "Grid Container Setup",
              description: "Properly defines grid containers and basic grid structure",
              weight: 25
            },
            {
              name: "Grid Item Placement",
              description: "Correctly places and spans grid items using grid properties",
              weight: 25
            },
            {
              name: "Responsive Design",
              description: "Creates responsive grid layouts that work across devices",
              weight: 25
            },
            {
              name: "Layout Quality",
              description: "Creates visually appealing and functional layouts",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-18",
    number: 18,
    title: "CSS Animations and Transitions",
    description: "Creating smooth animations and transitions using CSS",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-18-01",
        title: "CSS Animations and Transitions",
        description: "Implement CSS transitions and keyframe animations",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-18-01",
          "CSS Animations Assessment",
          "Evaluate student's understanding and implementation of CSS animations",
          [
            {
              name: "CSS Transitions",
              description: "Implements smooth transitions with proper timing and easing",
              weight: 25
            },
            {
              name: "Keyframe Animations",
              description: "Creates keyframe animations with proper animation properties",
              weight: 25
            },
            {
              name: "Performance Optimization",
              description: "Uses performant animation properties and techniques",
              weight: 25
            },
            {
              name: "User Experience",
              description: "Creates engaging and accessible animations",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-19",
    number: 19,
    title: "Advanced CSS Selectors",
    description: "Understanding complex CSS selectors and specificity",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-19-01",
        title: "Advanced Selector Implementation",
        description: "Implement and demonstrate advanced CSS selectors",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-19-01",
          "Advanced CSS Selectors Assessment",
          "Evaluate student's understanding and implementation of advanced CSS selectors",
          [
            {
              name: "Combinator Selectors",
              description: "Uses descendant, child, and sibling combinators correctly",
              weight: 25
            },
            {
              name: "Attribute Selectors",
              description: "Implements various attribute selectors effectively",
              weight: 25
            },
            {
              name: "Pseudo-classes and Pseudo-elements",
              description: "Uses pseudo-classes and pseudo-elements appropriately",
              weight: 25
            },
            {
              name: "Specificity Understanding",
              description: "Demonstrates understanding of CSS specificity and cascade",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-20",
    number: 20,
    title: "JavaScript Control Flow Conditionals",
    description: "Understanding conditional statements and logical operators",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-20-01",
        title: "Conditional Logic Implementation",
        description: "Implement conditional statements and logical operators",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-20-01",
          "JavaScript Conditionals Assessment",
          "Evaluate student's understanding and implementation of conditional logic",
          [
            {
              name: "if/else Statements",
              description: "Correctly implements if, else if, and else statements",
              weight: 25
            },
            {
              name: "Comparison Operators",
              description: "Uses comparison operators correctly and understands type coercion",
              weight: 25
            },
            {
              name: "Logical Operators",
              description: "Implements logical operators (&&, ||, !) effectively",
              weight: 25
            },
            {
              name: "Ternary Operator",
              description: "Uses ternary operator appropriately for simple conditionals",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-21",
    number: 21,
    title: "JavaScript Control Flow Loops",
    description: "Understanding and implementing various loop structures",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-21-01",
        title: "Loop Implementation",
        description: "Implement various loop types and demonstrate their usage",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-21-01",
          "JavaScript Loops Assessment",
          "Evaluate student's understanding and implementation of loop structures",
          [
            {
              name: "for Loop",
              description: "Correctly implements for loops with proper initialization and conditions",
              weight: 25
            },
            {
              name: "while and do-while Loops",
              description: "Uses while and do-while loops appropriately",
              weight: 25
            },
            {
              name: "Array Iteration",
              description: "Uses for...of and forEach for array iteration",
              weight: 25
            },
            {
              name: "Loop Control",
              description: "Uses break and continue statements effectively",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-22",
    number: 22,
    title: "JavaScript Objects",
    description: "Understanding object creation, properties, and methods",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-22-01",
        title: "Object Creation and Manipulation",
        description: "Create and manipulate JavaScript objects",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-22-01",
          "JavaScript Objects Assessment",
          "Evaluate student's understanding and implementation of JavaScript objects",
          [
            {
              name: "Object Creation",
              description: "Creates objects using object literals and constructor functions",
              weight: 25
            },
            {
              name: "Property Access",
              description: "Accesses and modifies object properties using dot and bracket notation",
              weight: 25
            },
            {
              name: "Object Methods",
              description: "Defines and calls object methods correctly",
              weight: 25
            },
            {
              name: "Object Manipulation",
              description: "Adds, removes, and modifies object properties dynamically",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-23",
    number: 23,
    title: "JavaScript Events Advanced",
    description: "Understanding event flow, delegation, and advanced event handling",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-23-01",
        title: "Advanced Event Handling",
        description: "Implement advanced event handling techniques",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-23-01",
          "Advanced JavaScript Events Assessment",
          "Evaluate student's understanding and implementation of advanced event handling",
          [
            {
              name: "Event Flow",
              description: "Understands and implements event bubbling and capturing",
              weight: 25
            },
            {
              name: "Event Delegation",
              description: "Uses event delegation for dynamic content",
              weight: 25
            },
            {
              name: "Event Control",
              description: "Prevents default actions and stops event propagation",
              weight: 25
            },
            {
              name: "Event Object Usage",
              description: "Effectively uses event object properties and methods",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-24",
    number: 24,
    title: "Asynchronous JavaScript Callbacks and Promises",
    description: "Understanding asynchronous programming with callbacks and promises",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-24-01",
        title: "Asynchronous Programming",
        description: "Implement asynchronous code using callbacks and promises",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-24-01",
          "Asynchronous JavaScript Assessment",
          "Evaluate student's understanding and implementation of asynchronous programming",
          [
            {
              name: "Callback Functions",
              description: "Implements and uses callback functions correctly",
              weight: 25
            },
            {
              name: "Promise Creation",
              description: "Creates and uses promises for asynchronous operations",
              weight: 25
            },
            {
              name: "Promise Handling",
              description: "Uses .then(), .catch(), and .finally() methods",
              weight: 25
            },
            {
              name: "Error Handling",
              description: "Implements proper error handling for asynchronous operations",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-25",
    number: 25,
    title: "Asynchronous JavaScript Async/Await",
    description: "Understanding async/await syntax and modern asynchronous programming",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-25-01",
        title: "Async/Await Implementation",
        description: "Implement asynchronous code using async/await syntax",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-25-01",
          "Async/Await Assessment",
          "Evaluate student's understanding and implementation of async/await",
          [
            {
              name: "async Functions",
              description: "Declares and uses async functions correctly",
              weight: 25
            },
            {
              name: "await Keyword",
              description: "Uses await keyword to handle promise resolution",
              weight: 25
            },
            {
              name: "Error Handling",
              description: "Implements try/catch blocks for async/await error handling",
              weight: 25
            },
            {
              name: "Parallel Execution",
              description: "Uses Promise.all() for parallel async operations",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-26",
    number: 26,
    title: "Introduction to Web APIs and Fetch API",
    description: "Understanding web APIs and making HTTP requests with Fetch",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-26-01",
        title: "Fetch API Implementation",
        description: "Make HTTP requests using the Fetch API",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-26-01",
          "Fetch API Assessment",
          "Evaluate student's understanding and implementation of the Fetch API",
          [
            {
              name: "HTTP Requests",
              description: "Makes GET and POST requests using fetch()",
              weight: 25
            },
            {
              name: "Response Handling",
              description: "Handles responses and converts data formats (JSON, text)",
              weight: 25
            },
            {
              name: "Error Handling",
              description: "Implements proper error handling for API requests",
              weight: 25
            },
            {
              name: "Request Configuration",
              description: "Configures request headers, body, and options",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-27",
    number: 27,
    title: "Client-Side Data Storage",
    description: "Understanding localStorage and sessionStorage for data persistence",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-27-01",
        title: "Data Storage Implementation",
        description: "Implement client-side data storage using localStorage and sessionStorage",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-27-01",
          "Client-Side Storage Assessment",
          "Evaluate student's understanding and implementation of client-side storage",
          [
            {
              name: "localStorage Usage",
              description: "Correctly uses localStorage for persistent data storage",
              weight: 25
            },
            {
              name: "sessionStorage Usage",
              description: "Uses sessionStorage for session-based data storage",
              weight: 25
            },
            {
              name: "Data Serialization",
              description: "Properly serializes and deserializes complex data (JSON)",
              weight: 25
            },
            {
              name: "Storage Management",
              description: "Manages storage limits and implements data cleanup",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-28",
    number: 28,
    title: "Introduction to Version Control with Git",
    description: "Understanding Git basics and version control workflow",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-28-01",
        title: "Git Workflow Implementation",
        description: "Demonstrate Git workflow with basic commands",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-28-01",
          "Git Basics Assessment",
          "Evaluate student's understanding and implementation of Git workflow",
          [
            {
              name: "Repository Setup",
              description: "Initializes Git repository and configures basic settings",
              weight: 25
            },
            {
              name: "File Staging",
              description: "Uses git add to stage files for commit",
              weight: 25
            },
            {
              name: "Commits",
              description: "Creates meaningful commits with descriptive messages",
              weight: 25
            },
            {
              name: "History Management",
              description: "Uses git log and git status to track changes",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-29",
    number: 29,
    title: "Introduction to GitHub and Remote Repositories",
    description: "Understanding GitHub and remote repository management",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-29-01",
        title: "GitHub Repository Management",
        description: "Create and manage GitHub repositories with remote connections",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-29-01",
          "GitHub Assessment",
          "Evaluate student's understanding and implementation of GitHub workflow",
          [
            {
              name: "Repository Creation",
              description: "Creates GitHub repository with proper configuration",
              weight: 25
            },
            {
              name: "Remote Connection",
              description: "Connects local repository to GitHub remote",
              weight: 25
            },
            {
              name: "Push and Pull",
              description: "Uses git push and git pull for synchronization",
              weight: 25
            },
            {
              name: "Collaboration Setup",
              description: "Sets up repository for collaboration and sharing",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  },
  {
    id: "lesson-30",
    number: 30,
    title: "Web Hosting and Deployment",
    description: "Understanding web hosting and deploying static websites",
    duration: "2 Hours",
    exercises: [
      {
        id: "exercise-30-01",
        title: "Website Deployment",
        description: "Deploy static website using GitHub Pages",
        maxPoints: 16,
        rubric: createRubric(
          "rubric-30-01",
          "Web Deployment Assessment",
          "Evaluate student's understanding and implementation of website deployment",
          [
            {
              name: "Deployment Setup",
              description: "Configures GitHub Pages for automatic deployment",
              weight: 25
            },
            {
              name: "Live Website",
              description: "Successfully deploys and accesses live website",
              weight: 25
            },
            {
              name: "Update Process",
              description: "Demonstrates ability to update and redeploy website",
              weight: 25
            },
            {
              name: "Performance Optimization",
              description: "Optimizes website for performance and accessibility",
              weight: 25
            }
          ],
          commonLevels
        )
      }
    ]
  }
];
