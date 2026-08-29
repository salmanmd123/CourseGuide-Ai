export type Lesson = {
  id: number;
  title: string;
  duration: string;
};

export type Course = {
  slug: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  lessonsCount: number;
  rating: string;
  students: string;
  source: string;
  featured: boolean;
  lessons: Lesson[];
};

export const courses: Course[] = [
  {
    slug: "python-fundamentals",
    title: "Python Fundamentals",
    description:
      "Learn Python from the basics with practical examples and beginner-friendly explanations.",
    category: "Programming",
    level: "Beginner",
    duration: "8h 20m",
    lessonsCount: 42,
    rating: "4.9",
    students: "18K",
    source: "YouTube",
    featured: true,

    lessons: [
      { id: 1, title: "Introduction to Python", duration: "10 min" },
      { id: 2, title: "Variables and Data Types", duration: "10 min" },
      { id: 3, title: "Operators and Expressions", duration: "10 min" },
      { id: 4, title: "Conditional Statements", duration: "12 min" },
      { id: 5, title: "Loops in Python", duration: "10 min" },
      { id: 6, title: "Functions", duration: "10 min" },
      { id: 7, title: "Lists and Tuples", duration: "10 min" },
      { id: 8, title: "Dictionaries and Sets", duration: "10 min" },
      {
        id: 9,
        title: "Object-Oriented Programming",
        duration: "10 min",
      },
      { id: 10, title: "Working with Files", duration: "10 min" },
    ],
  },

  {
    slug: "data-structures-and-algorithms",
    title: "Data Structures & Algorithms",
    description:
      "Build a strong foundation in data structures, algorithms, problem solving, and complexity.",
    category: "Computer Science",
    level: "Beginner",
    duration: "12h 10m",
    lessonsCount: 58,
    rating: "4.8",
    students: "24K",
    source: "YouTube",
    featured: true,

    lessons: [
      { id: 1, title: "Introduction to Data Structures", duration: "12 min" },
      { id: 2, title: "Arrays", duration: "14 min" },
      { id: 3, title: "Linked Lists", duration: "15 min" },
      { id: 4, title: "Stacks", duration: "12 min" },
      { id: 5, title: "Queues", duration: "12 min" },
      { id: 6, title: "Trees", duration: "18 min" },
      { id: 7, title: "Binary Search Trees", duration: "16 min" },
      { id: 8, title: "Graphs", duration: "18 min" },
      { id: 9, title: "Searching Algorithms", duration: "15 min" },
      { id: 10, title: "Sorting Algorithms", duration: "20 min" },
    ],
  },

  {
    slug: "machine-learning-basics",
    title: "Machine Learning Basics",
    description:
      "Understand the fundamentals of machine learning, algorithms, datasets, and model evaluation.",
    category: "AI & ML",
    level: "Beginner",
    duration: "9h 45m",
    lessonsCount: 36,
    rating: "4.8",
    students: "16K",
    source: "YouTube",
    featured: true,

    lessons: [
      { id: 1, title: "Introduction to Machine Learning", duration: "12 min" },
      { id: 2, title: "Types of Machine Learning", duration: "14 min" },
      { id: 3, title: "Training and Testing Data", duration: "12 min" },
      { id: 4, title: "Linear Regression", duration: "16 min" },
      { id: 5, title: "Classification", duration: "15 min" },
      { id: 6, title: "Decision Trees", duration: "14 min" },
      { id: 7, title: "K-Means Clustering", duration: "15 min" },
      { id: 8, title: "Model Evaluation", duration: "16 min" },
    ],
  },

  {
    slug: "sql-and-database-fundamentals",
    title: "SQL & Database Fundamentals",
    description:
      "Learn SQL queries, relational databases, joins, normalization, and database concepts.",
    category: "Databases",
    level: "Beginner",
    duration: "7h 30m",
    lessonsCount: 31,
    rating: "4.7",
    students: "12K",
    source: "YouTube",
    featured: false,

    lessons: [
      { id: 1, title: "Introduction to Databases", duration: "10 min" },
      { id: 2, title: "SQL Basics", duration: "12 min" },
      { id: 3, title: "SELECT Queries", duration: "12 min" },
      { id: 4, title: "WHERE and ORDER BY", duration: "10 min" },
      { id: 5, title: "Joins", duration: "15 min" },
      { id: 6, title: "Grouping and Aggregation", duration: "13 min" },
      { id: 7, title: "Normalization", duration: "14 min" },
    ],
  },

  {
    slug: "react-for-beginners",
    title: "React for Beginners",
    description:
      "Build modern web interfaces with React and understand components, state, props, and hooks.",
    category: "Web Development",
    level: "Beginner",
    duration: "10h 15m",
    lessonsCount: 47,
    rating: "4.9",
    students: "31K",
    source: "YouTube",
    featured: false,

    lessons: [
      { id: 1, title: "Introduction to React", duration: "12 min" },
      { id: 2, title: "Creating Components", duration: "14 min" },
      { id: 3, title: "Props", duration: "12 min" },
      { id: 4, title: "State", duration: "15 min" },
      { id: 5, title: "Event Handling", duration: "12 min" },
      { id: 6, title: "Conditional Rendering", duration: "10 min" },
      { id: 7, title: "Lists and Keys", duration: "11 min" },
      { id: 8, title: "React Hooks", duration: "18 min" },
    ],
  },

  {
    slug: "computer-networks",
    title: "Computer Networks",
    description:
      "Understand networking fundamentals including protocols, TCP/IP, routing, and network security.",
    category: "Computer Science",
    level: "Intermediate",
    duration: "6h 50m",
    lessonsCount: 29,
    rating: "4.7",
    students: "9K",
    source: "YouTube",
    featured: false,

    lessons: [
      { id: 1, title: "Introduction to Computer Networks", duration: "12 min" },
      { id: 2, title: "Network Models", duration: "14 min" },
      { id: 3, title: "OSI Model", duration: "16 min" },
      { id: 4, title: "TCP/IP Model", duration: "15 min" },
      { id: 5, title: "IP Addressing", duration: "14 min" },
      { id: 6, title: "Routing", duration: "15 min" },
      { id: 7, title: "Network Security", duration: "16 min" },
    ],
  },
];

export function getCourseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug);
}