import {
  Wrench,
  Zap,
  Sparkles,
  PaintRoller,
  WashingMachine,
  Hammer,
  type LucideIcon,
} from "lucide-react";

export type ServiceId =
  | "plumber"
  | "electrician"
  | "cleaner"
  | "painter"
  | "appliance"
  | "carpenter";

export const services: { id: ServiceId; icon: LucideIcon }[] = [
  { id: "plumber", icon: Wrench },
  { id: "electrician", icon: Zap },
  { id: "cleaner", icon: Sparkles },
  { id: "painter", icon: PaintRoller },
  { id: "appliance", icon: WashingMachine },
  { id: "carpenter", icon: Hammer },
];

export const areas = [
  "Satellite",
  "Bopal",
  "Maninagar",
  "Navrangpura",
  "Vastrapur",
  "Chandkheda",
];

export type Worker = {
  id: string;
  name: string;
  service: ServiceId;
  area: string;
  rating: number;
  reviews: number;
  experience: number;
  visitFee: number;
  phone: string;
  languages: string[];
};

export const workers: Worker[] = [
  { id: "w1", name: "Ramesh Patel", service: "plumber", area: "Satellite", rating: 4.9, reviews: 214, experience: 12, visitFee: 149, phone: "+919812340001", languages: ["Gujarati", "Hindi"] },
  { id: "w2", name: "Sunil Yadav", service: "plumber", area: "Maninagar", rating: 4.6, reviews: 88, experience: 7, visitFee: 129, phone: "+919812340002", languages: ["Hindi", "English"] },
  { id: "w3", name: "Kiran Shah", service: "electrician", area: "Bopal", rating: 4.8, reviews: 156, experience: 9, visitFee: 199, phone: "+919812340003", languages: ["Gujarati", "English"] },
  { id: "w4", name: "Amit Kulkarni", service: "electrician", area: "Navrangpura", rating: 4.7, reviews: 121, experience: 11, visitFee: 179, phone: "+919812340004", languages: ["Marathi", "Hindi"] },
  { id: "w5", name: "Meena Devi", service: "cleaner", area: "Vastrapur", rating: 4.9, reviews: 302, experience: 6, visitFee: 99, phone: "+919812340005", languages: ["Hindi", "Gujarati"] },
  { id: "w6", name: "Lata Bhosale", service: "cleaner", area: "Chandkheda", rating: 4.5, reviews: 64, experience: 4, visitFee: 89, phone: "+919812340006", languages: ["Marathi", "Hindi"] },
  { id: "w7", name: "Imran Sheikh", service: "painter", area: "Maninagar", rating: 4.7, reviews: 97, experience: 14, visitFee: 249, phone: "+919812340007", languages: ["Hindi", "Gujarati"] },
  { id: "w8", name: "Dinesh Solanki", service: "painter", area: "Satellite", rating: 4.4, reviews: 45, experience: 5, visitFee: 199, phone: "+919812340008", languages: ["Gujarati"] },
  { id: "w9", name: "Vikas Chauhan", service: "appliance", area: "Bopal", rating: 4.8, reviews: 188, experience: 10, visitFee: 299, phone: "+919812340009", languages: ["Hindi", "English"] },
  { id: "w10", name: "Rakesh Jadhav", service: "appliance", area: "Navrangpura", rating: 4.6, reviews: 73, experience: 8, visitFee: 279, phone: "+919812340010", languages: ["Marathi", "Hindi", "English"] },
  { id: "w11", name: "Bhavesh Mistry", service: "carpenter", area: "Vastrapur", rating: 4.9, reviews: 141, experience: 16, visitFee: 199, phone: "+919812340011", languages: ["Gujarati", "Hindi"] },
  { id: "w12", name: "Sanjay Rathod", service: "carpenter", area: "Chandkheda", rating: 4.5, reviews: 52, experience: 6, visitFee: 149, phone: "+919812340012", languages: ["Hindi"] },
];
