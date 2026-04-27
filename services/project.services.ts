import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  getDoc,
  where
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface ProjectTeam {
  id?: string;
  name: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  imageUrl: string;
  progress: number;
  milestones?: Milestone[];
  lookingFor: { role: string; iconName: string }[];
  members: string[]; // List of UIDs
  createdAt: any;
  updatedAt: any;
  customRoute?: string;
  location?: { 
    lat: number; 
    lng: number;
    address?: string;
  };
}

const PROJECTS_COLLECTION = "projects";

const DEFAULT_MILESTONES: Milestone[] = [
  { id: "1", title: "Nghiên cứu & Thiết kế", completed: false },
  { id: "2", title: "Xây dựng MVP", completed: false },
  { id: "3", title: "Thử nghiệm Beta", completed: false },
  { id: "4", title: "Launch thị trường", completed: false }
];

export const projectService = {
  async createProject(projectData: Omit<ProjectTeam, "id" | "members" | "createdAt" | "updatedAt">) {
    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...projectData,
      members: [projectData.authorId],
      milestones: DEFAULT_MILESTONES,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getAllProjects() {
    const q = query(collection(db, PROJECTS_COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectTeam));
  },

  async joinProject(projectId: string, userId: string) {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    const snap = await getDoc(projectRef);
    if (!snap.exists()) return;
    
    const members = snap.data().members || [];
    if (!members.includes(userId)) {
      await updateDoc(projectRef, {
        members: [...members, userId]
      });
    }
  },

  async updateMilestone(projectId: string, milestoneId: string, completed: boolean) {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    const snap = await getDoc(projectRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const milestones = (data.milestones || DEFAULT_MILESTONES) as Milestone[];
    const updatedMilestones = milestones.map(m => 
      m.id === milestoneId ? { ...m, completed } : m
    );

    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const progress = Math.round((completedCount / updatedMilestones.length) * 100);

    await updateDoc(projectRef, {
      milestones: updatedMilestones,
      progress,
      updatedAt: serverTimestamp()
    });
  },

  async setMilestones(projectId: string, milestones: Milestone[]) {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    const completedCount = milestones.filter(m => m.completed).length;
    const progress = Math.round((completedCount / milestones.length) * 100);

    await updateDoc(projectRef, {
      milestones,
      progress,
      updatedAt: serverTimestamp()
    });
  },

  async getProjectsByStatus(status: 'building' | 'completed') {
    try {
        const q = query(
            collection(db, PROJECTS_COLLECTION), 
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectTeam));
        
        if (status === 'building') {
            return projects.filter(p => p.progress > 0 && p.progress < 100);
        }
        
        return projects.filter(p => p.progress === 100);
    } catch (error) {
        console.error("Error fetching projects:", error);
        // Fallback for query failures (e.g. index issues)
        const snapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectTeam));
        if (status === 'building') {
            return projects.filter(p => p.progress > 0 && p.progress < 100);
        }
        return projects.filter(p => p.progress === 100);
    }
  },

  async updateLocation(projectId: string, location: { lat: number, lng: number, address?: string }) {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(projectRef, {
      location,
      updatedAt: serverTimestamp()
    });
  },

  async getUserProjects(userId: string) {
    const snapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectTeam));
    return projects.filter(p => p.members?.includes(userId));
  }
};
