import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { configFromEnv } from './config.js';
import { Content } from './models.js';
import { initializeDatabase, pool } from './mysqlStore.js';
import { manifest, validateContent } from './validation.js';

const textField = (label, value) => ({ label, type: 'text', value, hiValue: '' });
const linkField = (label, value) => ({ label, type: 'link', value, hiValue: '#' });

const newFields = {
  Footer: {
    f28: textField('Heading: Learning. Leading. Giving Back.', 'Learning. Leading. Giving Back.'),
    f29: textField('Text: Learning. Leading. Giving Back introduction', 'I believe that life is about more than what we achieve for ourselves. It is about the opportunities we create, the people we empower, and the difference we leave behind. My journey continues to be guided by a simple purpose: to keep learning, keep contributing, and do my part in building a better tomorrow.'),
    f30: textField("Heading: Let's Stay Connected", "Let's Stay Connected"),
    f31: textField("Text: Let's Stay Connected introduction", "I believe good conversations can lead to great ideas. I'd love to hear your thoughts, perspectives, and aspirations."),
    f32: textField('Button: Connect With Me', 'Connect With Me'),
    f33: linkField('Link: /connect', '/connect')
  },
  Hero: {
    f14: textField('Heading: Thought Leadership | Ideas, Perspectives & Experiences', 'Thought Leadership | Ideas, Perspectives & Experiences'),
    f15: textField('Button: Explore My Perspectives', 'Explore My Perspectives'),
    f16: linkField('Link: /thought-leadership', '/thought-leadership')
  },
  vision2047: {
    f41: textField('FAQs · answer: Transforming education', 'If I had to choose one, it would be transforming how we educate our young people. I want our classrooms to encourage curiosity, independent thinking, and practical learning rather than focusing only on marks and degrees. When students learn to solve problems, take initiative, and create opportunities, they become active contributors to the nation\'s progress. That, to me, is where meaningful change begins.'),
    f42: textField('FAQs · answer: Preparing for 2047', 'I believe we have made considerable progress, but there is still a long way to go. Technology, industries, and career opportunities are evolving rapidly, and our institutions must keep pace. I would like to see greater emphasis on practical skills, industry exposure, research, and entrepreneurship. Education should prepare young people for challenges we may not even be able to predict today.'),
    f43: textField('FAQs · answer: Supporting young people', 'I think we recognise the potential of our young population, but recognising it and nurturing it are two different things. Many talented young Indians still struggle with limited access to quality education, mentorship, and opportunities. I believe we need to create an environment where talent receives the right support, regardless of someone\'s background or hometown. Our young people deserve more than encouragement; they deserve genuine opportunities.'),
    f44: textField('FAQs · question: Entrepreneurship and India 2047', 'Why do you place so much importance on entrepreneurship in your vision for India 2047?'),
    f45: textField('FAQs · answer: Entrepreneurship and India 2047', 'I\'ve always believed that a strong nation needs people who can create opportunities, not just seek them. Entrepreneurship encourages young people to think independently, identify problems, and develop solutions. But I also understand that starting something new comes with risks. That\'s why I want our educational institutions to provide mentorship, practical exposure, and the confidence to turn promising ideas into sustainable ventures.'),
    f46: textField('FAQs · question: A successful Viksit Bharat', 'What kind of India would make you feel that the vision of Viksit Bharat 2047 has truly succeeded?'),
    f47: textField('FAQs · answer: A successful Viksit Bharat', 'For me, success would mean an India where a child\'s future is not limited by their family\'s income or where they were born. I would like to see quality education, accessible healthcare, meaningful employment, and opportunities reaching every part of the country. If young Indians feel confident about their future and have the means to shape it, I would consider that real progress.')
  },
  EducationPage: {
    f41: textField('FAQs · question: Education system challenge', "What do you think is the biggest challenge facing India's education system today?"),
    f42: textField('FAQs · answer: Education system challenge', 'In my experience, one of the biggest challenges is bridging the gap between classroom learning and the skills required in the real world. We have talented students and dedicated educators, but access to quality learning opportunities remains uneven. I believe we need stronger industry-academia partnerships, greater emphasis on practical training, and institutions that encourage curiosity rather than focusing entirely on examinations.'),
    f43: textField('FAQs · question: Success in education', 'After establishing so many institutions, what does success in education mean to you personally?'),
    f44: textField('FAQs · answer: Success in education', 'For me, success has never been about the number of institutions established or degrees awarded. It is about seeing students grow into confident, capable individuals who can make their own decisions and contribute to society. When a student from a smaller town finds an opportunity they once thought was beyond their reach, I feel our efforts have served their purpose. That is what continues to motivate me.'),
    f45: textField('FAQs · answer: How students learn and think', 'I think the biggest change is that students today are far more aware of the opportunities available to them. They are curious, ambitious, and willing to explore unconventional careers. However, their expectations from education have also changed. They want practical knowledge, industry exposure, and skills they can actually use. I believe our institutions must recognise this shift and evolve to meet their aspirations.'),
    f46: textField('FAQs · answer: Is a degree enough?', "A degree is important, but I don't believe it guarantees success anymore. The world is changing rapidly, and employers increasingly value practical skills, adaptability, and problem-solving abilities. I always encourage students to look beyond textbooks, explore their interests, and gain real-world experience. Education should give young people the confidence to apply what they know, not just a qualification to display."),
    f47: textField('FAQs · answer: Encouraging entrepreneurship', "I've always felt that students should have the freedom to explore their own ideas rather than see employment as their only option. Entrepreneurship teaches young people to identify problems, take initiative, and find solutions. That's why I support Startup Cells within institutions, where students can receive guidance and practical exposure. Even if they don't start a business, the ability to think independently will benefit them throughout their careers.")
  },
  Thoughtleadershippage: {
    f40: textField('Heading: Ideas Shaped by Experience', 'Ideas Shaped by Experience'),
    f41: textField('Heading: Lessons from My Journey', 'Lessons from My Journey'),
    f42: textField('Subheading: Experience Is the Greatest Teacher', 'Experience Is the Greatest Teacher'),
    f43: textField('Text: Experience Is the Greatest Teacher', 'Nearly three decades of establishing and managing institutions have taught me that meaningful progress requires patience, adaptability, and teamwork.\n\nNot every decision has worked as expected, but every challenge has offered something to learn. I believe success comes from staying committed to your purpose while remaining open to change.'),
    f44: textField('Subheading: Perspectives Worth Sharing', 'Perspectives Worth Sharing'),
    f45: textField('Theme description: Education & Skills', 'I believe education must go beyond degrees and prepare young people with practical skills, confidence, and independent thinking.'),
    f46: textField('Theme description: Entrepreneurship & Innovation', 'I want to encourage more young Indians to explore their ideas, take initiative, and create opportunities for themselves and others.'),
    f47: textField('Theme description: Leadership & Institution Building', 'My experiences have taught me the importance of strong teams, shared values, and building institutions that continue to make a difference.'),
    f48: textField("Theme description: Technology & India's Future", "I believe technology, particularly AI, can open new possibilities for India's youth if we prepare them with the right skills."),
    f49: textField('Heading: My Thoughts on What Matters', 'My Thoughts on What Matters'),
    f50: textField('Text: My Thoughts on What Matters', "Here, I share my experiences and perspectives on leadership, education, entrepreneurship, and the ideas shaping India's future."),
    f51: textField('Button: Explore My Articles', 'Explore My Articles')
  },
  Nationbuildingpage: {
    f37: textField('FAQs · question: Turning policy into results', "What is the biggest challenge in turning India's development policies into meaningful results?"),
    f38: textField('FAQs · answer: Turning policy into results', "In my experience, the biggest challenge often lies in implementation. A policy may have the right intention, but its success depends on resources, coordination, and the ability of institutions to deliver. I believe we need to pay greater attention to what happens on the ground, listen to the people affected, and remain willing to improve our approach when something isn't working."),
    f39: textField('FAQs · question: Citizen contributions to nation building', 'How can ordinary citizens contribute to nation building without holding positions of power or influence?'),
    f40: textField('FAQs · answer: Citizen contributions to nation building', "I've always believed that contributing to the nation doesn't require a particular position or title. A teacher who inspires students, an entrepreneur who creates jobs, or a young person who helps improve their community is already making a difference. I think nation-building becomes truly meaningful when we stop seeing it as someone else's responsibility and begin recognising the value of our own contributions."),
    f41: textField('FAQs · answer: Nation building beyond policy', 'For me, nation building begins with the work we do every day. It is about providing quality education, making healthcare accessible, creating employment opportunities, and strengthening communities. I believe governments can create the right policies, but institutions, businesses, and individuals must help turn those policies into reality. Every meaningful contribution, however small, plays a part in shaping a stronger India.'),
    f42: textField('FAQs · answer: Lessons from building institutions', "One thing I've learned is that progress takes more than good intentions. Even well-designed policies need strong institutions and committed people to make them work. I've seen how access to education and healthcare can change opportunities for entire communities. These experiences have strengthened my belief that India's development must be measured by the difference it makes in people's everyday lives."),
    f43: textField("FAQs · answer: India's youth and Viksit Bharat", "I believe our young people should be active participants in shaping India's future, not simply beneficiaries of its progress. We need to encourage them to think independently, develop practical skills, explore entrepreneurship, and take responsibility for the communities around them. If we give young Indians the right opportunities and confidence today, they can become the innovators, leaders, and changemakers of tomorrow.")
  },
  Updevelopmentpage: {
    f39: textField('FAQs · question: ODOP and startup support', 'How can initiatives like ODOP and startup support programmes benefit young entrepreneurs?'),
    f40: textField('FAQs · answer: ODOP and startup support', 'I believe initiatives like ODOP demonstrate that economic opportunities do not have to be concentrated in major cities. Every district has its own strengths, skills, and entrepreneurial potential. With better market access, mentorship, technology, and financial support, young people can build businesses around local opportunities. I see tremendous value in encouraging entrepreneurship that creates employment while preserving and strengthening regional industries.'),
    f41: textField('FAQs · question: Sports and smaller districts', 'What role can sports play in the development of smaller cities and districts?'),
    f42: textField('FAQs · answer: Sports and smaller districts', "I've always believed that sports can change a young person's outlook on life. Beyond physical fitness, they teach discipline, resilience, teamwork, and the importance of consistent effort. In smaller cities, access to proper training facilities and competitive platforms can make a significant difference. I would like to see talented young athletes receive opportunities based on their abilities rather than their geographical or financial circumstances."),
    f43: textField("FAQs · answer: Uttar Pradesh's development journey", "Uttar Pradesh has been an important part of my personal and professional journey. Having established educational institutions here, I've witnessed how access to quality education and infrastructure can influence entire communities. What interests me most is how development is gradually reaching smaller cities and districts. I believe this shift can create meaningful opportunities for young people who previously had limited options close to home."),
    f44: textField('FAQs · answer: Medical colleges and development', 'I believe medical colleges serve two important purposes. They create opportunities for students to pursue medical education and help strengthen the healthcare ecosystem around them. When medical institutions expand into smaller districts, they can support local healthcare services, generate employment, and encourage professional development. However, I also believe infrastructure must be supported by qualified faculty, practical training, and adequate medical facilities.'),
    f45: textField('FAQs · answer: Vocational education', 'Not every young person wants to follow the same academic or professional path, and I believe our education system should respect that. Vocational education provides opportunities to develop practical, industry-relevant skills and pursue meaningful careers. I would like to see stronger connections between training institutes and employers so that students can translate their learning into employment, entrepreneurship, or further professional growth.')
  },
  Mediapage: {
    f72: textField('Heading: My Journey in the Spotlight', 'My Journey in the Spotlight'),
    f73: textField('Text: My Journey in the Spotlight', 'A collection of news features, interviews, and media coverage highlighting my journey, experiences, and contributions across education, entrepreneurship, healthcare, and social development.')
  }
};

