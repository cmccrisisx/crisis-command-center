import * as React from "react";
import {
  Area as RechartsArea,
  AreaChart as RechartsAreaChart,
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  CartesianGrid as RechartsCartesianGrid,
  Line as RechartsLine,
  LineChart as RechartsLineChart,
  ResponsiveContainer as RechartsResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from "recharts";

export const ResponsiveContainer = RechartsResponsiveContainer as unknown as React.ComponentType<any>;
export const AreaChart = RechartsAreaChart as unknown as React.ComponentType<any>;
export const Area = RechartsArea as unknown as React.ComponentType<any>;
export const BarChart = RechartsBarChart as unknown as React.ComponentType<any>;
export const Bar = RechartsBar as unknown as React.ComponentType<any>;
export const LineChart = RechartsLineChart as unknown as React.ComponentType<any>;
export const Line = RechartsLine as unknown as React.ComponentType<any>;
export const CartesianGrid = RechartsCartesianGrid as unknown as React.ComponentType<any>;
export const Tooltip = RechartsTooltip as unknown as React.ComponentType<any>;
export const XAxis = RechartsXAxis as unknown as React.ComponentType<any>;
export const YAxis = RechartsYAxis as unknown as React.ComponentType<any>;