export type TeamSlot = {
  role: string;
  emoji: string; // visual icon for the role
  member?: { name: string; initial: string; color: string }; // filled if joined
};

export type Idea = {
  id: string;
  title: string;
  description: string;
  author: string;
  category: string;
  commits: number; // "Tôi sẽ tham gia" votes
  commitGoal: number; // target to unlock recruiting
  comments: number;
  stage: "ideation" | "validating" | "recruiting" | "in-progress" | "completed";
  createdAt: string;
  cover?: string; // gradient class or color theme
  team?: TeamSlot[]; // shown when recruiting / in-progress
  result?: { metric: string; users: string; launchDate: string }; // shown when completed
};

export type Project = {
  id: string;
  ideaId: string;
  title: string;
  description: string;
  founder: string;
  rolesNeeded: { role: string; filled: number; total: number; pay?: string }[];
  progress: number; // 0-100
  stage: "recruiting" | "in-progress" | "completed";
  tags: string[];
  coverImage?: string;
};

export const ideas: Idea[] = [
  {
    id: "i1",
    title: "App ghi chú giọng nói cho freelancer",
    description: "Một app cho phép freelancer ghi nhanh ý tưởng bằng giọng nói khi đang lái xe, tự động chuyển thành task có deadline.",
    author: "Minh Anh",
    category: "Productivity",
    commits: 248,
    commitGoal: 500,
    comments: 42,
    stage: "validating",
    createdAt: "3 ngày trước",
    cover: "from-rose-200 via-orange-100 to-amber-100",
  },
  {
    id: "i2",
    title: "Marketplace đồ ăn quê gửi lên thành phố",
    description: "Kết nối người làm đồ ăn truyền thống ở quê với người con xa nhà ở Sài Gòn, Hà Nội. Ship 2-3 ngày, đặt theo tuần.",
    author: "Quốc Tuấn",
    category: "Marketplace",
    commits: 512,
    commitGoal: 500,
    comments: 87,
    stage: "recruiting",
    createdAt: "1 tuần trước",
    cover: "from-emerald-200 via-teal-100 to-lime-100",
    team: [
      { role: "Founder", emoji: "🚀", member: { name: "Quốc Tuấn", initial: "Q", color: "bg-primary" } },
      { role: "Full-stack Dev", emoji: "💻", member: { name: "Hùng", initial: "H", color: "bg-sage" } },
      { role: "Full-stack Dev", emoji: "💻" },
      { role: "UI/UX Designer", emoji: "🎨" },
      { role: "Marketing Lead", emoji: "📣" },
      { role: "Video Editor", emoji: "🎬" },
    ],
  },
  {
    id: "i3",
    title: "Nền tảng học tiếng Anh qua phim Việt phụ đề kép",
    description: "Xem phim Việt với phụ đề tiếng Anh + tiếng Việt song song, hover từ để dịch và lưu flashcard.",
    author: "Linh Đan",
    category: "Education",
    commits: 134,
    commitGoal: 500,
    comments: 28,
    stage: "ideation",
    createdAt: "2 ngày trước",
    cover: "from-sky-200 via-indigo-100 to-violet-100",
  },
  {
    id: "i4",
    title: "AI viết caption TikTok theo phong cách cá nhân",
    description: "Train trên 20 video gần nhất của bạn để bắt chước giọng văn, sinh caption + hashtag tự động.",
    author: "Hải Yến",
    category: "AI Tools",
    commits: 389,
    commitGoal: 500,
    comments: 56,
    stage: "in-progress",
    createdAt: "5 ngày trước",
    cover: "from-fuchsia-200 via-pink-100 to-rose-100",
    team: [
      { role: "Founder", emoji: "🚀", member: { name: "Hải Yến", initial: "H", color: "bg-primary" } },
      { role: "Prompt Engineer", emoji: "🧠", member: { name: "Long", initial: "L", color: "bg-accent" } },
      { role: "Full-stack Dev", emoji: "💻", member: { name: "Khoa", initial: "K", color: "bg-sage" } },
      { role: "Content Creator", emoji: "✨", member: { name: "My", initial: "M", color: "bg-gold" } },
      { role: "Content Creator", emoji: "✨" },
    ],
  },
  {
    id: "i5",
    title: "Cộng đồng review homestay ẩn ở Việt Nam",
    description: "Map các homestay nhỏ, ít người biết, review thật từ người ở thực sự (không phải KOL).",
    author: "Đức Anh",
    category: "Travel",
    commits: 201,
    commitGoal: 500,
    comments: 33,
    stage: "ideation",
    createdAt: "4 ngày trước",
    cover: "from-amber-200 via-yellow-100 to-orange-100",
  },
  {
    id: "i6",
    title: "App theo dõi chi tiêu cho sinh viên ở trọ",
    description: "Chia tiền nhà, tiền điện, tiền ăn cho nhóm bạn ở chung — tự động nhắc và tổng kết cuối tháng.",
    author: "Phương Thảo",
    category: "Finance",
    commits: 720,
    commitGoal: 500,
    comments: 21,
    stage: "completed",
    createdAt: "6 ngày trước",
    cover: "from-violet-200 via-purple-100 to-pink-100",
    team: [
      { role: "Founder", emoji: "🚀", member: { name: "Phương Thảo", initial: "P", color: "bg-primary" } },
      { role: "React Native Dev", emoji: "📱", member: { name: "Tùng", initial: "T", color: "bg-sage" } },
      { role: "Designer", emoji: "🎨", member: { name: "Mai", initial: "M", color: "bg-gold" } },
    ],
    result: { metric: "8,400+ users", users: "8,400", launchDate: "Tháng 2, 2025" },
  },
];

