// src/RootErrorBoundary.tsx
import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message?: string;
};

export class RootErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.log("🔥 RN render error:", error.message);
    console.log("📍 Component stack:", info.componentStack);

    this.setState({ hasError: true, message: error.message });
  }

  render() {
    if (this.state.hasError) {
      // Puedes personalizar esta vista si quieres
      return (
        <></>
      );
    }
    return this.props.children;
  }
}
