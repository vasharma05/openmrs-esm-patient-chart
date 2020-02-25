import React, { FunctionComponent } from "react";
import styles from "./dashboard.css";
import Widget from "../widget/widget.component";

export default function Dashboard(props: DashboardProps) {
  const [widgets, setWidgets] = React.useState([]);

  React.useEffect(() => {
    //loadDashboardFromConfig(props.dashboardConfig);

    const widgets = [];
    let widget;
    props.dashboardConfig.widgets.forEach((widgetConfig, index) => {
      widget = <Widget widgetConfig={widgetConfig} />;
      widgetConfig.component = () => <Widget widgetConfig={widgetConfig} />;
      widgets.push(widgetConfig);
    });
    setWidgets(widgets);
  }, [props.dashboardConfig]);

  function getColumnsLayoutStyle(): string {
    const numberOfColumns =
      props.dashboardConfig &&
      props.dashboardConfig.layout &&
      props.dashboardConfig.layout.columns
        ? props.dashboardConfig.layout.columns
        : 2;

    return String("1fr ")
      .repeat(numberOfColumns)
      .trimRight();
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.dashboard}
        style={{ gridTemplateColumns: getColumnsLayoutStyle() || 2 }}
      >
        {widgets.map((widget, index) => {
          let W = widget;
          let rows = widget.layout && (widget.layout.rowSpan || 1);
          let columns = widget.layout && (widget.layout.columnSpan || 1);
          return (
            <div
              key={index}
              className={styles.widgetContainer}
              style={{
                gridRow: `span ${rows}`,
                gridColumn: `span ${columns}`
              }}
            >
              {widget.component && widget.component()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type DashboardProps = {
  dashboardConfig: DashboardConfigType;
};

type GridSizeType = {
  gridRow: string;
  gridColumn: string;
};

export type DashboardConfigType = {
  name: string;
  title?: string;
  layout?: {
    columns: number;
  };
  widgets: WidgetConfigType[];
};

export type WidgetConfigType = {
  name: string;
  path?: string;
  esModule?: string;
  layout?: {
    rowSpan?: number;
    columnSpan?: number;
  };
  component?: Function;
};
