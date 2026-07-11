import {
  Badge,
  Handshake,
  HeartHandshake,
  Info,
  Map,
  PlaneLanding,
  Sparkles,
} from "lucide-react";

export const DEFAULT_INFO_ICON = "info";

export const INFO_ICON_OPTIONS = [
  { key: "badge", label: "Badge", icon: Badge },
  { key: "flight_land", label: "Travel", icon: PlaneLanding },
  { key: "map", label: "Map", icon: Map },
  { key: "handshake", label: "Handshake", icon: Handshake },
  { key: "volunteer_activism", label: "Charity", icon: HeartHandshake },
  { key: "auto_awesome", label: "Sparkles", icon: Sparkles },
  { key: "info", label: "Info", icon: Info },
];

const iconMap = Object.fromEntries(INFO_ICON_OPTIONS.map((item) => [item.key, item.icon]));

export const getInfoIcon = (key = DEFAULT_INFO_ICON) =>
  iconMap[key] || iconMap[DEFAULT_INFO_ICON];