export const projects: Project[] = [
  {
    id: "p1",
    ideaId: "i2",
    title: "Quê Nhà — Marketplace đồ ăn quê",
    description: "Đã validate 512 commit. Đang tuyển team để build MVP trong 8 tuần.",
    founder: "Quốc Tuấn",
    rolesNeeded: [
      { role: "Full-stack Developer", filled: 1, total: 2, pay: "Equity 5% / có thương lượng" },
      { role: "UI/UX Designer", filled: 0, total: 1, pay: "8-12tr/tháng" },
      { role: "Marketing Lead", filled: 0, total: 1, pay: "Equity 3%" },
      { role: "Video Editor (TikTok)", filled: 0, total: 1, pay: "Theo dự án" },
    ],
    progress: 15,
    stage: "recruiting",
    tags: ["Marketplace", "F&B", "Mobile"],
  },
  {
    id: "p2",
    ideaId: "i4",
    title: "Capz AI — Caption generator",
    description: "Đang phát triển MVP. Cần thêm prompt engineer và content creator để test.",
    founder: "Hải Yến",
    rolesNeeded: [
      { role: "Prompt Engineer", filled: 0, total: 1, pay: "5-8tr/tháng" },
      { role: "Content Creator (tester)", filled: 2, total: 5, pay: "Free + early access" },
    ],
    progress: 45,
    stage: "in-progress",
    tags: ["AI", "Social", "SaaS"],
  },
  {
    id: "p3",
    ideaId: "i6",
    title: "Chia Đều — App chi tiêu nhóm",
    description: "Đã có designer & 1 dev. Cần thêm 1 mobile dev React Native.",
    founder: "Phương Thảo",
    rolesNeeded: [
      { role: "React Native Dev", filled: 0, total: 1, pay: "Equity 10%" },
    ],
    progress: 60,
    stage: "in-progress",
    tags: ["Fintech", "Mobile"],
  },
];

export const completedProjects = [
  {
    id: "c1",
    title: "BookSwap — Đổi sách cũ giữa sinh viên",
    description: "Từ ý tưởng đến launch trong 4 tháng. Hiện 12k user, 30k cuốn sách đã đổi.",
    founder: "Nhóm 5 người",
    metric: "12,000 users",
    launchDate: "Tháng 9, 2024",
    image: "📚",
  },
  {
    id: "c2",
    title: "Bữa Trưa Văn Phòng",
    description: "App đặt bữa trưa theo tuần cho dân văn phòng. Đã có 200+ doanh nghiệp dùng.",
    founder: "Nhóm 7 người",
    metric: "200+ companies",
    launchDate: "Tháng 6, 2024",
    image: "🍱",
  },
  {
    id: "c3",
    title: "Mentor Việt",
    description: "Kết nối mentor & mentee trong ngành tech. 1500+ session đã diễn ra.",
    founder: "Nhóm 4 người",
    metric: "1,500+ sessions",
    launchDate: "Tháng 11, 2024",
    image: "🎯",
  },
];