const contentUpdates = {
  Hero: {
    f12: "I believe every experience offers a lesson, and every meaningful conversation brings a fresh perspective. Over the years, my journey in education, entrepreneurship, and leadership has shaped my vision. Through this space, I aim  to share insights, experiences, and ideas on education, innovation, youth empowerment, and issues shaping India's future"
  },
  Navbar: {
    f22: 'GALLERY'
  },
  YouthConnect: {
    f2: "You've established several educational institutions and ventured into healthcare and sports. What has kept you motivated throughout this journey?",
    f3: "For me, it has never been about how many institutions I could establish. It has always been about the difference they could make. Over the past three decades, I've been fortunate to work with people who share this vision. I've learned that you cannot build something meaningful alone. You need the right people, a shared purpose, and the patience to see your efforts grow. What keeps me going is knowing that there are still so many lives we can positively impact.",
    f4: "What do you think young Indians need today that perhaps wasn't as important a decade ago?",
    f5: "I think today's young people have tremendous potential, but they are also navigating a world that is changing faster than ever. A degree alone is no longer enough. They need practical skills, exposure to new technologies, good mentors, and the confidence to think independently. More importantly, I want young Indians to believe that they don't always have to wait for someone to offer them an opportunity. With the right knowledge and determination, they can create one themselves.",
    f6: "You've worked across education, healthcare, and sports. Why did you choose to explore such different fields instead of focusing on just one?",
    f7: "I understand why people ask me this, but I've never looked at these fields as completely separate. To me, they are all connected by one purpose: creating opportunities where they are needed most.\n\nA young student needs access to quality education. A family needs dependable healthcare. A talented sportsperson needs a platform to prove their abilities. The challenges may be different, but the intention behind addressing them remains the same.\n\nI've always believed that if you have the ability to make a difference in more than one area, you shouldn't limit yourself simply for the sake of staying in one field.",
    f8: 'Do you think young Indians are too focused on government jobs and financial security rather than entrepreneurship?',
    f9: "I don't think there's anything wrong with wanting a secure future. Every young person has different responsibilities, circumstances, and aspirations, and we must respect that.\n\nHowever, I do believe we need to encourage more young Indians to look beyond conventional career paths. Entrepreneurship should not feel like an option reserved for people with financial backing or family businesses.\n\nI want our education system to give students the confidence, practical knowledge, and support to explore their own ideas. A secure job is a respectable ambition, but so is creating something that might one day provide jobs to others.",
    f10: 'What is one mistake you often see young people make when pursuing their ambitions?',
    f11: "I think one of the biggest mistakes is expecting success too quickly. We live in a time when we see everyone's achievements, but rarely the years of effort behind them.\n\nI often tell young people not to compare the beginning of their journey with someone else's years of experience. Everyone has a different starting point, and that's perfectly fine.\n\nFocus on learning, improving your skills, and doing your work sincerely. There will be setbacks, and some plans may not work out. But I've learned that patience, consistency, and the willingness to keep learning can take you much further than the pressure to succeed overnight.",
    f13: 'Baat karni se baat banti hai'
  },
  Footer: {

    f2: '/',
    f3: 'My Journey',
    f4: '/journey',
    f5: 'Thought Leadership',
    f6: '/thought-leadership',
    f7: 'Sewa',
    f8: '/sewa',
    f9: 'Youth Connect',
    f10: '/#youth-connect',
    f11: 'Contact',
    f12: '/connect'
  },
  JourneyPage: {
    f15: "When I started my journey, I never imagined that one day I would be associated with so many educational institutions. All I knew was that there was a problem I wanted to address. I had seen bright, ambitious students in cities like Kanpur and Lucknow struggle to find the right educational opportunities. They had the talent and determination to succeed, but often lacked the resources and guidance to pursue their dreams.\n\nThat stayed with me.",
    f16: "When I founded the Maharana Pratap Group of Institutions in 1996, my goal was simple: to make quality education more accessible to young people, regardless of where they came from. I strongly believed that a student's potential should never be limited by their hometown or circumstances.\n\nOf course, turning that belief into reality required more than good intentions. It meant creating institutions with capable teachers, the right infrastructure, and an environment where students could learn, grow, and prepare for the future with confidence.",
    f17: 'Looking back, I realise that I never approached this journey with a fixed roadmap of where I wanted to be thirty years later. I focused on what needed to be done at the time and tried to do it to the best of my ability. One step led to another, and each experience taught me something new.',
    f18: 'What began with a desire to address an education gap gradually became a lifelong commitment to creating opportunities. That belief continues to guide me in everything I do today.',
    f20: 'For me, education has never been just a profession or a field of work. I have always seen it as one of the most meaningful ways to bring about change in society.',
    f21: 'Over the past three decades, I have had the opportunity to establish schools, colleges, and a university, each with its own journey and challenges. But through it all, one belief has remained constant: every child deserves the freedom and opportunity to discover their potential, regardless of their background, circumstances, or the expectations placed upon them.',
    f22: "I have always felt that education should do more than prepare students for examinations or help them secure jobs. It should encourage them to think independently, explore their interests, question what they don't understand, and develop the confidence to make their own decisions.",
    f23: 'When our first school was inaugurated by former Prime Minister Atal Bihari Vajpayee Ji in 1997, it marked the beginning of a journey that continues to shape my life today. What started with a commitment to making quality education accessible has gradually grown into a larger vision of preparing young people for the opportunities and responsibilities of a changing India.\n\nI believe institutions must evolve with time, but the values they stand for should remain strong. Along with knowledge and skills, we must nurture integrity, compassion, curiosity, and a sense of responsibility towards society.',
    f24: 'Even after all these years, I feel there is so much more to be done. And if my efforts can help even a few more young people believe in themselves and pursue a future they once thought was beyond their reach, I would consider that a journey worth continuing.',
    f28: 'The name Maharana Pratap has always held a special meaning for me. His courage, self-respect, determination, and commitment to serving others are values I deeply admire. When I chose to name our institutions after him, it was more than a tribute. It was a responsibility to uphold those ideals through our work. Over the years, I have tried to ensure that every institution carrying his name reflects these values, not just in what we teach, but in how we educate, support, and prepare young people for life.',
    f30: 'My journey has always been closely connected to where I come from. Growing up, I saw how talented and hardworking young people in cities like Kanpur and Lucknow often struggled to find the opportunities they deserved. Many had the ambition to achieve something meaningful but lacked access to quality education and the right guidance.\n\nThose experiences shaped my thinking and eventually inspired me to take my first steps into education. Even today, I believe that where a person comes from should never determine how far they can go.',
    f32: "Over the years, I have been fortunate to receive honours such as the Yuva Udyami Puraskar, Jagran Ratna, and Yuva Sikshavid award. Each recognition has been encouraging, but I have never considered awards the true measure of my work.\n\nFor me, the greatest satisfaction comes from seeing students achieve their dreams, families find new opportunities, and institutions continue to make a difference in people's lives. These recognitions remind me of the responsibility that comes with my work and motivate me to keep contributing with the same dedication and purpose."
  },
  vision2047: {
    f18: 'What is the one change you believe India needs most to become a developed nation by 2047?',
    f19: "Do you think India's education system is ready to prepare students for the challenges of 2047?",
    f20: "Everyone talks about India's youth being its greatest strength. But are we doing enough to support them?",
    f14: 'I believe institutions, including my own, should be judged by their impact, not just their promises.',
    f27: 'Looking at how far India has come in the last few decades, I feel immense pride and optimism about what lies ahead. Our progress in technology and digital infrastructure has shown that we have the ability to find solutions to challenges that once seemed impossible. The success of initiatives like UPI is a reminder that when we think differently and act with determination, we can create solutions that benefit millions.',
    f28: "I believe we need to bring that same ambition and confidence into our education system. Rather than simply following models developed elsewhere, we have an opportunity to build institutions that respond to India's unique strengths, challenges, and aspirations. Our young people deserve an education that prepares them not just for the world as it exists today, but for the possibilities of tomorrow.\n\nAs India approaches 100 years of independence in 2047, I hope to see a generation that looks beyond traditional career paths and has the confidence to create opportunities for itself and others. I want our classrooms to encourage innovation, entrepreneurship, and independent thinking, where students are as excited about starting something of their own as they are about securing a good job.",
    f29: "For me, Viksit Bharat is not simply about economic growth or technological progress. It is about building an India where every young person has the knowledge, confidence, and opportunity to contribute to the nation's future. And I believe education will play the most important role in making that vision a reality.",
    f33: "My Thoughts on India's Road to 2047",
    f34: "I believe India's future lies in the hands of its youth. Here, I share my thoughts on empowering young minds to innovate, lead, and shape a stronger India by 2047."
  },
  EducationPage: {
    f7: "You've spent nearly three decades in education. What is the biggest change you've seen in how students learn and think?",
    f8: 'Do you think a college degree is still enough to build a successful career?',
    f9: 'Why do you believe entrepreneurship should be encouraged within educational institutions?',
    f17: 'What began with the establishment of the Maharana Pratap Group of Institutions in 1996 has gradually grown into a network of educational institutions across different disciplines. Today, our institutions offer education in engineering, management, pharmacy, dental sciences, and other fields across Kanpur and Lucknow, with a shared commitment to quality education and practical learning.\n\nThis journey also includes five Pratap International Schools across Delhi and Kanpur. I have always believed that a strong educational foundation begins early, when children develop curiosity, confidence, and the values that shape their character.',
    f18: 'In 2011, we established Pratap University in Jaipur, spread across a 100-acre campus, with the vision of providing multidisciplinary education that prepares students for evolving industry needs and future opportunities.\n\nOur efforts have also extended into healthcare through Maharana Pratap Hospital and Medicity. For me, education and healthcare have always been closely connected. Both play an important role in helping individuals and communities lead healthier, more independent, and fulfilling lives.',
    f25: "Over the years, my understanding of education has evolved, but one belief has remained unchanged: a degree should open doors to opportunities, not mark the end of learning.\n\nI have always wanted our institutions to prepare students for more than just examinations and employment. This is why I strongly believe in encouraging entrepreneurship and creating Startup Cells within educational institutions, where young people can explore ideas, develop practical skills, and gain the confidence to build something of their own.",
    f26: 'I also believe that learning should not be limited to a single discipline. The challenges our young people will face in the coming decades will require knowledge from different fields, creative thinking, and the ability to adapt. Whether it is technology, management, science, or public policy, students should have the freedom to explore connections between subjects and develop a broader understanding of the world.\n\nFor me, the purpose of education is to nurture individuals who can think independently, take responsibility, and contribute meaningfully to society.',
    f28: 'Having spent nearly three decades establishing and managing educational institutions, I have come to understand that good intentions and well-designed policies do not always translate into meaningful results.\n\nI have seen how challenges in implementation, limited resources, and changing regulations can affect institutions, educators, and students. These experiences have taught me that education reform must consider what actually happens inside classrooms and campuses.',
    f29: 'My interest in the National Education Policy, vocational education, and improving access to quality learning comes from these experiences. I believe policies should be practical, inclusive, and responsive to the needs of students and educators.\n\nFor me, meaningful reform is not simply about introducing new guidelines. It is about ensuring that those changes create better learning environments, stronger institutions, and more opportunities for young people.',
    f31: "When I look back at the institutions we have established over the years, I don't measure their success only by the number of campuses, courses, or students enrolled. What matters most to me is how these institutions have influenced the lives of the people associated with them.\n\nI have seen students from smaller cities gain the confidence to pursue careers they once considered beyond their reach. I have seen families place their trust in education as a way to create better opportunities for the next generation. And I have seen how access to learning can gradually change the aspirations of an entire community.\n\nThese experiences have strengthened my belief that education can create an impact far beyond the classroom.\n\nFor me, the true achievement of an institution lies not in how much it grows, but in how many lives it helps move forward.",
    f33: 'Beyond the Classroom: Questions That Matter'
  },
  Thoughtleadershippage: {
    f8: 'Education & Skills',
    f9: 'Entrepreneurship & Innovation',
    f10: 'Leadership & Institution Building',
    f11: "Technology & India's Future",
    f12: '',
    f34: 'Thought Leadership',
    f35: "Over the past three decades, my journey through education, entrepreneurship, healthcare, and sports has shaped the way I think and approach challenges. I believe every experience brings a lesson worth sharing. Through this space, I hope to encourage meaningful conversations about leadership, opportunities, and India's future. I've learned that leadership is not about having all the answers. It is about listening to people, understanding different perspectives, and making decisions with responsibility.\n\nFor me, good leadership means building trust, encouraging new ideas, and creating an environment where people have the confidence to grow and contribute.",
    f36: 'Ideas That Matter to Me'
  },
  Nationbuildingpage: {
    f11: 'What does nation building mean to you beyond government policies and national programmes?',
    f12: "You've spent nearly three decades establishing institutions. What has this experience taught you about India's development?",
    f13: "What role should India's youth play in achieving the vision of Viksit Bharat 2047?",
    f20: "I believe India's progress depends not only on the policies we introduce but also on how effectively they improve people's lives. Our schools, colleges, hospitals, and public institutions have an important role in turning national ambitions into meaningful change.\n\nHaving spent nearly three decades establishing and managing institutions, I've seen how policies translate into everyday realities, the challenges that arise during implementation, and the difference that thoughtful decisions can make.\n\nThrough this space, I want to share my experiences and perspectives on strengthening institutions, creating opportunities, and contributing to India's development in ways that make a real difference on the ground.",
    f23: 'Viksit Bharat 2047: The Bigger Picture',
    f24: "When I think about Viksit Bharat 2047, I see more than an ambitious national goal. I see an opportunity for every Indian to contribute towards building a stronger, more capable, and self-reliant nation.\n\nI believe the young people studying in our classrooms today will play a defining role in shaping the India of 2047. That places an important responsibility on those of us working in education, healthcare, and other sectors to prepare them for the opportunities and challenges ahead.",
    f25: 'For me, nation building is not limited to government policies or large-scale initiatives. It is also about the everyday decisions we make, the institutions we strengthen, and the opportunities we create for others.\n\nThe India we aspire to become in 2047 will depend on the work we are willing to do today.',
    f29: "Conversations on India's Progress",
    f30: 'My Perspectives on Building a Stronger India',
    f31: "I share my thoughts on India's development, the role of strong institutions, and how collective efforts can turn national ambitions into meaningful progress for every citizen."
  },
  Updevelopmentpage: {
    f18: "What makes Uttar Pradesh's development journey particularly significant to you?",
    f19: "How can expanding medical colleges contribute to Uttar Pradesh's overall development?",
    f20: "Why do you consider vocational education important for the future of Uttar Pradesh's youth?",
    f6: 'The expansion of medical education in Uttar Pradesh is an important step towards improving access to healthcare and professional education.',
    f7: '',
    f8: '#',
    f9: 'In the 2024–25 academic session, the state planned to establish 14 new medical colleges, with the potential to add approximately 1,400 MBBS seats across districts including Kushinagar, Kaushambi, Sultanpur, Amethi, Kanpur Dehat, and Lalitpur.',
    f10: "Having worked in education for many years, I understand how access to institutions closer to home can change a student's future. Expanding medical education beyond major cities can create opportunities for aspiring doctors while strengthening healthcare services in underserved regions.",
    f11: '',
    f13: "I have always believed that education must prepare young people for practical challenges, not just examinations.\n\nUttar Pradesh's efforts to modernise Industrial Training Institutes (ITIs), introduce industry-relevant courses, and strengthen vocational training reflect an important shift towards skill-based education.\n\nFor students who want to enter the workforce early or pursue technical careers, these initiatives can open new opportunities. However, I believe their success will depend on the quality of training, industry partnerships, and the employment opportunities available after students complete their courses.",
    f15: "One of Uttar Pradesh's greatest strengths is the diversity of skills, crafts, and industries found across its districts.\n\nThe One District One Product (ODOP) initiative has brought greater attention to local products and traditional industries, while the growing startup ecosystem is encouraging young entrepreneurs to explore new business opportunities.\n\nI believe these efforts are particularly important for smaller cities, where talented individuals often have ideas and skills but limited access to mentorship, funding, and markets.\n\nFor me, real progress will come when more young people can turn their knowledge and ideas into sustainable businesses without feeling compelled to move to larger cities.",
    f17: "I believe sports play an important role in developing confidence, discipline, teamwork, and leadership among young people.\n\nUttar Pradesh's growing investment in sports facilities, training centres, and competitive opportunities can help talented athletes pursue their ambitions with greater confidence.\n\nMy own involvement in sports has strengthened my understanding of how important structured opportunities are for young athletes. Talent exists in every part of our country, but talent alone is not enough. Young sportspersons need access to quality coaching, proper facilities, competitive exposure, and consistent encouragement.\n\nI would like to see more young athletes from smaller towns receive the support they need to compete at higher levels.",
    f26: 'A Case Study Worth Understanding',
    f27: "Over the years, I've witnessed significant changes in Uttar Pradesh's approach to education, skill development, entrepreneurship, and infrastructure. Having spent nearly three decades establishing institutions in the state, I've seen both the challenges that held people back and the opportunities that thoughtful development can create.\n\nI believe Uttar Pradesh's progress offers important lessons in how policies, institutional investment, and local participation can work together to create meaningful change.",
    f31: 'Understanding Progress, Exploring Possibilities'
  },
  Sewapage: {
    f10: "I have always believed that serving society is not limited to acts of charity. It is about understanding people's challenges and creating opportunities that can make a lasting difference in their lives.\n\nWhether through education, scholarships, healthcare, or mentorship, my efforts have been guided by one simple belief: everyone deserves a fair opportunity to grow, regardless of their background or circumstances.",
    f11: 'For me, Sewa is about turning this belief into meaningful action and encouraging others to become part of that journey.',
    f12: 'The Circle We Are Building',
    f13: 'I believe the true value of education becomes even greater when those who have benefited from it help others move forward.',
    f14: 'The One Graduate, One Learner initiative reflects this thought by connecting graduates from our institutions with first-generation learners who may need additional guidance and encouragement.\n\nThrough mentorship, academic support, and career guidance, the idea is to help young people navigate challenges with greater confidence.',
    f15: 'The initiative has connected over 200 graduate mentors with first-generation learners across our institutions in Kanpur, Lucknow, and Jaipur. For me, what makes this effort meaningful is the opportunity to create a continuing cycle of learning, support, and giving back.',
    f18: 'I have always encouraged young people to think beyond conventional career paths and explore the possibility of creating something of their own.\n\nWhile scholarships can help students access education, aspiring entrepreneurs often need additional guidance and support to turn their ideas into reality.',
    f19: 'Startup Cells',
    f20: 'Through Startup Cells in our institutions, we aim to encourage promising student ventures by providing mentorship, opportunities to connect with experienced professionals, and access to limited seed funding for eligible ideas.\n\nI believe even a small amount of support at the right time can give a young person the confidence to take their first step towards entrepreneurship.',
    f22: "For me, the purpose of any scholarship or support programme is to make a genuine difference in someone's educational journey. Our scholarship initiatives are intended to help deserving students continue their education by supporting tuition fees and, where applicable, accommodation expenses.\n\nI believe such efforts must be guided by transparency and accountability, ensuring that support reaches the students who need it most. More importantly, I hope these opportunities allow young people to focus on their education, develop their abilities, and work towards a future they can shape for themselves."
  },
  Mediapage: {
    f61: 'GALLERY'
  }
};

