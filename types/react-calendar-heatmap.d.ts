declare module 'react-calendar-heatmap' {
  export interface CalendarHeatmapProps {
    values: Array<{
      date: string;
      count: number;
    }>;
    startDate: Date;
    endDate: Date;
    classForValue?: (value: any) => string;
    tooltipDataAttrs?: (value: any) => any;
    showWeekdayLabels?: boolean;
    showMonthLabels?: boolean;
    horizontal?: boolean;
    gutterSize?: number;
  }

  export default function CalendarHeatmap(props: CalendarHeatmapProps): JSX.Element;
}
