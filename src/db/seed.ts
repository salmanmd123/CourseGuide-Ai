import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { courses, lessons } from "./schema";

const courseData = [
  {
    title: "Python Fundamentals",
    slug: "python-fundamentals",
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
      "Introduction to Python",
      "Variables and Data Types",
      "Operators and Expressions",
      "Conditional Statements",
      "Loops in Python",
      "Functions",
      "Lists and Tuples",
      "Dictionaries and Sets",
      "Object-Oriented Programming",
      "Working with Files",
    ],
  },

  {
    title: "Data Structures & Algorithms",
    slug: "data-structures-and-algorithms",
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
      "Introduction to Data Structures",
      "Arrays",
      "Linked Lists",
      "Stacks",
      "Queues",
      "Trees",
      "Binary Search Trees",
      "Graphs",
      "Sorting Algorithms",
      "Searching Algorithms",
    ],
  },

  {
    title: "Machine Learning Basics",
    slug: "machine-learning-basics",
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
      "Introduction to Machine Learning",
      "Types of Machine Learning",
      "Training and Testing Data",
      "Linear Regression",
      "Logistic Regression",
      "Decision Trees",
      "K-Nearest Neighbors",
      "Clustering",
      "Model Evaluation",
      "Overfitting and Underfitting",
    ],
  },

  {
    title: "SQL & Database Fundamentals",
    slug: "sql-and-database-fundamentals",
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
      "Introduction to Databases",
      "Relational Databases",
      "SQL Basics",
      "SELECT Queries",
      "WHERE and ORDER BY",
      "GROUP BY and HAVING",
      "SQL Joins",
      "Subqueries",
      "Normalization",
      "Database Design",
    ],
  },

  {
    title: "React for Beginners",
    slug: "react-for-beginners",
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
      "Introduction to React",
      "Creating React Applications",
      "Components",
      "JSX",
      "Props",
      "State",
      "Event Handling",
      "Conditional Rendering",
      "React Hooks",
      "Building a React Project",
    ],
  },

  {
    title: "Computer Networks",
    slug: "computer-networks",
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
      "Introduction to Computer Networks",
      "Network Models",
      "OSI Model",
      "TCP/IP Model",
      "IP Addressing",
      "Routing",
      "TCP and UDP",
      "DNS and HTTP",
      "Network Security",
      "Wireless Networks",
    ],
  },
];

async function seed() {
  console.log("🌱 Starting database seed...\n");

  for (const courseDataItem of courseData) {
    const {
      lessons: lessonTitles,
      ...courseValues
    } = courseDataItem;

    await db
      .insert(courses)
      .values(courseValues)
      .onConflictDoNothing({
        target: courses.slug,
      });

    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, courseValues.slug));

    if (!course) {
      throw new Error(
        `Course not found after inserting: ${courseValues.slug}`,
      );
    }

    // Prevent duplicate lessons when seed is run again
    await db
      .delete(lessons)
      .where(eq(lessons.courseId, course.id));

    await db.insert(lessons).values(
      lessonTitles.map((title, index) => ({
        courseId: course.id,
        title,
        description: `Learn ${title.toLowerCase()} with practical examples and simple explanations.`,
        videoUrl: null,
        duration: "20 min",
        order: index + 1,
      })),
    );

    console.log(`✓ ${course.title}`);
  }

  console.log("\n✅ Database seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("\n❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });