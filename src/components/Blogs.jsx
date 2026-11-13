import { PostList } from '../cms/PublicCMS';

const fallbackItems = [
  {
    id: 'fallback-rejection',
    slug: 'why-learning-to-handle-rejection-is-an-important-part-of-growing-up',
    type: 'article',
    locale: 'en',
    category: 'Youth & Careers',
    tags: ['Youth', 'Personal growth', 'Resilience', 'Viksit Bharat'],
    title: 'Why Learning to Handle Rejection Is an Important Part of Growing Up',
    excerpt: "There is a strange feeling that comes with telling people you didn't get selected for something you really wanted."
  },
  {
    id: 'fallback-stable-career',
    slug: 'will-a-stable-career-still-mean-the-same-thing-for-the-next-generation',
    type: 'article',
    locale: 'en',
    category: 'Youth & Careers',
    tags: ['Youth', 'Careers', 'Work', 'Viksit Bharat'],
    title: 'Will a Stable Career Still Mean the Same Thing for the Next Generation?',
    excerpt: 'For many parents, a stable career meant a regular salary, a secure job and the ability to support a family.'
  },
  {
    id: 'fallback-classroom',
    slug: 'what-students-learn-outside-the-classroom-can-shape-their-future-just-as-much',
    type: 'article',
    locale: 'en',
    category: 'Youth & Careers',
    tags: ['Education', 'Youth', 'Life skills', 'Viksit Bharat'],
    title: 'What Students Learn Outside the Classroom Can Shape Their Future Just as Much',
    excerpt: 'Ask a student what they learnt in college today, and you will probably hear about a lecture, an assignment or an upcoming exam.'
  },
  {
    id: 'fallback-entrepreneurs',
    slug: 'can-young-entrepreneurs-help-solve-problems-in-their-own-communities',
    type: 'article',
    locale: 'en',
    category: 'Youth & Careers',
    tags: ['Entrepreneurship', 'Youth', 'Community', 'Viksit Bharat'],
    title: 'Can Young Entrepreneurs Help Solve Problems in Their Own Communities?',
    excerpt: 'Most young people have ideas about what could be better around them.'
  },
  {
    id: 'fallback-passion',
    slug: 'what-happens-when-a-young-persons-passion-does-not-match-their-profession',
    type: 'article',
    locale: 'en',
    category: 'Youth & Careers',
    tags: ['Careers', 'Youth', 'Wellbeing', 'Viksit Bharat'],
    title: "What Happens When a Young Person's Passion Does Not Match Their Profession?",
    excerpt: 'At your job, you spend weekdays attending meetings, completing assignments, or working towards a promotion.'
  },
  {
    id: 'fallback-digital-access',
    slug: 'from-small-towns-to-global-opportunities-how-digital-access-is-changing-young-indians-ambitions',
    type: 'article',
    locale: 'en',
    category: 'Youth & Careers',
    tags: ['Digital access', 'Youth', 'India', 'Viksit Bharat'],
    title: "From Small Towns to Global Opportunities: How Digital Access Is Changing Young Indians' Ambitions",
    excerpt: 'A student from a small town had predictable decisions to make some time ago – study hard, move to a bigger city and find a steady job.'
  }
];

export default function Blogs() {
  return <>
    <PostList title="Blogs & Articles" limit={6} fallbackItems={fallbackItems} />
  </>;
}