function updateManifest() {
  for (const [key, fields] of Object.entries(newFields)) {
    Object.assign(manifest.sections[key].fields, fields);
  }
  for (const [key, fields] of Object.entries(contentUpdates)) {
    for (const [fieldId, value] of Object.entries(fields)) {
      const field = manifest.sections[key].fields[fieldId];
      if (!field || !['text', 'link'].includes(field.type)) {
        throw new Error(`Invalid content field ${key}.${fieldId}`);
      }
      field.value = value;
      const labelPrefix = field.label.split(':', 1)[0];
      field.label = `${labelPrefix}: ${value.replace(/\s+/g, ' ').slice(0, 80)}`;
    }
  }
}

function localizedCopy(record, key) {
  const next = structuredClone(record);
  for (const [fieldId, field] of Object.entries(newFields[key] || {})) {
    next.en[fieldId] = field.value;
    next.hi[fieldId] = field.hiValue;
  }
  for (const [fieldId, value] of Object.entries(contentUpdates[key] || {})) {
    next.en[fieldId] = value;
  }
  return validateContent(manifest.sections[key].kind, key, next);
}

const blogTitles = [
  'Why Learning to Handle Rejection Is an Important Part of Growing Up',
  'Will a Stable Career Still Mean the Same Thing for the Next Generation',
  'What Students Learn Outside the Classroom Can Shape Their Future Just as Much',
  'Can Young Entrepreneurs Help Solve Problems in Their Own Communities',
  "What Happens When a Young Person's Passion Does Not Match Their Profession",
  "From Small Towns to Global Opportunities: How Digital Access Is Changing Young Indians' Ambitions"
];

