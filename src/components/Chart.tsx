"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface ChartProps {
  option: echarts.EChartsOption;
  height?: string | number;
  className?: string;
}

export default function Chart({ option, height = 400, className = "" }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current);

    // 设置中国风主题色
    const chineseThemeOption: echarts.EChartsOption = {
      color: [
        "#c94043", // 朱砂红
        "#d4a574", // 金色
        "#4a5568", // 墨色
        "#718096", // 灰色
        "#e8d5b7", // 米色
        "#8b4513", // 褐色
      ],
      backgroundColor: "transparent",
      textStyle: {
        fontFamily: "var(--font-chinese), 'PingFang SC', 'Microsoft YaHei', serif",
      },
      ...option,
    };

    chartInstance.current.setOption(chineseThemeOption);

    // 响应式
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.current?.dispose();
    };
  }, [option]);

  return (
    <div
      ref={chartRef}
      className={`chart-container ${className}`}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    />
  );
}

// 预设的图表类型组件

// 饼图
interface PieChartProps {
  data: { name: string; value: number }[];
  title?: string;
  height?: string | number;
}

export function PieChart({ data, title, height = 300 }: PieChartProps) {
  const option: echarts.EChartsOption = {
    title: title ? {
      text: title,
      left: "center",
      textStyle: { fontSize: 16 },
    } : undefined,
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: "{b}",
        },
        data,
      },
    ],
  };

  return <Chart option={option} height={height} />;
}

// 柱状图
interface BarChartProps {
  data: { name: string; value: number }[];
  title?: string;
  height?: string | number;
  horizontal?: boolean;
}

export function BarChart({ data, title, height = 300, horizontal = false }: BarChartProps) {
  const names = data.map((d) => d.name);
  const values = data.map((d) => d.value);

  const option: echarts.EChartsOption = {
    title: title ? {
      text: title,
      left: "center",
      textStyle: { fontSize: 16 },
    } : undefined,
    tooltip: {
      trigger: "axis",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: horizontal
      ? { type: "value" }
      : { type: "category", data: names },
    yAxis: horizontal
      ? { type: "category", data: names }
      : { type: "value" },
    series: [
      {
        type: "bar",
        data: values,
        itemStyle: {
          borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
        },
      },
    ],
  };

  return <Chart option={option} height={height} />;
}

// 折线图
interface LineChartProps {
  data: { name: string; value: number }[] | { name: string; data: number[] }[];
  xAxisData?: string[];
  title?: string;
  height?: string | number;
  smooth?: boolean;
  area?: boolean;
}

export function LineChart({
  data,
  xAxisData,
  title,
  height = 300,
  smooth = true,
  area = false,
}: LineChartProps) {
  // 判断是单系列还是多系列
  const isMultiSeries = data.length > 0 && "data" in data[0];

  const option: echarts.EChartsOption = {
    title: title ? {
      text: title,
      left: "center",
      textStyle: { fontSize: 16 },
    } : undefined,
    tooltip: {
      trigger: "axis",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisData || (isMultiSeries ? undefined : data.map((d) => (d as { name: string }).name)),
    },
    yAxis: {
      type: "value",
    },
    series: isMultiSeries
      ? (data as { name: string; data: number[] }[]).map((series) => ({
          name: series.name,
          type: "line" as const,
          data: series.data,
          smooth,
          areaStyle: area ? {} : undefined,
        }))
      : [
          {
            type: "line" as const,
            data: (data as { name: string; value: number }[]).map((d) => d.value),
            smooth,
            areaStyle: area ? {} : undefined,
          },
        ],
    legend: isMultiSeries ? { bottom: 0 } : undefined,
  };

  return <Chart option={option} height={height} />;
}

// 雷达图
interface RadarChartProps {
  indicator: { name: string; max: number }[];
  data: { name: string; value: number[] }[];
  title?: string;
  height?: string | number;
}

export function RadarChart({ indicator, data, title, height = 300 }: RadarChartProps) {
  const option: echarts.EChartsOption = {
    title: title ? {
      text: title,
      left: "center",
      textStyle: { fontSize: 16 },
    } : undefined,
    tooltip: {},
    legend: {
      bottom: 0,
      data: data.map((d) => d.name),
    },
    radar: {
      indicator,
      shape: "polygon",
    },
    series: [
      {
        type: "radar",
        data: data.map((d) => ({
          name: d.name,
          value: d.value,
          areaStyle: { opacity: 0.2 },
        })),
      },
    ],
  };

  return <Chart option={option} height={height} />;
}
