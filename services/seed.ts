import { collection, getDocs, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const IDEAS_DATA = [
  {
    title: "AI Personal Wardrobe Stylist",
    problem: "People spend 15 mins daily choosing clothes but only wear 20% of their closet.",
    solution: "An app that scans your closet, tracks usage, and suggests daily outfits based on weather and schedule.",
    authorId: "user_101",
    authorName: "Alex Nguyen",
    authorAvatar: "A",
    category: "AI / Tech",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800",
    votes: ["user_101", "user_102", "user_103"],
    commentCount: 12,
    demandPercentage: 88,
    location: { lat: 21.0285, lng: 105.8542, address: "Hoàn Kiếm, Hà Nội" }
  },
  {
    title: "Eco-Friendly Neighborhood Hub",
    problem: "High carbon footprint from individual grocery deliveries and fragmented recycling.",
    solution: "Hyper-local storage units where neighbors group-buy groceries and share high-end tools.",
    authorId: "user_102",
    authorName: "Sarah Do",
    authorAvatar: "S",
    category: "Sustainability",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
    votes: ["user_101", "user_102"],
    commentCount: 24,
    demandPercentage: 94,
    location: { lat: 21.0333, lng: 105.8500, address: "Ba Đình, Hà Nội" }
  }
];

const PROJECTS_DATA = [
  {
    name: "EcoFridge System",
    authorId: "user_101",
    authorName: "Alex Nguyen",
    authorAvatar: "A",
    category: "Deep Tech / IoT",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800",
    progress: 35,
    lookingFor: [
        { role: "C/C++ Expert", iconName: "Code" },
        { role: "UI Designer", iconName: "Layers" },
        { role: "Backend Node", iconName: "Zap" }
    ],
    members: ["user_101", "user_102"],
    location: { lat: 21.0123, lng: 105.8000, address: "Cầu Giấy, Hà Nội" }
  },
  {
    name: "Zen Kids Studio",
    authorId: "user_103",
    authorName: "Victor Vu",
    authorAvatar: "V",
    category: "EdTech / Media",
    imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800",
    progress: 60,
    lookingFor: [
        { role: "Video Editor", iconName: "Video" },
        { role: "Growth Hacker", iconName: "Megaphone" },
        { role: "Content Creator", iconName: "Briefcase" }
    ],
    members: ["user_103"],
    location: { lat: 21.0500, lng: 105.7800, address: "Nam Từ Liêm, Hà Nội" }
  },
  {
    id: "proj_media_1",
    name: "CineTrack - Quản lý đoàn phim",
    authorId: "user_102",
    authorName: "Sarah Do",
    authorAvatar: "S",
    category: "Cinema",
    imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800",
    progress: 100,
    status: 'completed',
    lookingFor: [],
    members: ["user_101", "user_102", "user_103"],
    location: { lat: 10.7769, lng: 106.7009, address: "Quận 1, TP. HCM" }
  },
  {
    id: "proj_college_1",
    name: "Cộng đồng Sinh viên CĐ Nghề Khánh Hòa",
    authorId: "admin_test",
    authorName: "BCH Đoàn Trường",
    authorAvatar: "D",
    category: "SaaS / App",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800",
    progress: 100,
    status: 'completed',
    lookingFor: [],
    members: ["user_101", "user_102", "user_103", "user_104"],
    customRoute: "/caodangnghe",
    location: { lat: 12.2154, lng: 109.1832, address: "Phước Đồng, Nha Trang, Khánh Hòa" }
  },
  {
    id: "proj_campus_1",
    name: "CĐ Công nghệ - Năng lượng (Active Community)",
    authorId: "admin_test",
    authorName: "Hội Sinh Viên",
    authorAvatar: "H",
    category: "Other",
    imageUrl: "https://images.unsplash.com/photo-1523240715632-d984bc4dd953?auto=format&fit=crop&q=80&w=800",
    progress: 100,
    status: 'completed',
    lookingFor: [],
    members: ["user_101", "user_102", "user_103", "user_104"],
    customRoute: "/caodangnghe",
    location: { lat: 12.2154, lng: 109.1832, address: "Phước Đồng, Nha Trang, Khánh Hòa" }
  }
];

const USERS_DATA = [
    {
      uid: "user_101",
      displayName: "Alex Nguyen",
      email: "alex@example.com",
      photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      role: "Fullstack Developer",
      bio: "Đam mê xây dựng MVP tốc độ cao. Đã launch 5 sản phẩm đạt 1k+ users.",
      skills: ["React", "Node.js", "Python"],
      availability: "Sẵn sàng",
      rating: 4.9,
    },
    {
      uid: "user_102",
      displayName: "Sarah Do",
      email: "sarah@example.com",
      photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      role: "Growth Marketer",
      bio: "Chuyên gia scale up startup từ con số 0. Hỗ trợ xây dựng cộng đồng sớm.",
      skills: ["Ads", "SEO", "Content"],
      availability: "Đang bận",
      rating: 4.8,
    },
    {
        uid: "user_103",
        displayName: "Victor Vu",
        email: "victor@example.com",
        photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
        role: "Video Editor",
        bio: "Phù thủy dựng video ngắn thu hút hàng triệu view trên TikTok.",
        skills: ["Premiere", "After Effects", "TikTok"],
        availability: "Sẵn sàng",
        rating: 5.0,
      }
  ];

const CAMPUS_STUDENTS = [
    { id: "s1", name: "Nguyễn Minh Hòa", faculty: "cntt", bio: "Học Code để sau này code App giúp trường.", avatar: "https://i.pravatar.cc/150?u=1", hearts: 124, waves: 45, isTrending: true, rank: 1 },
    { id: "s2", name: "Trần Thanh Thảo", faculty: "dulich", bio: "Ước mơ làm HDV đưa khách đi khắp Nha Trang.", avatar: "https://i.pravatar.cc/150?u=2", hearts: 342, waves: 120, isTrending: true, rank: 2 },
    { id: "s3", name: "Lê Văn Tiến", faculty: "dien", bio: "Thợ điện năng lượng mặt trời tương lai.", avatar: "https://i.pravatar.cc/150?u=3", hearts: 89, waves: 23, rank: 3 },
    { id: "s4", name: "Phạm Hồng Nhung", faculty: "cntt", bio: "Front-end Dev / UI/UX Lover.", avatar: "https://i.pravatar.cc/150?u=4", hearts: 215, waves: 67 },
    { id: "s5", name: "Hoàng Gia Bảo", faculty: "cokhi", bio: "Đam mê động cơ và máy móc hạng nặng.", avatar: "https://i.pravatar.cc/150?u=5", hearts: 156, waves: 89 },
    { id: "s6", name: "Đặng Thùy Trang", faculty: "dulich", bio: "Đại sứ sinh viên 2024.", avatar: "https://i.pravatar.cc/150?u=6", hearts: 567, waves: 234, isTrending: true },
];

export const seedDatabase = async () => {
  // Users
  const usersSnap = await getDocs(collection(db, "users"));
  if (usersSnap.empty) {
    console.log("Seeding users...");
    for (const user of USERS_DATA) {
      await setDoc(doc(db, "users", user.uid), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  }

  // Ideas
  const ideasSnap = await getDocs(collection(db, "ideas"));
  if (ideasSnap.empty) {
    console.log("Seeding ideas...");
    for (const idea of IDEAS_DATA) {
      await addDoc(collection(db, "ideas"), {
        ...idea,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  }

  // Projects
  const projectsSnap = await getDocs(collection(db, "projects"));
  if (projectsSnap.empty) {
    console.log("Seeding projects...");
    for (const project of PROJECTS_DATA) {
      await addDoc(collection(db, "projects"), {
        ...project,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  }

  // Campus Students
  const campusSnap = await getDocs(collection(db, "campus_students"));
  if (campusSnap.empty) {
    console.log("Seeding campus students...");
    for (const student of CAMPUS_STUDENTS) {
      await setDoc(doc(db, "campus_students", student.id), {
        ...student,
        createdAt: serverTimestamp()
      });
    }
  }
};