async function addBlogDrafts() {
  let created = 0;
  for (const [index, title] of blogTitles.entries()) {
    const key = `client-blog-${index + 1}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await Content.findOne({
      $or: [{ key }, { 'draft.slug': slug }, { 'published.slug': slug }]
    }).lean();
    if (existing) {
      if (existing.kind === 'post' && (existing.draft?.title === title || existing.published?.title === title)) continue;
      throw new Error(`Cannot create blog draft because ${key} or slug ${slug} already exists`);
    }
    const draft = validateContent('post', key, {
      type: 'article',
      title,
      slug,
      locale: 'en',
      excerpt: '',
      body: '',
      cover: '',
      category: 'Thought Leadership',
      tags: [],
      author: 'Shailendra Bhadauria',
      seoTitle: '',
      seoDescription: '',
      videoUrl: ''
    });
    await Content.create({
      kind: 'post',
      key,
      draft,
      revision: 0,
      trashed: false
    });
    created += 1;
  }
  return created;
}

const config = configFromEnv();
try {
  await initializeDatabase();
  updateManifest();
  const updates = [];
  for (const key of Object.keys(contentUpdates)) {
    const document = await Content.findOne({ kind: manifest.sections[key].kind, key, trashed: false });
    if (!document?.published || !document.draft) throw new Error(`Published CMS page not found: ${key}`);
    const draft = localizedCopy(document.draft, key);
    const published = localizedCopy(document.published, key);
    updates.push({ document, draft, published });
  }
  for (const { document, draft, published } of updates) {
    const result = await Content.updateOne(
      { _id: document._id, revision: document.revision },
      { $set: { draft, published, publishedAt: new Date() }, $inc: { revision: 1 } }
    );
    if (result.matchedCount !== 1) throw new Error(`CMS page changed during update: ${document.key}`);
  }
  const manifestPath = fileURLToPath(new URL('../content-manifest.json', import.meta.url));
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  const draftsCreated = await addBlogDrafts();
  console.log(`Updated ${updates.length} CMS pages and created ${draftsCreated} article drafts.`);
} finally {
  await pool.end();
}
