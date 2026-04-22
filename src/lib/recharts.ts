import type { ComponentType } from "react";
import {
  Area as RechartsArea,
  AreaChart as RechartsAreaChart,
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  CartesianGrid as RechartsCartesianGrid,
  Cell as RechartsCell,
  Line as RechartsLine,
  LineChart as RechartsLineChart,
  Pie as RechartsPie,
  PieChart as RechartsPieChart,
  ResponsiveContainer as RechartsResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from "recharts";

export const ResponsiveContainer = RechartsResponsiveContainer as unknown as ComponentType<any>;
export const AreaChart = RechartsAreaChart as unknown as ComponentType<any>;
export const Area = RechartsArea as unknown as ComponentType<any>;
export const BarChart = RechartsBarChart as unknown as ComponentType<any>;
export const Bar = RechartsBar as unknown as ComponentType<any>;
export const PieChart = RechartsPieChart as unknown as ComponentType<any>;
export const Pie = RechartsPie as unknown as ComponentType<any>;
export const Cell = RechartsCell as unknown as ComponentType<any>;
export const LineChart = RechartsLineChart as unknown as ComponentType<any>;
export const Line = RechartsLine as unknown as ComponentType<any>;
export const CartesianGrid = RechartsCartesianGrid as unknown as ComponentType<any>;
export const Tooltip = RechartsTooltip as unknown as ComponentType<any>;
export const XAxis = RechartsXAxis as unknown as ComponentType<any>;
export const YAxis = RechartsYAxis as unknown as ComponentType<any>;